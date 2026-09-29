import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { AdminDonationSchema } from '@/lib/validations';
import { generateReceiptNumber } from '@/lib/utils';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
    }

    await connectToDatabase();
    const donation = await Donation.findById(id).lean();

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error: any) {
    console.error('Error fetching single donation:', error);
    return NextResponse.json({ error: 'Failed to fetch donation' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
    }

    const body = await req.json();
    const validated = AdminDonationSchema.parse(body);

    await connectToDatabase();

    const existing = await Donation.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    // If status became completed and has no receipt number, generate one
    let receiptNumber = validated.receiptNumber || existing.receiptNumber;
    if (validated.status === 'completed' && !receiptNumber) {
      receiptNumber = generateReceiptNumber();
    }

    const updatePayload: any = {
      donorName: validated.donorName.trim(),
      donorEmail: validated.donorEmail.toLowerCase().trim(),
      donorPhone: validated.donorPhone?.trim() || undefined,
      amount: validated.amount,
      campaign: validated.campaign.trim(),
      method: validated.method,
      status: validated.status,
      isAnonymous: Boolean(validated.isAnonymous),
      receiptNumber,
      recipientName: validated.recipientName || validated.givenTo || undefined,
      givenTo: validated.givenTo || validated.recipientName || undefined,
      recipientId: validated.recipientId || undefined,
      donationDate: validated.donationDate ? new Date(validated.donationDate) : existing.donationDate || new Date(),
      donationTime: validated.donationTime || undefined,
      notes: validated.notes || undefined,
    };

    if (validated.transactionId && validated.transactionId.trim()) {
      updatePayload.transactionId = validated.transactionId.trim();
    }

    if (validated.status === 'completed') {
      updatePayload.paidAt = validated.paidAt ? new Date(validated.paidAt) : existing.paidAt || new Date();
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Donation record updated successfully.',
      donation: updatedDonation,
    });
  } catch (error: any) {
    console.error('Error updating donation:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Donation.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Donation record permanently deleted.',
    });
  } catch (error: any) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
