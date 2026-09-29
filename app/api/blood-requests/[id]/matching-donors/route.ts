import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { getCompatibleDonors } from '@/lib/blood-compatibility';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;
    const excludeParamUserId = searchParams.get('excludeUserId');

    const request = await BloodRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    const now = new Date();
    const compatibleBloodGroups = getCompatibleDonors(request.bloodGroup);

    // Query MongoDB for matching opted-in donors who are currently eligible
    const query: any = {
      bloodGroup: { $in: compatibleBloodGroups },
      isBloodDonor: true,
      bloodDonationConsent: true,
      donationStatus: { $ne: 'Not Available' },
      $or: [
        { nextEligibleDate: { $exists: false } },
        { nextEligibleDate: null },
        { nextEligibleDate: { $lte: now } },
      ],
    };

    // Collect all user IDs that MUST be excluded (logged-in user, requested excludeUserId, and requester)
    const excludedUserIdsSet = new Set<string>();
    if (sessionUserId) excludedUserIdsSet.add(sessionUserId.toString());
    if (excludeParamUserId) excludedUserIdsSet.add(excludeParamUserId.toString());
    if (request.requesterId) excludedUserIdsSet.add(request.requesterId.toString());

    const excludedObjectIds = Array.from(excludedUserIdsSet)
      .filter((uid) => mongoose.Types.ObjectId.isValid(uid))
      .map((uid) => new mongoose.Types.ObjectId(uid));

    if (excludedObjectIds.length === 1) {
      query.userId = { $ne: excludedObjectIds[0] };
    } else if (excludedObjectIds.length > 1) {
      query.userId = { $nin: excludedObjectIds };
    }

    const rawDonors = await AlumniProfile.find(query)
      .populate('userId', 'name image isVerified phone email')
      .lean();

    // Extra layer of frontend/backend security filtering
    const potentialDonors = rawDonors.filter((donor: any) => {
      const donorUserId = donor.userId?._id?.toString() || donor.userId?.toString();
      const donorProfileId = donor._id?.toString();
      if (donorUserId && excludedUserIdsSet.has(donorUserId)) return false;
      if (donorProfileId && excludedUserIdsSet.has(donorProfileId)) return false;
      return true;
    });

    // Build map of contacted donors for this request
    const contactedMap = new Map();
    (request.contactedDonors || []).forEach((cd: any) => {
      if (cd.donorUserId) contactedMap.set(cd.donorUserId.toString(), cd);
      if (cd.donorId) contactedMap.set(cd.donorId.toString(), cd);
    });

    // Sort by location relevance (hospital location matching first)
    const hospitalCity = (request.hospitalLocation || '').toLowerCase();

    const rankedDonors = potentialDonors.map((donor: any) => {
      const donorCity = (donor.donorLocation || donor.location || '').toLowerCase();
      let matchScore = 1;

      if (donorCity && hospitalCity && (donorCity.includes(hospitalCity) || hospitalCity.includes(donorCity))) {
        matchScore = 3; // exact city/district match
      } else if (donorCity && hospitalCity.split(',').some((part) => donorCity.includes(part.trim()))) {
        matchScore = 2; // regional match
      }

      const contactedInfo =
        contactedMap.get(donor._id.toString()) ||
        (donor.userId ? contactedMap.get(donor.userId._id.toString()) : null);

      return {
        ...donor,
        matchScore,
        dynamicStatus: 'Available',
        isEligibleDate: true,
        hasReceivedRequest: !!contactedInfo,
        contactedAt: contactedInfo ? contactedInfo.contactedAt : null,
        contactStatus: contactedInfo ? contactedInfo.status : null,
      };
    });

    rankedDonors.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      request: {
        id: request._id,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        requiredUnits: request.requiredUnits,
        hospitalName: request.hospitalName,
        hospitalLocation: request.hospitalLocation,
        urgency: request.urgency,
      },
      matchCount: rankedDonors.length,
      donors: rankedDonors,
    });
  } catch (error: any) {
    console.error('Error matching donors:', error);
    return NextResponse.json(
      { error: 'Failed to match blood donors' },
      { status: 500 }
    );
  }
}
