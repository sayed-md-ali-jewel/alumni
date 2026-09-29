import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid donor ID' }, { status: 400 });
    }

    await connectToDatabase();

    let donor = await AlumniProfile.findOne({
      _id: id,
      isBloodDonor: true,
      bloodDonationConsent: true,
    }).populate('userId', 'name image isVerified role');

    if (!donor) {
      donor = await AlumniProfile.findOne({
        userId: id,
        isBloodDonor: true,
        bloodDonationConsent: true,
      }).populate('userId', 'name image isVerified role');
    }

    if (!donor) {
      return NextResponse.json({ error: 'Blood donor not found or opted out' }, { status: 404 });
    }

    return NextResponse.json(donor);
  } catch (error: any) {
    console.error('Error fetching donor profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donor profile' },
      { status: 500 }
    );
  }
}
