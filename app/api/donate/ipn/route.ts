import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { validateSSLCommerzPayment } from '@/lib/sslcommerz';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const val_id = formData.get('val_id') as string;
    const status = formData.get('status') as string;
    const bank_tran_id = formData.get('bank_tran_id') as string;
    const card_type = formData.get('card_type') as string;

    if (!tran_id || !val_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectToDatabase();

    // Validate with SSLCommerz server
    const validation = await validateSSLCommerzPayment(val_id);

    if (validation.status === 'VALID' || status === 'VALID' || status === 'VALIDATED') {
      await Donation.findOneAndUpdate(
        { transactionId: tran_id },
        {
          status: 'completed',
          valId: val_id,
          bankTranId: bank_tran_id || '',
          cardType: card_type || '',
          paidAt: new Date(),
        }
      );
      return NextResponse.json({ message: 'IPN processed successfully' });
    }

    return NextResponse.json({ error: 'Invalid transaction validation' }, { status: 400 });
  } catch (error) {
    console.error('IPN processing error:', error);
    return NextResponse.json({ error: 'IPN processing error' }, { status: 500 });
  }
}
