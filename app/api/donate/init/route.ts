import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { DonationInitSchema } from '@/lib/validations';
import { generateTxnId, generateReceiptNumber } from '@/lib/utils';
import { initiateSSLCommerzPayment } from '@/lib/sslcommerz';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const validated = DonationInitSchema.parse(body);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const tranId = generateTxnId('ALM-DON');
    const receiptNumber = generateReceiptNumber();

    await connectToDatabase();

    // Create pending donation in database
    await Donation.create({
      donorName: validated.donorName,
      donorEmail: validated.donorEmail,
      donorPhone: validated.donorPhone,
      amount: validated.amount,
      currency: 'BDT',
      campaign: validated.campaign,
      isAnonymous: validated.isAnonymous,
      method: validated.method,
      transactionId: tranId,
      receiptNumber,
      status: 'pending',
      userId: (session?.user as any)?.id || undefined,
    });

    // Initiate SSLCommerz Session
    const paymentResponse = await initiateSSLCommerzPayment({
      totalAmount: validated.amount,
      currency: 'BDT',
      tranId,
      successUrl: `${appUrl}/api/donate/success`,
      failUrl: `${appUrl}/api/donate/fail`,
      cancelUrl: `${appUrl}/api/donate/cancel`,
      ipnUrl: `${appUrl}/api/donate/ipn`,
      customerName: validated.donorName,
      customerEmail: validated.donorEmail,
      customerPhone: validated.donorPhone,
      campaignName: validated.campaign,
    });

    return NextResponse.json({
      gatewayUrl: paymentResponse.GatewayPageURL,
      transactionId: tranId,
      receiptNumber,
    });
  } catch (error: any) {
    console.error('Error initiating donation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate payment session' },
      { status: 500 }
    );
  }
}
