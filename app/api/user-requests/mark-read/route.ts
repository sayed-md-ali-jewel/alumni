import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { UserRequest } from '@/models/UserRequest';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const contactId = body.contactId;

    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    await connectToDatabase();

    const result = await UserRequest.updateMany(
      {
        senderId: new mongoose.Types.ObjectId(contactId),
        recipientId: new mongoose.Types.ObjectId(currentUserId),
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

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error marking conversation messages as read:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
