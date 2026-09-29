import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { ManualDonationSchema } from '@/lib/validations';
import { generateTxnId, generateReceiptNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const validated = ManualDonationSchema.parse(body);

    await connectToDatabase();

    let finalTrxId = validated.transactionId?.trim();
    if (validated.method === 'cash' || !finalTrxId) {
      finalTrxId = generateTxnId('CSH');
    }

    const receiptNumber = generateReceiptNumber();

    const donation = await Donation.create({
      donorName: validated.donorName,
      donorEmail: validated.donorEmail,
      donorPhone: validated.donorPhone,
      amount: validated.amount,
      currency: 'BDT',
      campaign: validated.campaign,
      isAnonymous: validated.isAnonymous,
      method: validated.method,
      transactionId: finalTrxId,
      receiptNumber,
      status: 'pending',
      userId: (session?.user as any)?.id || undefined,
      recipientName: validated.recipientName || validated.givenTo,
      givenTo: validated.givenTo || validated.recipientName,
      recipientId: validated.recipientId || undefined,
      donationDate: validated.donationDate ? new Date(validated.donationDate) : new Date(),
      donationTime: validated.donationTime || undefined,
      notes: validated.notes || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Donation recorded successfully. Status: Pending Verification.',
        donation,
        receiptNumber,
        transactionId: finalTrxId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving manual donation:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to submit donation record' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const donations = await Donation.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ donations });
  } catch (error: any) {
    console.error('Error fetching public donations:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
