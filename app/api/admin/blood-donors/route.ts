import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const bloodGroup = searchParams.get('bloodGroup');
    const group = searchParams.get('group');
    const status = searchParams.get('status');

    await connectToDatabase();

    const query: any = { isBloodDonor: true };

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (group && group !== 'all') {
      query.group = group;
    }

    if (status && status !== 'all') {
      query.donationStatus = status;
    }

    if (q) {
      const users = await User.find({ name: { $regex: q, $options: 'i' } }).select('_id');
      const uIds = users.map((u) => u._id);
      query.$or = [
        { userId: { $in: uIds } },
        { location: { $regex: q, $options: 'i' } },
        { donorLocation: { $regex: q, $options: 'i' } },
      ];
    }

    const donors = await AlumniProfile.find(query)
      .populate('userId', 'name email image isVerified phone role')
      .sort({ createdAt: -1 });

    return NextResponse.json({ donors });
  } catch (error: any) {
    console.error('Admin donors error:', error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { profileId, donationStatus, bloodDonationConsent } = body;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await AlumniProfile.findByIdAndUpdate(
      profileId,
      {
        ...(donationStatus ? { donationStatus } : {}),
        ...(bloodDonationConsent !== undefined ? { bloodDonationConsent } : {}),
      },
      { new: true }
    ).populate('userId', 'name email isVerified');

    return NextResponse.json({ message: 'Donor status updated', donor: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update donor' }, { status: 500 });
  }
}
