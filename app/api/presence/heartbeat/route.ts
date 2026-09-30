import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordHeartbeat } from '@/lib/presence-service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', isOnline: false },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Invalid user session', isOnline: false },
        { status: 401 }
      );
    }

    recordHeartbeat(currentUserId);

    return NextResponse.json({
      success: true,
      isOnline: true,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in POST /api/presence/heartbeat:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update presence', isOnline: false },
      { status: 500 }
    );
  }
}
