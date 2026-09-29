import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodDonation } from '@/models/BloodDonation';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const donorId = searchParams.get('donorId') || (session.user as any).id;

    // Non-admins can only view their own donation history
    if (donorId !== (session.user as any).id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const history = await BloodDonation.find({ donorId })
      .sort({ donationDate: -1 })
      .populate('bloodRequestId', 'patientName hospitalName hospitalLocation urgency');

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Error fetching donation history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
