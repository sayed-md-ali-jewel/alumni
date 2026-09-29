import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { generateReceiptNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { donationId, action } = await req.json(); // action: 'approve' | 'reject'

    if (!donationId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectToDatabase();

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    if (action === 'approve') {
      donation.status = 'completed';
      donation.paidAt = new Date();
      if (!donation.receiptNumber) {
        donation.receiptNumber = generateReceiptNumber();
      }
      await donation.save();

      return NextResponse.json({
        message: 'Donation verified and marked completed successfully!',
        donation,
      });
    } else {
      donation.status = 'cancelled';
      await donation.save();

      return NextResponse.json({
        message: 'Donation status marked as cancelled.',
        donation,
      });
    }
  } catch (error: any) {
    console.error('Approve donation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
