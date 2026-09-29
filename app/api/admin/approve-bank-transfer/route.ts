import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BankTransferRequest } from '@/models/BankTransferRequest';
import { Donation } from '@/models/Donation';
import { generateReceiptNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { requestId, action } = await req.json(); // action: 'approve' | 'reject'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectToDatabase();

    const request = await BankTransferRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: 'Transfer request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Create a completed Donation record
      const receiptNumber = generateReceiptNumber();
      const donation = await Donation.create({
        donorName: request.donorName,
        donorEmail: request.donorEmail,
        donorPhone: request.donorPhone,
        amount: request.amount,
        currency: 'BDT',
        campaign: request.campaign,
        isAnonymous: false,
        method: 'bank_manual',
        transactionId: request.transactionRef,
        receiptNumber,
        status: 'completed',
        paidAt: new Date(),
      });

      request.status = 'approved';
      request.reviewedBy = (session.user as any).id;
      request.reviewedAt = new Date();
      request.donationId = donation._id;
      await request.save();

      return NextResponse.json({
        message: 'Bank transfer approved and credited to campaign!',
        receiptNumber,
      });
    } else {
      request.status = 'rejected';
      request.reviewedBy = (session.user as any).id;
      request.reviewedAt = new Date();
      await request.save();

      return NextResponse.json({ message: 'Bank transfer rejected.' });
    }
  } catch (error) {
    console.error('Approve bank transfer error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
