import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatPermission } from '@/lib/chat-permission';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const permission = await getChatPermission(userId);

    return NextResponse.json(permission, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/chat/status:', error);
    return NextResponse.json(
      {
        isAllowed: false,
        isGlobalEnabled: true,
        isUserEnabled: true,
        reason: 'error',
        message: 'Failed to verify chat status',
      },
      { status: 500 }
    );
  }
}
