import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { userId, isVerified } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: Boolean(isVerified) },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user verification' }, { status: 500 });
  }
}
