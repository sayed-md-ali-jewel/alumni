import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

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

const MODEL_MAP: Record<string, mongoose.Model<any>> = {
  users: User,
  alumniProfiles: AlumniProfile,
  siteSettings: SiteSetting,
  smtpSettings: SmtpSetting,
  communitySettings: CommunitySetting,
  sliders: SliderItem,
  news: NewsPost,
  events: Event,
  jobPosts: JobPost,
  campaigns: Campaign,
  donations: Donation,
  bankTransfers: BankTransferRequest,
  bloodRequests: BloodRequest,
  bloodDonations: BloodDonation,
  bloodContacts: BloodContactRequest,
  bloodResponses: BloodRequestResponse,
  committee: CommitteePost,
  discussions: Discussion,
  userRequests: UserRequest,
  notifications: Notification,
  rsvps: Rsvp,
  blockedUsers: BlockedUser,
};

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { data, mode = 'merge', collections = [] } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid backup file payload. "data" object containing collections is required.' },
        { status: 400 }
      );
    }

    const importResults: Record<
      string,
      { inserted: number; updated: number; failed: number; error?: string }
    > = {};

    const targetKeys =
      Array.isArray(collections) && collections.length > 0
        ? collections.filter((key: string) => MODEL_MAP[key])
        : Object.keys(data).filter((key: string) => MODEL_MAP[key]);

    for (const key of targetKeys) {
      const Model = MODEL_MAP[key];
      const items = data[key];

      if (!Array.isArray(items)) {
        continue;
      }

      let insertedCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      try {
        if (mode === 'replace') {
          // Replace mode: wipe collection and re-insert all items from backup
          await Model.deleteMany({});
          if (items.length > 0) {
            const sanitizedItems = items.map((item) => {
              const clone = { ...item };
              return clone;
            });
            const result = await Model.insertMany(sanitizedItems, { ordered: false });
            insertedCount = result.length;
          }
        } else {
          // Merge mode: upsert each item by _id (or fallback to unique fields)
          for (const item of items) {
            try {
              if (item._id) {
                const existing = await Model.findById(item._id);
                if (existing) {
                  await Model.findByIdAndUpdate(item._id, item, {
                    new: true,
                    runValidators: false,
                  });
                  updatedCount++;
                } else {
                  await Model.create(item);
                  insertedCount++;
                }
              } else if (key === 'siteSettings') {
                const existing = await Model.findOne({});
                if (existing) {
                  await Model.findByIdAndUpdate(existing._id, item, { new: true });
                  updatedCount++;
                } else {
                  await Model.create(item);
                  insertedCount++;
                }
              } else if (key === 'smtpSettings') {
                const existing = await Model.findOne({});
                if (existing) {
                  await Model.findByIdAndUpdate(existing._id, item, { new: true });
                  updatedCount++;
                } else {
                  await Model.create(item);
                  insertedCount++;
                }
              } else if (key === 'users' && item.email) {
                const existing = await Model.findOne({ email: item.email.toLowerCase().trim() });
                if (existing) {
                  await Model.findByIdAndUpdate(existing._id, item, { new: true });
                  updatedCount++;
                } else {
                  await Model.create(item);
                  insertedCount++;
                }
              } else {
                await Model.create(item);
                insertedCount++;
              }
            } catch (itemErr) {
              failedCount++;
              console.warn(`[Import Backup] Failed to process single item in ${key}:`, itemErr);
            }
          }
        }

        importResults[key] = {
          inserted: insertedCount,
          updated: updatedCount,
          failed: failedCount,
        };
      } catch (colErr: any) {
        console.error(`[Import Backup] Collection ${key} error:`, colErr);
        importResults[key] = {
          inserted: insertedCount,
          updated: updatedCount,
          failed: items.length,
          error: colErr?.message || 'Collection import failed',
        };
      }
    }

    const totalProcessed = Object.values(importResults).reduce(
      (acc, res) => acc + res.inserted + res.updated,
      0
    );

    return NextResponse.json({
      success: true,
      mode,
      totalProcessed,
      results: importResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Data import error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process data import' },
      { status: 500 }
    );
  }
}
