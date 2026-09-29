import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodDonation } from '@/models/BloodDonation';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { BloodRequest } from '@/models/BloodRequest';
import { Notification } from '@/models/Notification';
import { calculateNextEligibleDate } from '@/lib/utils';
import { BloodGroup, BloodRequestStatus, DonationStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      donationDate = new Date().toISOString(),
      donationTime = '',
      givenTo = '',
      recipientName = '',
      recipientId = null,
      hospitalName = '',
      location = '',
      notes = '',
      unitsDonated = 1,
      bloodRequestId,
      donorUserId,
    } = body;

    await connectToDatabase();

    const currentUserId = (session.user as any).id;
    let targetDonorUserId = currentUserId;

    // If confirmation is coming from a Blood Request
    let targetRequest = null;
    if (bloodRequestId) {
      targetRequest = await BloodRequest.findById(bloodRequestId);
      if (!targetRequest) {
        return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
      }

      // If requester/admin is confirming donation for a specific donor
      if (donorUserId && donorUserId !== currentUserId) {
        const isRequester = targetRequest.requesterId.toString() === currentUserId;
        const isAdmin = (session.user as any).role === 'admin';
        if (!isRequester && !isAdmin) {
          return NextResponse.json(
            { error: 'Only the requester or admin can confirm a donation for another donor' },
            { status: 403 }
          );
        }
        targetDonorUserId = donorUserId;
      }
    }

    // Find donor user and profile
    const donorUser = await User.findById(targetDonorUserId);
    if (!donorUser) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    const donorProfile = await AlumniProfile.findOne({ userId: targetDonorUserId });
    if (!donorProfile) {
      return NextResponse.json({ error: 'Donor profile not found' }, { status: 404 });
    }

    const actualDonationDate = new Date(donationDate);
    const calculatedNextEligibleDate = calculateNextEligibleDate(actualDonationDate);
    const actualBloodGroup = body.bloodGroup || donorProfile.bloodGroup || donorUser.bloodGroup || BloodGroup.O_POSITIVE;
    const actualLocation = location || donorProfile.donorLocation || donorProfile.location || '';
    const actualHospital = hospitalName || (targetRequest ? targetRequest.hospitalName : '');
    const actualRecipientName = recipientName || givenTo || (targetRequest ? targetRequest.patientName : '');
    const actualRecipientId = recipientId || (targetRequest ? targetRequest.requesterId : undefined);

    // 1. Create BloodDonation record
    const donation = await BloodDonation.create({
      donorId: targetDonorUserId,
      bloodRequestId: bloodRequestId || undefined,
      recipientId: actualRecipientId || undefined,
      recipientName: actualRecipientName,
      donationDate: actualDonationDate,
      donationTime: donationTime || undefined,
      nextEligibleDate: calculatedNextEligibleDate,
      bloodGroup: actualBloodGroup,
      unitsDonated: Number(unitsDonated) || 1,
      hospitalName: actualHospital,
      location: actualLocation,
      notes,
      confirmedBy: currentUserId,
    });

    // 2. Update Donor's Profile to Temporarily Unavailable and set nextEligibleDate (+3 months)
    donorProfile.lastDonationDate = actualDonationDate;
    donorProfile.nextEligibleDate = calculatedNextEligibleDate;
    donorProfile.donationStatus = DonationStatus.TEMPORARILY_UNAVAILABLE;
    if (!donorProfile.bloodGroup) {
      donorProfile.bloodGroup = actualBloodGroup;
    }
    await donorProfile.save();

    // 3. If connected to a BloodRequest, update units and fulfillment status
    if (targetRequest) {
      const unitsNum = Number(unitsDonated) || 1;
      targetRequest.fulfilledUnits = (targetRequest.fulfilledUnits || 0) + unitsNum;

      if (targetRequest.fulfilledUnits >= targetRequest.requiredUnits) {
        targetRequest.status = BloodRequestStatus.FULFILLED;
      } else if (targetRequest.fulfilledUnits > 0) {
        targetRequest.status = BloodRequestStatus.PARTIALLY_FULFILLED;
      }
      await targetRequest.save();

      // Notify Requester if current user is the donor
      if (targetRequest.requesterId.toString() !== currentUserId) {
        await Notification.create({
          userId: targetRequest.requesterId,
          title: 'Donation Confirmed for Your Blood Request',
          message: `${donorUser.name} has recorded a confirmed blood donation of ${unitsNum} unit(s) at ${actualHospital || 'the hospital'}. Remaining needed: ${Math.max(0, targetRequest.requiredUnits - targetRequest.fulfilledUnits)} unit(s).`,
          type: 'blood_request',
          link: `/blood-requests/${targetRequest._id}`,
        });
      }
    }

    // In-app Notification for the donor with their next eligible date
    await Notification.create({
      userId: targetDonorUserId,
      title: '🩸 Blood Donation Recorded — Thank You!',
      message: `Your donation on ${actualDonationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} has been recorded. Your next eligible donation date is ${calculatedNextEligibleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      type: 'blood_donation',
      link: '/profile',
    });

    return NextResponse.json({
      success: true,
      donation,
      nextEligibleDate: calculatedNextEligibleDate,
      message: 'Donation recorded successfully',
    });
  } catch (error: any) {
    console.error('Error recording blood donation:', error);
    return NextResponse.json({ error: error.message || 'Failed to record blood donation' }, { status: 500 });
  }
}
