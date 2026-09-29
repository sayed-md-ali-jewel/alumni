import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { BloodRequest } from '@/models/BloodRequest';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const { searchParams } = new URL(req.url);

    const role = searchParams.get('role') || 'donor'; // 'donor' | 'requester' | 'admin'
    const status = searchParams.get('status') || 'all';
    const bloodRequestId = searchParams.get('bloodRequestId');

    await connectToDatabase();

    // 1. If bloodRequestId is specified: fetch all responses for that specific request (Requester or Admin view)
    if (bloodRequestId) {
      if (!mongoose.Types.ObjectId.isValid(bloodRequestId)) {
        return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
      }

      const request = await BloodRequest.findById(bloodRequestId);
      if (!request) {
        return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
      }

      // Authorization check: must be the requester or admin
      if (request.requesterId.toString() !== userId && userRole !== 'admin') {
        return NextResponse.json(
          { error: 'You do not have permission to view responses for this request' },
          { status: 403 }
        );
      }

      const query: any = { bloodRequestId: new mongoose.Types.ObjectId(bloodRequestId) };
      if (status && status !== 'all') {
        query.status = status;
      }

      const responses = await BloodRequestResponse.find(query)
        .populate('donorId', 'name email image isVerified phone bloodGroup')
        .populate('donorProfileId', 'group batchYear donorLocation location bloodGroup donationStatus nextEligibleDate')
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean();

      // Calculate response summary stats
      const [totalCount, pendingCount, acceptedCount, declinedCount, completedCount] = await Promise.all([
        BloodRequestResponse.countDocuments({ bloodRequestId }),
        BloodRequestResponse.countDocuments({ bloodRequestId, status: 'pending' }),
        BloodRequestResponse.countDocuments({ bloodRequestId, status: 'accepted' }),
        BloodRequestResponse.countDocuments({ bloodRequestId, status: 'declined' }),
        BloodRequestResponse.countDocuments({ bloodRequestId, status: 'completed' }),
      ]);

      return NextResponse.json({
        responses,
        counts: {
          total: totalCount,
          pending: pendingCount,
          accepted: acceptedCount,
          declined: declinedCount,
          completed: completedCount,
        },
      });
    }

    // 2. Default: Donor view (requests received by the authenticated donor)
    if (role === 'donor') {
      const query: any = { donorId: new mongoose.Types.ObjectId(userId) };
      if (status && status !== 'all') {
        query.status = status;
      }

      const rawResponses = await BloodRequestResponse.find(query)
        .populate({
          path: 'bloodRequestId',
          populate: {
            path: 'requesterId',
            select: 'name email image isVerified phone',
          },
        })
        .populate('requesterId', 'name email image isVerified phone')
        .sort({ createdAt: -1 })
        .lean();

      // Filter out any where blood request was deleted or invalid
      const responses = rawResponses.filter((r: any) => r.bloodRequestId);

      const [totalCount, pendingCount, acceptedCount, declinedCount, completedCount] = await Promise.all([
        BloodRequestResponse.countDocuments({ donorId: userId }),
        BloodRequestResponse.countDocuments({ donorId: userId, status: 'pending' }),
        BloodRequestResponse.countDocuments({ donorId: userId, status: 'accepted' }),
        BloodRequestResponse.countDocuments({ donorId: userId, status: 'declined' }),
        BloodRequestResponse.countDocuments({ donorId: userId, status: 'completed' }),
      ]);

      return NextResponse.json({
        responses,
        counts: {
          total: totalCount,
          pending: pendingCount,
          accepted: acceptedCount,
          declined: declinedCount,
          completed: completedCount,
        },
      });
    }

    // 3. Requester view: all responses across all requests created by this user
    if (role === 'requester') {
      const query: any = { requesterId: new mongoose.Types.ObjectId(userId) };
      if (status && status !== 'all') {
        query.status = status;
      }

      const responses = await BloodRequestResponse.find(query)
        .populate('bloodRequestId')
        .populate('donorId', 'name email image isVerified phone bloodGroup')
        .populate('donorProfileId', 'group batchYear donorLocation location bloodGroup donationStatus')
        .sort({ createdAt: -1 })
        .lean();

      const [totalCount, pendingCount, acceptedCount, declinedCount, completedCount] = await Promise.all([
        BloodRequestResponse.countDocuments({ requesterId: userId }),
        BloodRequestResponse.countDocuments({ requesterId: userId, status: 'pending' }),
        BloodRequestResponse.countDocuments({ requesterId: userId, status: 'accepted' }),
        BloodRequestResponse.countDocuments({ requesterId: userId, status: 'declined' }),
        BloodRequestResponse.countDocuments({ requesterId: userId, status: 'completed' }),
      ]);

      return NextResponse.json({
        responses,
        counts: {
          total: totalCount,
          pending: pendingCount,
          accepted: acceptedCount,
          declined: declinedCount,
          completed: completedCount,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid role parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching blood request responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood request responses' },
      { status: 500 }
    );
  }
}
