import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(20),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));

    await connectToDatabase();

    if (body.notificationId) {
      await Notification.findOneAndUpdate(
        { _id: body.notificationId, userId },
        { read: true }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ userId, read: false }, { read: true });
    }

    return NextResponse.json({ message: 'Notifications updated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
