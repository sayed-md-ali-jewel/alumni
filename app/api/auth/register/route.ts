import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { Donation } from '@/models/Donation';
import { RegisterSchema } from '@/lib/validations';
import { getDefaultCommitteePost } from '@/lib/committee';
import { generateTxnId, generateReceiptNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.parse(body);

    await connectToDatabase();

    const existingUser = await User.findOne({
      email: validatedData.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'alumni',
      isVerified: false,
      phone: validatedData.phone,
      bloodGroup: validatedData.bloodGroup,
      image: validatedData.image || '',
    });

    // Automatically resolve default committee post (সদস্য / Member)
    const defaultPost = await getDefaultCommitteePost();

    await AlumniProfile.create({
      userId: newUser._id,
      batchYear: validatedData.batchYear,
      group: validatedData.group,
      bloodGroup: validatedData.bloodGroup,
      isBloodDonor: false,
      donationStatus: 'Available',
      bloodDonationConsent: false,
      donorLocation: validatedData.presentAddress || 'Chattogram, Bangladesh',
      location: validatedData.presentAddress || 'Chattogram, Bangladesh',
      presentAddress: validatedData.presentAddress,
      permanentAddress: validatedData.permanentAddress,
      phone: validatedData.phone || '',
      visibility: 'public',
      committeePost: defaultPost ? defaultPost._id : undefined,
    });

    // Record the registration fee payment
    const payment = validatedData.payment;
    const isCash = payment.paymentType === 'cash';
    const txnId = isCash
      ? payment.receiptNumber || generateTxnId('CSH')
      : payment.transactionId || generateTxnId(payment.paymentType.toUpperCase());
    const receiptNo = payment.receiptNumber || generateReceiptNumber();

    await Donation.create({
      donorName: validatedData.name,
      donorEmail: validatedData.email.toLowerCase().trim(),
      donorPhone: validatedData.phone,
      amount: payment.amount,
      currency: 'BDT',
      campaign: 'Alumni Lifetime Membership & Registration Fee',
      isAnonymous: false,
      method: payment.paymentType,
      transactionId: txnId,
      receiptNumber: receiptNo,
      status: 'pending',
      userId: newUser._id,
      recipientName: payment.givenTo || 'Alumni Association Desk',
      givenTo: payment.givenTo || 'Alumni Association Desk',
      donationDate: payment.paymentDateTime ? new Date(payment.paymentDateTime) : new Date(),
      donationTime: payment.paymentDateTime || undefined,
      notes: `Registration payment via ${payment.paymentType.toUpperCase()}.${payment.givenTo ? ` Given to: ${payment.givenTo}.` : ''}${payment.receiptNumber ? ` Receipt No: ${payment.receiptNumber}` : ''}`,
    });

    return NextResponse.json(
      {
        message: 'Account registered successfully!',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        {
          error: messages.join('. ') || 'Validation error',
          errors: messages,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to register account' },
      { status: 500 }
    );
  }
}
