import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { BloodContactRequest } from '@/models/BloodContactRequest';
import { Notification } from '@/models/Notification';
import { BloodContactSchema } from '@/lib/validations';
import mongoose from 'mongoose';

import { BloodRequest } from '@/models/BloodRequest';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { canUserInteract } from '@/lib/block-service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to contact a donor' }, { status: 401 });
    }

    const requesterId = (session.user as any).id;
    const body = await req.json();
    const validatedData = BloodContactSchema.parse(body);

    await connectToDatabase();

    // Verify donor exists and has consent enabled
    let donorProfile = await AlumniProfile.findById(validatedData.donorId);
    if (!donorProfile) {
      donorProfile = await AlumniProfile.findOne({ userId: validatedData.donorId });
    }

    if (!donorProfile || !donorProfile.isBloodDonor || !donorProfile.bloodDonationConsent) {
      return NextResponse.json(
        { error: 'This member is currently not accepting blood donation inquiries' },
        { status: 400 }
      );
    }

    const donorUserId = donorProfile.userId?.toString() || (donorProfile.userId as any)?._id?.toString();
    const donorProfileId = donorProfile._id?.toString();
    const requesterIdStr = requesterId?.toString();

    if (
      (donorUserId && donorUserId === requesterIdStr) ||
      (donorProfileId && donorProfileId === requesterIdStr) ||
      validatedData.donorId?.toString() === requesterIdStr
    ) {
      return NextResponse.json(
        { error: 'You cannot send a blood donation request to your own profile' },
        { status: 400 }
      );
    }

    // Check blocking restrictions
    if (donorUserId) {
      const interactionCheck = await canUserInteract(requesterId, donorUserId);
      if (!interactionCheck.allowed) {
        return NextResponse.json(
          { error: interactionCheck.reason || 'Cannot contact this donor due to blocking restrictions' },
          { status: 403 }
        );
      }
    }

    const donorUser = await User.findById(donorUserId);

    // Create the contact request
    const contactRecord = await BloodContactRequest.create({
      donorUserId,
      requesterId,
      bloodRequestId: validatedData.bloodRequestId ? new mongoose.Types.ObjectId(validatedData.bloodRequestId) : undefined,
      reason: validatedData.reason,
      patientName: validatedData.patientName,
      bloodGroup: validatedData.bloodGroup,
      hospitalName: validatedData.hospitalName,
      hospitalLocation: validatedData.hospitalLocation,
      urgency: validatedData.urgency,
      message: validatedData.message,
      contactPhone: validatedData.contactPhone,
      status: 'Pending',
    });

    // If tied to a BloodRequest, track this donor in BloodRequest.contactedDonors and BloodRequestResponse
    if (validatedData.bloodRequestId && mongoose.Types.ObjectId.isValid(validatedData.bloodRequestId)) {
      // 1. Upsert BloodRequestResponse
      await BloodRequestResponse.findOneAndUpdate(
        {
          bloodRequestId: validatedData.bloodRequestId,
          donorId: donorUserId,
        },
        {
          bloodRequestId: validatedData.bloodRequestId,
          donorId: donorUserId,
          donorProfileId: donorProfile._id,
          requesterId,
          status: 'pending',
          message: validatedData.message,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 2. Track in BloodRequest.contactedDonors
      await BloodRequest.findByIdAndUpdate(validatedData.bloodRequestId, {
        $push: {
          contactedDonors: {
            donorId: donorProfile._id,
            donorUserId: donorUserId,
            donorName: donorUser?.name || 'Alumni Donor',
            donorPhone: donorUser?.phone || donorProfile.phone || validatedData.contactPhone,
            donorBloodGroup: donorProfile.bloodGroup || validatedData.bloodGroup,
            donorImage: donorUser?.image || '',
            donorLocation: donorProfile.donorLocation || donorProfile.location || '',
            contactedAt: new Date(),
            status: 'Pending',
            message: validatedData.message,
            contactedBy: requesterId,
          },
        },
      });
    }

    // Create a real MongoDB notification for the donor
    const requesterName = session.user.name || 'An alumni member';
    await Notification.create({
      userId: donorUserId,
      type: 'blood_contact',
      title: `🩸 Urgent ${validatedData.bloodGroup} Blood Request from ${requesterName}`,
      message: `${requesterName} has requested your blood donation for ${validatedData.patientName} at ${validatedData.hospitalName}. Please review and respond.`,
      link: validatedData.bloodRequestId ? `/blood-requests/${validatedData.bloodRequestId}` : '/profile',
      read: false,
    });

    return NextResponse.json(
      {
        message: 'Your blood donation request has been securely delivered to the donor.',
        requestId: contactRecord._id,
        donorName: donorUser?.name || 'Donor',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error sending blood contact request:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to send donor inquiry' },
      { status: 500 }
    );
  }
}
