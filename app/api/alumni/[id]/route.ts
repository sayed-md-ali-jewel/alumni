import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if ID matches Profile ID or User ID
    let profile = await AlumniProfile.findById(id).populate(
      'userId',
      'name email image isVerified role phone'
    );

    if (!profile) {
      profile = await AlumniProfile.findOne({ userId: id }).populate(
        'userId',
        'name email image isVerified role phone'
      );
    }

    if (!profile) {
      return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching alumni profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
