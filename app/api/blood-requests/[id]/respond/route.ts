import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { isCompatibleDonor } from '@/lib/blood-compatibility';
import mongoose from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to respond to this request' }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
    }

    const body = await req.json();
    const { action, message, declineReason } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: "Action must be either 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const request = await BloodRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    // Self-Acceptance / Response Prevention Rule
    if (request.requesterId.toString() === userId.toString()) {
      return NextResponse.json(
        { error: 'You cannot accept or decline your own blood request' },
        { status: 400 }
      );
    }

    // Verify blood request is active
    if (request.status === 'Cancelled') {
      return NextResponse.json(
        { error: 'This blood request has been cancelled by the requester' },
        { status: 400 }
      );
    }

    if (request.status === 'Fulfilled') {
      return NextResponse.json(
        { error: 'This blood request has already been fulfilled' },
        { status: 400 }
      );
    }

    // Duplicate acceptance prevention
    if (
      action === 'accept' &&
      request.status === 'Accepted' &&
      request.acceptedByUserId &&
      request.acceptedByUserId.toString() !== userId.toString()
    ) {
      return NextResponse.json(
        {
          error: `This blood request has already been accepted by another donor (${request.acceptedByName || 'an alumni donor'}).`,
        },
        { status: 400 }
      );
    }

    const [donorProfile, donorUser] = await Promise.all([
      AlumniProfile.findOne({ userId }),
      User.findById(userId),
    ]);

    const donorBloodGroup = donorProfile?.bloodGroup || donorUser?.bloodGroup || (session.user as any).bloodGroup;

    if (action === 'accept' && donorBloodGroup && !isCompatibleDonor(donorBloodGroup, request.bloodGroup)) {
      return NextResponse.json(
        {
          error: `Your blood group (${donorBloodGroup}) is not compatible with the requested blood group (${request.bloodGroup}).`,
        },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const now = new Date();
    const donorName = donorUser?.name || session.user.name || 'An alumni donor';
    const isAccepted = action === 'accept';

    // 1. Update the BloodRequest status & acceptedBy fields
    if (isAccepted) {
      request.status = 'Accepted' as any;
      request.acceptedByUserId = new mongoose.Types.ObjectId(userId) as any;
      request.acceptedByDonorId = donorProfile?._id as any;
      request.acceptedByName = donorName;
      request.acceptedByPhone = donorUser?.phone || donorProfile?.phone || '';
      request.acceptedByImage = donorUser?.image || '';
      request.acceptedAt = now;
    } else {
      // If declining after having previously accepted, reset back to Open
      if (request.acceptedByUserId && request.acceptedByUserId.toString() === userId.toString()) {
        request.status = 'Open' as any;
        request.acceptedByUserId = undefined;
        request.acceptedByDonorId = undefined;
        request.acceptedByName = undefined;
        request.acceptedByPhone = undefined;
        request.acceptedByImage = undefined;
        request.acceptedAt = undefined;
      }
    }

    // 2. Upsert the BloodRequestResponse record
    const updatedResponse = await BloodRequestResponse.findOneAndUpdate(
      { bloodRequestId: id, donorId: userId },
      {
        bloodRequestId: id,
        donorId: userId,
        donorProfileId: donorProfile?._id,
        requesterId: request.requesterId,
        status: newStatus,
        message: message || '',
        declineReason: action === 'decline' ? (declineReason || message || '') : '',
        respondedAt: now,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 3. Synchronize request.contactedDonors
    const existingContactIndex = (request.contactedDonors || []).findIndex((cd: any) => {
      const cdDonorUserId = cd.donorUserId?._id?.toString() || cd.donorUserId?.toString();
      const cdDonorId = cd.donorId?._id?.toString() || cd.donorId?.toString();
      return cdDonorUserId === userId.toString() || (donorProfile?._id && cdDonorId === donorProfile._id.toString());
    });

    const contactStatus = isAccepted ? 'Accepted' : 'Declined';

    if (existingContactIndex >= 0) {
      request.contactedDonors![existingContactIndex].status = contactStatus;
      request.contactedDonors![existingContactIndex].contactedAt = now;
      if (message || declineReason) {
        request.contactedDonors![existingContactIndex].message = message || declineReason;
      }
    } else {
      request.contactedDonors = request.contactedDonors || [];
      request.contactedDonors.push({
        donorId: donorProfile?._id,
        donorUserId: new mongoose.Types.ObjectId(userId),
        donorName: donorUser?.name || 'Alumni Donor',
        donorPhone: donorUser?.phone || donorProfile?.phone || '',
        donorBloodGroup: donorProfile?.bloodGroup || donorUser?.bloodGroup || request.bloodGroup,
        donorImage: donorUser?.image || '',
        donorLocation: donorProfile?.donorLocation || donorProfile?.location || '',
        contactedAt: now,
        status: contactStatus,
        message: message || declineReason || '',
        contactedBy: request.requesterId,
      });
    }

    await request.save();

    // 4. Dispatch Notification to Requester
    try {
      await Notification.create({
        userId: request.requesterId,
        type: 'request_status',
        title: isAccepted
          ? `✅ ${donorName} accepted your blood request!`
          : `⚠️ ${donorName} declined your blood request`,
        message: isAccepted
          ? `${donorName} (${donorUser?.phone || 'Contact provided'}) has accepted your ${request.bloodGroup} blood request for ${request.patientName} at ${request.hospitalName}.`
          : `${donorName} was unable to accept your blood request for ${request.patientName}.${declineReason ? ` Reason: "${declineReason}"` : ''}`,
        link: `/blood-requests/${id}`,
        read: false,
      });
    } catch (notifErr) {
      console.error('Non-blocking notification error:', notifErr);
    }

    return NextResponse.json({
      message: isAccepted
        ? 'You have successfully accepted this blood request! The requester has been notified.'
        : 'You have declined this blood request.',
      response: updatedResponse,
    });
  } catch (error: any) {
    console.error('Error responding to blood request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to respond to blood request' },
      { status: 500 }
    );
  }
}
