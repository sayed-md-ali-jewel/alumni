import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const tran_id = formData.get('tran_id') as string;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (tran_id) {
      await connectToDatabase();
      await Donation.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
    }

    return NextResponse.redirect(`${appUrl}/bn/donate/fail?tran_id=${tran_id || ''}`, 303);
  } catch (error) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/bn/donate/fail`, 303);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tran_id = searchParams.get('tran_id');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (tran_id) {
    await connectToDatabase();
    await Donation.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
  }

  return NextResponse.redirect(`${appUrl}/bn/donate/fail?tran_id=${tran_id || ''}`, 303);
}
