import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BankTransferRequest } from '@/models/BankTransferRequest';
import { BankTransferSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = BankTransferSchema.parse(body);

    await connectToDatabase();

    const existing = await BankTransferRequest.findOne({
      transactionRef: validated.transactionRef,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A deposit record with this transaction reference already exists.' },
        { status: 400 }
      );
    }

    const newRequest = await BankTransferRequest.create({
      ...validated,
      status: 'pending_review',
    });

    return NextResponse.json(
      {
        message: 'Bank transfer submitted successfully! Admin will verify shortly.',
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to submit bank transfer request' },
      { status: 500 }
    );
  }
}
