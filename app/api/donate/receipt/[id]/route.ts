import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();

    let donation = await Donation.findOne({
      $or: [
        { transactionId: id },
        { receiptNumber: id },
      ],
    });

    if (!donation) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json({
      receiptNumber: donation.receiptNumber,
      transactionId: donation.transactionId,
      donorName: donation.isAnonymous ? 'Anonymous Donor (বেনামে দান)' : donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      amount: donation.amount,
      currency: donation.currency,
      campaign: donation.campaign,
      method: donation.method,
      status: donation.status,
      paidAt: donation.paidAt || donation.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
  }
}
