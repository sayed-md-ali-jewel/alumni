import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Event } from '@/models/Event';
import { NewsPost } from '@/models/NewsPost';
import { JobPost } from '@/models/JobPost';
import { Donation } from '@/models/Donation';
import { BankTransferRequest } from '@/models/BankTransferRequest';
import { BloodRequest } from '@/models/BloodRequest';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();

    const [
      totalUsers,
      verifiedUsers,
      pendingUsers,
      totalEvents,
      totalNews,
      totalJobs,
      pendingTransfers,
      totalBloodDonors,
      availableBloodDonors,
      openBloodRequests,
      emergencyBloodRequests,
      donationAggregation,
      recentDonations,
      recentUsers,
      pendingTransfersList,
      allBankTransfers,
      campaignStats,
      recentEvents,
      recentNewsList,
      recentBloodRequests,
    ] = await Promise.all([
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'alumni', isVerified: true }),
      User.countDocuments({ role: 'alumni', isVerified: false }),
      Event.countDocuments(),
      NewsPost.countDocuments(),
      JobPost.countDocuments({ isActive: true }),
      BankTransferRequest.countDocuments({ status: 'pending_review' }),
      AlumniProfile.countDocuments({ isBloodDonor: true, bloodDonationConsent: true }),
      AlumniProfile.countDocuments({ isBloodDonor: true, bloodDonationConsent: true, donationStatus: 'Available' }),
      BloodRequest.countDocuments({ status: 'Open' }),
      BloodRequest.countDocuments({ status: 'Open', urgency: 'Emergency' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRaised: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.find().sort({ createdAt: -1 }).limit(10),
      User.find({ role: 'alumni' }).sort({ createdAt: -1 }).limit(10),
      BankTransferRequest.find({ status: 'pending_review' }).sort({ createdAt: -1 }).limit(10),
      BankTransferRequest.find().sort({ createdAt: -1 }).limit(20),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$campaign', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Event.find().sort({ createdAt: -1 }).limit(4),
      NewsPost.find().sort({ createdAt: -1 }).limit(4),
      BloodRequest.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRaised = donationAggregation[0]?.totalRaised || 0;
    const completedDonationsCount = donationAggregation[0]?.count || 0;

    return NextResponse.json({
      metrics: {
        totalUsers,
        verifiedUsers,
        pendingUsers,
        totalEvents,
        totalNews,
        totalJobs,
        pendingTransfers,
        totalRaised,
        completedDonationsCount,
        totalBloodDonors,
        availableBloodDonors,
        openBloodRequests,
        emergencyBloodRequests,
      },
      recentDonations,
      recentUsers,
      pendingTransfersList,
      allBankTransfers,
      campaignStats,
      recentEvents,
      recentNewsList,
      recentBloodRequests,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
