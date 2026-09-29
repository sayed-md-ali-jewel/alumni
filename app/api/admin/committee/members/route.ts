import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { CommitteePost } from '@/models/CommitteePost';
import { getDefaultCommitteePost } from '@/lib/committee';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const postId = searchParams.get('postId');
    const batchYear = searchParams.get('batchYear');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = {};

    if (postId && postId !== 'all') {
      if (postId === 'unassigned') {
        query.$or = [
          { committeePost: { $exists: false } },
          { committeePost: null },
        ];
      } else if (mongoose.Types.ObjectId.isValid(postId)) {
        query.committeePost = new mongoose.Types.ObjectId(postId);
      }
    }

    if (batchYear && batchYear !== 'all') {
      query.batchYear = parseInt(batchYear, 10);
    }

    if (q) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { userId: { $in: userIds } },
        { company: { $regex: q, $options: 'i' } },
        { jobTitle: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await AlumniProfile.countDocuments(query);
    const members = await AlumniProfile.find(query)
      .populate({
        path: 'userId',
        select: 'name email image isVerified bloodGroup phone role',
        model: User,
      })
      .populate({
        path: 'committeePost',
        select: 'name_en name_bn sortOrder isActive isDefault',
        model: CommitteePost,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const posts = await CommitteePost.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    const batches = await AlumniProfile.distinct('batchYear');

    return NextResponse.json({
      members,
      posts,
      batches: batches.sort((a, b) => b - a),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin committee members:', error);
    return NextResponse.json({ error: 'Failed to fetch committee members' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { profileId, userId, postId, roleTitle } = body;

    if (!profileId && !userId) {
      return NextResponse.json({ error: 'Profile ID or User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const query = profileId ? { _id: profileId } : { userId };
    const targetPost = postId && mongoose.Types.ObjectId.isValid(postId)
      ? new mongoose.Types.ObjectId(postId)
      : null;

    const updatedProfile = await AlumniProfile.findOneAndUpdate(
      query,
      {
        $set: {
          committeePost: targetPost,
          ...(roleTitle !== undefined ? { committeeRoleTitle: roleTitle } : {}),
        },
      },
      { new: true }
    ).populate('userId', 'name email image isVerified')
     .populate('committeePost', 'name_en name_bn');

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Alumni member not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Committee designation updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error assigning committee post:', error);
    return NextResponse.json({ error: 'Failed to assign committee post' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');
    const userId = searchParams.get('userId');

    if (!profileId && !userId) {
      return NextResponse.json({ error: 'Profile ID or User ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const defaultPost = await getDefaultCommitteePost();

    const query = profileId ? { _id: profileId } : { userId };

    const updatedProfile = await AlumniProfile.findOneAndUpdate(
      query,
      {
        $set: {
          committeePost: defaultPost ? defaultPost._id : null,
          committeeRoleTitle: '',
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Alumni committee post reset to default member',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error removing committee post assignment:', error);
    return NextResponse.json({ error: 'Failed to reset committee post' }, { status: 500 });
  }
}
