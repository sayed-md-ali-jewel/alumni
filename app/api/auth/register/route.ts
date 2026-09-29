import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { RegisterSchema } from '@/lib/validations';
import { getDefaultCommitteePost } from '@/lib/committee';

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
    });

    // Automatically resolve default committee post (সদস্য / Member)
    const defaultPost = await getDefaultCommitteePost();

    await AlumniProfile.create({
      userId: newUser._id,
      batchYear: validatedData.batchYear,
      group: validatedData.group,
      bloodGroup: validatedData.bloodGroup,
      isBloodDonor: validatedData.isBloodDonor || false,
      donationStatus: 'Available',
      bloodDonationConsent: validatedData.isBloodDonor || false,
      donorLocation: 'Chattogram, Bangladesh',
      location: 'Chattogram, Bangladesh',
      phone: validatedData.phone || '',
      visibility: 'public',
      committeePost: defaultPost ? defaultPost._id : undefined,
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
