import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';
import { BLOOD_GROUPS } from '@/lib/types';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    const [
      totalAlumni,
      totalDonors,
      availableDonors,
      openRequests,
      emergencyRequests,
      fulfilledRequests,
      bloodGroupCountsRaw,
    ] = await Promise.all([
      User.countDocuments({ role: 'alumni' }),
      AlumniProfile.countDocuments({ isBloodDonor: true, bloodDonationConsent: { $ne: false } }),
      AlumniProfile.countDocuments({
        isBloodDonor: true,
        bloodDonationConsent: { $ne: false },
        donationStatus: 'Available',
        $or: [
          { nextEligibleDate: { $exists: false } },
          { nextEligibleDate: null },
          { nextEligibleDate: { $lte: now } },
        ],
      }),
      BloodRequest.countDocuments({ status: 'Open' }),
      BloodRequest.countDocuments({ status: 'Open', urgency: 'Emergency' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      AlumniProfile.aggregate([
        {
          $match: {
            bloodGroup: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$bloodGroup',
            totalMembers: { $sum: 1 },
            donorsCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$isBloodDonor', true] },
                      { $ne: ['$bloodDonationConsent', false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            availableCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$isBloodDonor', true] },
                      { $ne: ['$bloodDonationConsent', false] },
                      { $eq: ['$donationStatus', 'Available'] },
                      {
                        $or: [
                          { $eq: [{ $type: '$nextEligibleDate' }, 'missing'] },
                          { $eq: ['$nextEligibleDate', null] },
                          { $lte: ['$nextEligibleDate', now] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    // Format all blood groups to ensure none are missing even with 0 counts
    const distribution: Record<
      string,
      { totalMembers: number; donorsCount: number; availableCount: number; restingCount: number }
    > = {};
    BLOOD_GROUPS.forEach((bg) => {
      distribution[bg] = { totalMembers: 0, donorsCount: 0, availableCount: 0, restingCount: 0 };
    });

    bloodGroupCountsRaw.forEach((item: any) => {
      if (item._id && distribution[item._id] !== undefined) {
        const donorsCount = item.donorsCount || 0;
        const availableCount = item.availableCount || 0;
        const restingCount = Math.max(0, donorsCount - availableCount);

        distribution[item._id] = {
          totalMembers: item.totalMembers || 0,
          donorsCount,
          availableCount,
          restingCount,
        };
      }
    });

    const restingDonors = Math.max(0, totalDonors - availableDonors);

    return NextResponse.json({
      summary: {
        totalAlumni,
        totalDonors,
        availableDonors,
        restingDonors,
        openRequests,
        emergencyRequests,
        fulfilledRequests,
      },
      distribution,
    });
  } catch (error: any) {
    console.error('Error fetching blood donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood donation statistics' },
      { status: 500 }
    );
  }
}
