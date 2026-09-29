import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { ALUMNI_GROUPS, BLOOD_GROUPS, DONATION_STATUSES } from '@/lib/types';
import mongoose from 'mongoose';

import { getDonorDynamicStatus } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const bloodGroup = searchParams.get('bloodGroup');
    const group = searchParams.get('group');
    const location = searchParams.get('location');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;
    const excludeParamUserId = searchParams.get('excludeUserId');

    // Determine user ID to exclude
    const excludedUserIdsSet = new Set<string>();
    if (sessionUserId) excludedUserIdsSet.add(sessionUserId.toString());
    if (excludeParamUserId) excludedUserIdsSet.add(excludeParamUserId.toString());

    const excludedObjectIds = Array.from(excludedUserIdsSet)
      .filter((uid) => mongoose.Types.ObjectId.isValid(uid))
      .map((uid) => new mongoose.Types.ObjectId(uid));

    const now = new Date();

    const query: any = {
      isBloodDonor: true,
      bloodDonationConsent: { $ne: false },
    };

    // Exclude logged in user's profile
    if (excludedObjectIds.length === 1) {
      query.userId = { $ne: excludedObjectIds[0] };
    } else if (excludedObjectIds.length > 1) {
      query.userId = { $nin: excludedObjectIds };
    }

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (group && group !== 'all') {
      query.group = group;
    }

    if (availability === 'available') {
      query.donationStatus = 'Available';
      query.$or = [
        { nextEligibleDate: { $exists: false } },
        { nextEligibleDate: null },
        { nextEligibleDate: { $lte: now } },
      ];
    } else if (availability === 'resting') {
      query.nextEligibleDate = { $gt: now };
    }

    const conditions: any[] = [];

    if (location && location !== 'all') {
      conditions.push({
        $or: [
          { donorLocation: { $regex: location, $options: 'i' } },
          { location: { $regex: location, $options: 'i' } },
        ],
      });
    }

    if (q) {
      const userSearchQuery: any = {
        name: { $regex: q, $options: 'i' },
      };
      if (excludedObjectIds.length === 1) {
        userSearchQuery._id = { $ne: excludedObjectIds[0] };
      } else if (excludedObjectIds.length > 1) {
        userSearchQuery._id = { $nin: excludedObjectIds };
      }

      const matchingUsers = await User.find(userSearchQuery).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      conditions.push({
        $or: [
          { userId: { $in: userIds } },
          { donorLocation: { $regex: q, $options: 'i' } },
          { location: { $regex: location || q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } },
        ],
      });
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const total = await AlumniProfile.countDocuments(query);
    const rawDonors = await AlumniProfile.find(query)
      .populate('userId', 'name image isVerified role phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Extra layer of exclusion filtering and compute dynamic status
    const donors = rawDonors
      .filter((d: any) => {
        const donorUserId = d.userId?._id?.toString() || d.userId?.toString();
        const donorProfileId = d._id?.toString();
        if (donorUserId && excludedUserIdsSet.has(donorUserId)) return false;
        if (donorProfileId && excludedUserIdsSet.has(donorProfileId)) return false;
        return true;
      })
      .map((d: any) => {
        const doc = { ...d };
        const dyn = getDonorDynamicStatus({
          isBloodDonor: doc.isBloodDonor,
          bloodDonationConsent: doc.bloodDonationConsent !== false,
          donationStatus: doc.donationStatus,
          nextEligibleDate: doc.nextEligibleDate,
        });

        doc.dynamicStatus = dyn.status;
        doc.isAvailable = dyn.isAvailable;
        return doc;
      });

    // Aggregated count of strictly available donors right now
    const statsBaseQuery: any = {
      isBloodDonor: true,
      bloodDonationConsent: { $ne: false },
    };
    if (excludedObjectIds.length === 1) {
      statsBaseQuery.userId = { $ne: excludedObjectIds[0] };
    } else if (excludedObjectIds.length > 1) {
      statsBaseQuery.userId = { $nin: excludedObjectIds };
    }

    const availableCount = await AlumniProfile.countDocuments({
      ...statsBaseQuery,
      donationStatus: 'Available',
      $or: [
        { nextEligibleDate: { $exists: false } },
        { nextEligibleDate: null },
        { nextEligibleDate: { $lte: now } },
      ],
    });

    const totalDonorsCount = await AlumniProfile.countDocuments(statsBaseQuery);

    return NextResponse.json({
      donors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalDonors: totalDonorsCount,
        availableCount,
      },
      filters: {
        bloodGroups: Array.from(BLOOD_GROUPS),
        groups: Array.from(ALUMNI_GROUPS),
        statuses: Array.from(DONATION_STATUSES),
      },
    });
  } catch (error: any) {
    console.error('Error fetching blood donors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood donors' },
      { status: 500 }
    );
  }
}
