import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { validateSSLCommerzPayment } from '@/lib/sslcommerz';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;
    const bank_tran_id = formData.get('bank_tran_id') as string;
    const card_type = formData.get('card_type') as string;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!tran_id) {
      return NextResponse.redirect(`${appUrl}/bn/donate/fail?error=invalid_payload`, 303);
    }

    await connectToDatabase();

    // Verify transaction with SSLCommerz server
    let isValid = true;
    if (val_id) {
      const verification = await validateSSLCommerzPayment(val_id);
      isValid = verification.status === 'VALID';
    }

    if (isValid) {
      await Donation.findOneAndUpdate(
        { transactionId: tran_id },
        {
          status: 'completed',
          valId: val_id || `VAL-${Date.now()}`,
          bankTranId: bank_tran_id || '',
          cardType: card_type || 'Online-Payment',
          paidAt: new Date(),
        }
      );

      return NextResponse.redirect(`${appUrl}/bn/donate/success?tran_id=${tran_id}`, 303);
    } else {
      await Donation.findOneAndUpdate(
        { transactionId: tran_id },
        { status: 'failed' }
      );
      return NextResponse.redirect(`${appUrl}/bn/donate/fail?tran_id=${tran_id}`, 303);
    }
  } catch (error) {
    console.error('Donation success callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/bn/donate/fail`, 303);
  }
}

// Support GET for direct test simulations
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tran_id = searchParams.get('tran_id');
  const val_id = searchParams.get('val_id');
  const card_type = searchParams.get('card_type');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!tran_id) {
    return NextResponse.redirect(`${appUrl}/bn/donate/fail`, 303);
  }

  await connectToDatabase();
  await Donation.findOneAndUpdate(
    { transactionId: tran_id },
    {
      status: 'completed',
      valId: val_id || `VAL-${Date.now()}`,
      cardType: card_type || 'bKash-Payment',
      paidAt: new Date(),
    }
  );

  return NextResponse.redirect(`${appUrl}/bn/donate/success?tran_id=${tran_id}`, 303);
}
