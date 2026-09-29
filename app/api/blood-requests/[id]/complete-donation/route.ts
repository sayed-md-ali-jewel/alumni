import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { BloodDonation } from '@/models/BloodDonation';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import { BloodRequestStatus } from '@/lib/types';
import mongoose from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const currentUserId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
    }

    const body = await req.json();
    const { donorId, unitsDonated = 1, notes = '', donationDate, donationTime = '' } = body;

    if (!donorId || !mongoose.Types.ObjectId.isValid(donorId)) {
      return NextResponse.json({ error: 'A valid donor ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const request = await BloodRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    // Authorization: Must be requester or admin
    if (request.requesterId.toString() !== currentUserId && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only the requester or an administrator can mark a donation as completed' },
        { status: 403 }
      );
    }

    const donorUser = await User.findById(donorId);
    if (!donorUser) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    const completedDate = donationDate ? new Date(donationDate) : new Date();
    // 3-Month Eligibility Rule: 90 days after donation
    const nextEligibleDate = new Date(completedDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    const donorProfile = await AlumniProfile.findOne({ userId: donorId });

    // 1. Update/Upsert BloodRequestResponse
    const updatedResponse = await BloodRequestResponse.findOneAndUpdate(
      { bloodRequestId: id, donorId },
      {
        bloodRequestId: id,
        donorId,
        donorProfileId: donorProfile?._id,
        requesterId: request.requesterId,
        status: 'completed',
        completedAt: completedDate,
        respondedAt: completedDate,
        unitsDonated: Number(unitsDonated) || 1,
        notes: notes || `Donation verified for ${request.patientName}`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Update Donor's Profile with Rest Schedule
    if (donorProfile) {
      donorProfile.lastDonationDate = completedDate;
      donorProfile.nextEligibleDate = nextEligibleDate;
      donorProfile.donationStatus = 'Recently Donated' as any;
      await donorProfile.save();
    }

    // 3. Create Official BloodDonation History Record
    const donationRecord = await BloodDonation.create({
      donorId,
      bloodRequestId: id,
      recipientId: request.requesterId,
      recipientName: request.patientName,
      donationDate: completedDate,
      donationTime: donationTime || undefined,
      nextEligibleDate,
      bloodGroup: request.bloodGroup,
      unitsDonated: Number(unitsDonated) || 1,
      hospitalName: request.hospitalName,
      location: request.hospitalLocation,
      notes: notes || `Blood donation completed for patient ${request.patientName}`,
      confirmedBy: currentUserId,
    });

    // 4. Update BloodRequest Units & Status
    const unitsAdded = Number(unitsDonated) || 1;
    const currentFulfilled = Number(request.fulfilledUnits) || 0;
    const newFulfilled = currentFulfilled + unitsAdded;
    request.fulfilledUnits = newFulfilled;

    if (newFulfilled >= request.requiredUnits) {
      request.status = BloodRequestStatus.FULFILLED;
    } else {
      request.status = BloodRequestStatus.PARTIALLY_FULFILLED;
    }

    // Synchronize contactedDonors entry if present
    const contactIndex = (request.contactedDonors || []).findIndex(
      (cd: any) => cd.donorUserId?.toString() === donorId.toString()
    );
    if (contactIndex >= 0) {
      request.contactedDonors![contactIndex].status = 'Accepted';
    }

    await request.save();

    // 5. Notify Donor of Verification & Eligibility
    try {
      const formattedNextDate = nextEligibleDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      await Notification.create({
        userId: donorId,
        type: 'blood_donation',
        title: '🩸 Blood Donation Verified — Thank You!',
        message: `Your blood donation for ${request.patientName} at ${request.hospitalName} has been confirmed. Thank you for saving a life! Your next eligible donation date is ${formattedNextDate}.`,
        link: '/profile',
        read: false,
      });
    } catch (notifErr) {
      console.error('Non-blocking notification dispatch error:', notifErr);
    }

    return NextResponse.json({
      message: 'Blood donation successfully confirmed and recorded!',
      response: updatedResponse,
      donationRecord,
      request,
    });
  } catch (error: any) {
    console.error('Error completing blood donation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete blood donation' },
      { status: 500 }
    );
  }
}
