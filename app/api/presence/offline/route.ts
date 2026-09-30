import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordOffline } from '@/lib/presence-service';

export async function POST(req: Request) {
  try {
    let targetUserId: string | null = null;

    // Try session first
    const session = await getServerSession(authOptions);
    if (session?.user) {
      targetUserId = (session.user as any).id;
    }

    // Try payload / query if session wasn't readable in beacon
    if (!targetUserId) {
      try {
        const body = await req.json();
        if (body?.userId) targetUserId = String(body.userId);
      } catch {
        // ignore
      }
    }

    if (targetUserId) {
      recordOffline(targetUserId);
    }

    return NextResponse.json({
      success: true,
      isOnline: false,
    });
  } catch (error: any) {
    console.error('Error in POST /api/presence/offline:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update presence', isOnline: false },
      { status: 500 }
    );
  }
}
