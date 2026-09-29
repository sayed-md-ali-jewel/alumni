import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { CommitteePost } from '@/models/CommitteePost';
import { ALUMNI_GROUPS, BLOOD_GROUPS } from '@/lib/types';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const batchYear = searchParams.get('batchYear');
    const group = searchParams.get('group') || searchParams.get('department'); // graceful fallback
    const bloodGroup = searchParams.get('bloodGroup');
    const bloodDonor = searchParams.get('bloodDonor');
    const location = searchParams.get('location');
    const excludeUserId = searchParams.get('excludeUserId');
    const sortBy = searchParams.get('sortBy') || searchParams.get('sortOrder') || 'desc';
    const sortDirection: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '16', 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();
    // Ensure models are registered for population
    if (!mongoose.models.User) void User;
    if (!mongoose.models.CommitteePost) void CommitteePost;

    const query: any = {};

    if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
      query.userId = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }

    if (batchYear && batchYear !== 'all') {
      query.batchYear = parseInt(batchYear, 10);
    }

    if (group && group !== 'all') {
      query.group = group;
    }

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (bloodDonor && bloodDonor !== 'all') {
      if (bloodDonor === 'donor') {
        query.isBloodDonor = true;
      } else if (bloodDonor === 'available') {
        query.isBloodDonor = true;
        query.donationStatus = 'Available';
        query.bloodDonationConsent = true;
      } else if (bloodDonor === 'non-donor') {
        query.isBloodDonor = false;
      }
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Build search condition
    if (q) {
      const matchingUsers = await User.find({
        name: { $regex: q, $options: 'i' },
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { userId: { $in: userIds } },
        { company: { $regex: q, $options: 'i' } },
        { jobTitle: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { group: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { bloodGroup: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await AlumniProfile.countDocuments(query);
    const profiles = await AlumniProfile.find(query)
      .populate('userId', 'name email image isVerified role bloodGroup phone')
      .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault')
      .sort({ batchYear: sortDirection, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get distinct batches from db
    const rawBatches = await AlumniProfile.distinct('batchYear');
    const validBatches = rawBatches
      .filter((b: any) => typeof b === 'number' && !isNaN(b))
      .sort((a: number, b: number) => (sortDirection === 1 ? a - b : b - a));

    return NextResponse.json({
      profiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        groups: Array.from(ALUMNI_GROUPS),
        batches: validBatches,
        bloodGroups: Array.from(BLOOD_GROUPS),
      },
    });
  } catch (error: any) {
    console.error('Error fetching alumni profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni directory' },
      { status: 500 }
    );
  }
}
