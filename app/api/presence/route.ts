import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsersPresence, getUserPresence } from '@/lib/presence-service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userIdsParam = searchParams.get('userIds');
    const singleUserId = searchParams.get('userId');

    if (userIdsParam) {
      const ids = userIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const presence = getUsersPresence(ids);
      return NextResponse.json({ presence });
    }

    if (singleUserId) {
      const presence = getUserPresence(singleUserId.trim());
      return NextResponse.json({
        userId: singleUserId.trim(),
        ...presence,
      });
    }

    return NextResponse.json({ error: 'Missing userId or userIds' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in GET /api/presence:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to get presence' },
      { status: 500 }
    );
  }
}
