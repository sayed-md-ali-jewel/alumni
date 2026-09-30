import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { UserRequest } from '@/models/UserRequest';
import { Notification } from '@/models/Notification';
import { UserRequestCreateSchema } from '@/lib/validations';
import { canUserInteract, getBlockedUserIds } from '@/lib/block-service';
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
    const conversationWith = searchParams.get('conversationWith');

    await connectToDatabase();
    if (!mongoose.models.User) void User;

    const currentObjId = new mongoose.Types.ObjectId(currentUserId);
    const blockedUserIds = await getBlockedUserIds(currentUserId);
    const blockedSet = new Set(blockedUserIds.map((id) => id.toString()));

    // 1-to-1 Chat Conversation Mode
    if (conversationWith && mongoose.Types.ObjectId.isValid(conversationWith)) {
      const targetObjId = new mongoose.Types.ObjectId(conversationWith);

      // Auto-mark any incoming unread messages as read
      await UserRequest.updateMany(
        {
          senderId: targetObjId,
          recipientId: currentObjId,
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
            status: 'Read',
          },
        }
      );

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const skip = (page - 1) * limit;

      const [contactUser, contactProfile, totalMessages, messages] = await Promise.all([
        User.findById(targetObjId, 'name email image role phone bloodGroup isVerified').lean(),
        AlumniProfile.findOne({ userId: targetObjId }, 'batchYear group jobTitle company location').lean(),
        UserRequest.countDocuments({
          $or: [
            { senderId: currentObjId, recipientId: targetObjId },
            { senderId: targetObjId, recipientId: currentObjId },
          ],
        }),
        UserRequest.find({
          $or: [
            { senderId: currentObjId, recipientId: targetObjId },
            { senderId: targetObjId, recipientId: currentObjId },
          ],
        })
          .populate('senderId', 'name email image role phone bloodGroup')
          .populate('recipientId', 'name email image role phone bloodGroup')
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      const isContactBlocked = blockedSet.has(conversationWith);

      return NextResponse.json({
        messages,
        contact: contactUser ? { ...contactUser, profile: contactProfile } : null,
        isBlocked: isContactBlocked,
        pagination: {
          total: totalMessages,
          page,
          limit,
          totalPages: Math.ceil(totalMessages / limit) || 1,
        },
      });
    }

    // Standard list mode (mode=received | mode=sent)
    const mode = searchParams.get('mode') || 'received';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (mode === 'sent') {
      query.senderId = currentObjId;
    } else {
      query.recipientId = currentObjId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const [total, requests, unreadCount] = await Promise.all([
      UserRequest.countDocuments(query),
      UserRequest.find(query)
        .populate('senderId', 'name email image role phone bloodGroup')
        .populate('recipientId', 'name email image role phone bloodGroup')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserRequest.countDocuments({
        recipientId: currentObjId,
        read: false,
      }),
    ]);

    // Attach block indicator for UI convenience
    const enrichedRequests = requests.map((reqItem: any) => {
      const otherUserId =
        mode === 'sent'
          ? reqItem.recipientId?._id?.toString() || reqItem.recipientId?.toString()
          : reqItem.senderId?._id?.toString() || reqItem.senderId?.toString();

      return {
        ...reqItem,
        isOtherUserBlocked: otherUserId ? blockedSet.has(otherUserId) : false,
      };
    });

    return NextResponse.json({
      requests: enrichedRequests,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user requests:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to send a message' }, { status: 401 });
    }

    const senderId = (session.user as any).id;
    if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
      return NextResponse.json({ error: 'Invalid session user' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UserRequestCreateSchema.parse(body);

    await connectToDatabase();

    // Verify recipient exists
    let recipientUser = null;
    let recipientProfile = null;

    if (mongoose.Types.ObjectId.isValid(validatedData.recipientId)) {
      recipientUser = await User.findById(validatedData.recipientId);
      if (!recipientUser) {
        // Maybe recipientId was an AlumniProfile ID
        recipientProfile = await AlumniProfile.findById(validatedData.recipientId);
        if (recipientProfile?.userId) {
          recipientUser = await User.findById(recipientProfile.userId);
        }
      }
    }

    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    const recipientUserId = recipientUser._id.toString();

    // Check self-message
    if (senderId.toString() === recipientUserId) {
      return NextResponse.json(
        { error: 'You cannot send a message to yourself' },
        { status: 400 }
      );
    }

    // Check blocking rules server-side
    const interactionCheck = await canUserInteract(senderId, recipientUserId);
    if (!interactionCheck.allowed) {
      return NextResponse.json(
        { error: interactionCheck.reason || 'Interaction is not allowed due to user blocking restrictions' },
        { status: 403 }
      );
    }

    const now = new Date();
    const dateStr = validatedData.date || now.toISOString().split('T')[0];
    const timeStr =
      validatedData.time ||
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    const contentType =
      validatedData.contentType ||
      (validatedData.voiceUrl
        ? 'voice'
        : validatedData.imageUrl && !validatedData.message?.trim()
        ? 'image'
        : 'text');

    // Create the message
    const newRequest = await UserRequest.create({
      senderId: new mongoose.Types.ObjectId(senderId),
      recipientId: new mongoose.Types.ObjectId(recipientUserId),
      contentType,
      message: validatedData.message || '',
      imageUrl: validatedData.imageUrl || '',
      voiceUrl: validatedData.voiceUrl || '',
      subject: validatedData.subject || '',
      date: dateStr,
      time: timeStr,
      status: 'Pending',
      read: false,
      metadata: validatedData.metadata || {},
    });

    // Create notification for recipient
    const senderName = session.user.name || 'An alumni member';
    const previewText =
      validatedData.message?.trim()
        ? validatedData.message.length > 120
          ? `${validatedData.message.slice(0, 120)}...`
          : validatedData.message
        : validatedData.voiceUrl
        ? '🎤 Sent you a voice message'
        : validatedData.imageUrl
        ? '📷 Sent you an image'
        : 'Sent you a message';

    await Notification.create({
      userId: recipientUser._id,
      type: 'user_request',
      title: `💬 New Message from ${senderName}`,
      message: previewText,
      link: `/messages?user=${senderId}`,
      read: false,
    });

    const populatedRequest = await UserRequest.findById(newRequest._id)
      .populate('senderId', 'name email image role phone bloodGroup')
      .populate('recipientId', 'name email image role phone bloodGroup')
      .lean();

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        request: populatedRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user request:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to send request' },
      { status: 500 }
    );
  }
}
