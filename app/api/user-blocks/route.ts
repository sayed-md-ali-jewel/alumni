import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { BlockedUser } from '@/models/BlockedUser';
import { UserBlockSchema } from '@/lib/validations';
import { checkBlockStatus } from '@/lib/block-service';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');

    await connectToDatabase();
    if (!mongoose.models.User) void User;

    // If querying status for a specific user
    if (targetUserId) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return NextResponse.json({ error: 'Invalid target user ID' }, { status: 400 });
      }

      const status = await checkBlockStatus(currentUserId, targetUserId);
      return NextResponse.json({
        targetUserId,
        ...status,
      });
    }

    // List all users blocked by the authenticated user
    const blockedRecords = await BlockedUser.find({
      blockerId: new mongoose.Types.ObjectId(currentUserId),
    })
      .sort({ createdAt: -1 })
      .populate('blockedUserId', 'name email image role phone bloodGroup')
      .lean();

    // Fetch profile details for blocked users for richer UI
    const blockedUserIds = blockedRecords
      .map((r: any) => r.blockedUserId?._id || r.blockedUserId)
      .filter(Boolean);

    const profiles = await AlumniProfile.find({
      userId: { $in: blockedUserIds },
    })
      .select('userId batchYear group location jobTitle company')
      .lean();

    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const enrichedList = blockedRecords.map((r: any) => {
      const uId = r.blockedUserId?._id?.toString() || r.blockedUserId?.toString();
      const profile = uId ? profileMap.get(uId) : null;

      return {
        _id: r._id,
        createdAt: r.createdAt,
        reason: r.reason || '',
        user: r.blockedUserId,
        profile: profile || null,
      };
    });

    return NextResponse.json({
      blockedUsers: enrichedList,
      total: enrichedList.length,
    });
  } catch (error: any) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to block a user' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const body = await req.json();
    const validatedData = UserBlockSchema.parse(body);

    await connectToDatabase();

    // Target user resolution (could be User ID or AlumniProfile ID)
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(validatedData.targetUserId)) {
      targetUser = await User.findById(validatedData.targetUserId);
      if (!targetUser) {
        const profile = await AlumniProfile.findById(validatedData.targetUserId);
        if (profile?.userId) {
          targetUser = await User.findById(profile.userId);
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const targetUserIdStr = targetUser._id.toString();

    // Prevent blocking oneself
    if (currentUserId.toString() === targetUserIdStr) {
      return NextResponse.json({ error: 'You cannot block yourself' }, { status: 400 });
    }

    // Upsert block record to prevent duplicate blocks
    await BlockedUser.findOneAndUpdate(
      {
        blockerId: new mongoose.Types.ObjectId(currentUserId),
        blockedUserId: new mongoose.Types.ObjectId(targetUserIdStr),
      },
      {
        blockerId: new mongoose.Types.ObjectId(currentUserId),
        blockedUserId: new mongoose.Types.ObjectId(targetUserIdStr),
        reason: validatedData.reason || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `${targetUser.name || 'User'} has been blocked`,
      targetUserId: targetUserIdStr,
    });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to block user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    let targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      const body = await req.json().catch(() => ({}));
      targetUserId = body.targetUserId;
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Valid target user ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if targetUserId might be an AlumniProfile ID
    let userRecord = await User.findById(targetUserId);
    if (!userRecord) {
      const profile = await AlumniProfile.findById(targetUserId);
      if (profile?.userId) {
        userRecord = await User.findById(profile.userId);
      }
    }

    const resolvedTargetId = userRecord ? userRecord._id.toString() : targetUserId;

    // Only the user who created the block can unblock
    const result = await BlockedUser.findOneAndDelete({
      blockerId: new mongoose.Types.ObjectId(currentUserId),
      blockedUserId: new mongoose.Types.ObjectId(resolvedTargetId),
    });

    if (!result) {
      return NextResponse.json({
        message: 'No active block record found',
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User has been unblocked successfully',
      targetUserId: resolvedTargetId,
    });
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to unblock user' },
      { status: 500 }
    );
  }
}
