import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

// Import all models
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { SiteSetting } from '@/models/SiteSetting';
import { SmtpSetting } from '@/models/SmtpSetting';
import { CommunitySetting } from '@/models/CommunitySetting';
import { SliderItem } from '@/models/Slider';
import { NewsPost } from '@/models/NewsPost';
import { Event } from '@/models/Event';
import { JobPost } from '@/models/JobPost';
import { Campaign } from '@/models/Campaign';
import { Donation } from '@/models/Donation';
import { BankTransferRequest } from '@/models/BankTransferRequest';
import { BloodRequest } from '@/models/BloodRequest';
import { BloodDonation } from '@/models/BloodDonation';
import { BloodContactRequest } from '@/models/BloodContactRequest';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { CommitteePost } from '@/models/CommitteePost';
import { Discussion } from '@/models/Discussion';
import { UserRequest } from '@/models/UserRequest';
import { Notification } from '@/models/Notification';
import { Rsvp } from '@/models/Rsvp';
import { BlockedUser } from '@/models/BlockedUser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const summaryOnly = searchParams.get('summary') === '1' || searchParams.get('summary') === 'true';

    // Fetch all collections in parallel
    const [
      users,
      alumniProfiles,
      siteSettings,
      smtpSettings,
      communitySettings,
      sliders,
      news,
      events,
      jobPosts,
      campaigns,
      donations,
      bankTransfers,
      bloodRequests,
      bloodDonations,
      bloodContacts,
      bloodResponses,
      committee,
      discussions,
      userRequests,
      notifications,
      rsvps,
      blockedUsers,
    ] = await Promise.all([
      User.find().lean().exec(),
      AlumniProfile.find().lean().exec(),
      SiteSetting.find().lean().exec(),
      SmtpSetting.find().lean().exec(),
      CommunitySetting.find().lean().exec(),
      SliderItem.find().lean().exec(),
      NewsPost.find().lean().exec(),
      Event.find().lean().exec(),
      JobPost.find().lean().exec(),
      Campaign.find().lean().exec(),
      Donation.find().lean().exec(),
      BankTransferRequest.find().lean().exec(),
      BloodRequest.find().lean().exec(),
      BloodDonation.find().lean().exec(),
      BloodContactRequest.find().lean().exec(),
      BloodRequestResponse.find().lean().exec(),
      CommitteePost.find().lean().exec(),
      Discussion.find().lean().exec(),
      UserRequest.find().lean().exec(),
      Notification.find().lean().exec(),
      Rsvp.find().lean().exec(),
      BlockedUser.find().lean().exec(),
    ]);

    const stats = {
      users: users.length,
      alumniProfiles: alumniProfiles.length,
      siteSettings: siteSettings.length,
      smtpSettings: smtpSettings.length,
      communitySettings: communitySettings.length,
      sliders: sliders.length,
      news: news.length,
      events: events.length,
      jobPosts: jobPosts.length,
      campaigns: campaigns.length,
      donations: donations.length,
      bankTransfers: bankTransfers.length,
      bloodRequests: bloodRequests.length,
      bloodDonations: bloodDonations.length,
      bloodContacts: bloodContacts.length,
      bloodResponses: bloodResponses.length,
      committee: committee.length,
      discussions: discussions.length,
      userRequests: userRequests.length,
      notifications: notifications.length,
      rsvps: rsvps.length,
      blockedUsers: blockedUsers.length,
    };

    const totalRecords = Object.values(stats).reduce((acc, count) => acc + count, 0);

    if (summaryOnly) {
      return NextResponse.json({
        success: true,
        stats,
        totalRecords,
        timestamp: new Date().toISOString(),
      });
    }

    const exportPayload = {
      format: 'alumni-platform-backup',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: session.user?.email || 'admin',
      totalRecords,
      stats,
      data: {
        users,
        alumniProfiles,
        siteSettings,
        smtpSettings,
        communitySettings,
        sliders,
        news,
        events,
        jobPosts,
        campaigns,
        donations,
        bankTransfers,
        bloodRequests,
        bloodDonations,
        bloodContacts,
        bloodResponses,
        committee,
        discussions,
        userRequests,
        notifications,
        rsvps,
        blockedUsers,
      },
    };

    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `alumni_backup_${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export database backup' },
      { status: 500 }
    );
  }
}
