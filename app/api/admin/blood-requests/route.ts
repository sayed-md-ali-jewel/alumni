import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const bloodGroup = searchParams.get('bloodGroup');

    await connectToDatabase();

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email isVerified')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Admin blood requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch blood requests' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, status, urgency, additionalInformation } = body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await BloodRequest.findByIdAndUpdate(
      requestId,
      {
        ...(status ? { status } : {}),
        ...(urgency ? { urgency } : {}),
        ...(additionalInformation !== undefined ? { additionalInformation } : {}),
      },
      { new: true }
    ).populate('requesterId', 'name email');

    return NextResponse.json({ message: 'Blood request updated successfully', request: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update blood request' }, { status: 500 });
  }
}
