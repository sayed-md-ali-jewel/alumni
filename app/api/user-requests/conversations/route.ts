import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserRequest } from '@/models/UserRequest';
import { getBlockedUserIds } from '@/lib/block-service';
import { recordHeartbeat, isUserOnline } from '@/lib/presence-service';
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

    // Refresh current user's active heartbeat
    recordHeartbeat(currentUserId);

    const { searchParams } = new URL(req.url);
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'unread'

    await connectToDatabase();
    if (!mongoose.models.User) void User;

    const currentObjId = new mongoose.Types.ObjectId(currentUserId);
    const blockedUserIds = await getBlockedUserIds(currentUserId);
    const blockedSet = new Set(blockedUserIds.map((id) => id.toString()));

    // Aggregate conversations by pairing current user with the other user
    const conversations = await UserRequest.aggregate([
      {
        $match: {
          $or: [{ senderId: currentObjId }, { recipientId: currentObjId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          senderId: 1,
          recipientId: 1,
          message: 1,
          contentType: 1,
          imageUrl: 1,
          voiceUrl: 1,
          date: 1,
          time: 1,
          status: 1,
          read: 1,
          readAt: 1,
          createdAt: 1,
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', currentObjId] },
              then: '$recipientId',
              else: '$senderId',
            },
          },
        },
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', currentObjId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalMessages: { $sum: 1 },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Populate contact details for each conversation
    const contactIds = conversations.map((c) => c._id).filter(Boolean);
    const users = await User.find(
      { _id: { $in: contactIds } },
      'name email image role phone bloodGroup isVerified'
    ).lean();

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    let enrichedConversations = conversations
      .map((conv) => {
        const contactIdStr = conv._id?.toString();
        const contactUser = userMap.get(contactIdStr);
        if (!contactUser) return null;

        const online = isUserOnline(contactIdStr);

        return {
          contactId: contactIdStr,
          contact: {
            ...contactUser,
            isOnline: online,
          },
          isOnline: online,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount || 0,
          totalMessages: conv.totalMessages || 0,
          isBlocked: blockedSet.has(contactIdStr),
        };
      })
      .filter(Boolean);

    // Apply filter
    if (filter === 'unread') {
      enrichedConversations = enrichedConversations.filter((c: any) => c.unreadCount > 0);
    }

    // Apply search query filter
    if (searchQuery) {
      enrichedConversations = enrichedConversations.filter((c: any) => {
        const name = (c.contact?.name || '').toLowerCase();
        const email = (c.contact?.email || '').toLowerCase();
        const msg = (c.lastMessage?.message || '').toLowerCase();
        return name.includes(searchQuery) || email.includes(searchQuery) || msg.includes(searchQuery);
      });
    }

    // Total unread messages count across all conversations
    const totalUnread = await UserRequest.countDocuments({
      recipientId: currentObjId,
      read: false,
    });

    return NextResponse.json({
      conversations: enrichedConversations,
      totalUnread,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user-requests/conversations:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
