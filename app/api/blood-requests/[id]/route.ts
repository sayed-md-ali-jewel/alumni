import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { BloodRequest } from '@/models/BloodRequest';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { BloodDonation } from '@/models/BloodDonation';
import { BloodRequestResponse } from '@/models/BloodRequestResponse';
import { BloodRequestUpdateSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
    }

    await connectToDatabase();

    const request = await BloodRequest.findById(id)
      .populate('requesterId', 'name email image isVerified phone')
      .populate('acceptedByUserId', 'name email image phone bloodGroup isVerified')
      .populate('acceptedByDonorId', 'group batchYear donorLocation location bloodGroup');

    if (!request) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id?.toString();
    const requesterIdStr = (request.requesterId as any)?._id?.toString() || request.requesterId?.toString();

    // Clean up any historic self-contact entries in MongoDB if they exist
    if (request.contactedDonors && request.contactedDonors.length > 0) {
      const hasSelfContact = request.contactedDonors.some((cd: any) => {
        const cdDonorUserId = cd.donorUserId?._id?.toString() || cd.donorUserId?.toString();
        const cdDonorId = cd.donorId?._id?.toString() || cd.donorId?.toString();
        const cdContactedBy = cd.contactedBy?.toString();
        return (
          (requesterIdStr && (cdDonorUserId === requesterIdStr || cdDonorId === requesterIdStr)) ||
          (cdContactedBy && cdDonorUserId && cdContactedBy === cdDonorUserId)
        );
      });

      if (hasSelfContact && requesterIdStr && mongoose.Types.ObjectId.isValid(requesterIdStr)) {
        await BloodRequest.findByIdAndUpdate(id, {
          $pull: {
            contactedDonors: {
              $or: [
                { donorUserId: new mongoose.Types.ObjectId(requesterIdStr) },
                { donorId: new mongoose.Types.ObjectId(requesterIdStr) },
              ],
            },
          },
        });
      }
    }

    const requestObj: any = request.toObject ? request.toObject() : request;
    if (requestObj.contactedDonors) {
      requestObj.contactedDonors = requestObj.contactedDonors.filter((cd: any) => {
        const cdDonorUserId = cd.donorUserId?._id?.toString() || cd.donorUserId?.toString();
        const cdDonorId = cd.donorId?._id?.toString() || cd.donorId?.toString();
        if (currentUserId && (cdDonorUserId === currentUserId || cdDonorId === currentUserId)) {
          return false;
        }
        if (requesterIdStr && (cdDonorUserId === requesterIdStr || cdDonorId === requesterIdStr)) {
          return false;
        }
        return true;
      });
    }

    // Fetch verified fulfilling donations and responses
    const [fulfillingDonations, completedResponses] = await Promise.all([
      BloodDonation.find({ bloodRequestId: id })
        .populate('donorId', 'name email image phone bloodGroup isVerified')
        .populate('confirmedBy', 'name email')
        .sort({ donationDate: -1 })
        .lean(),
      BloodRequestResponse.find({ bloodRequestId: id, status: 'completed' })
        .populate('donorId', 'name email image phone bloodGroup isVerified')
        .populate('donorProfileId', 'group batchYear donorLocation location bloodGroup')
        .sort({ completedAt: -1 })
        .lean(),
    ]);

    requestObj.fulfillingDonations = fulfillingDonations;
    requestObj.completedResponses = completedResponses;

    return NextResponse.json(requestObj);
  } catch (error: any) {
    console.error('Error fetching blood request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blood request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
    }

    await connectToDatabase();

    const existingRequest = await BloodRequest.findById(id);
    if (!existingRequest) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    // Check authorization: must be requester or admin
    if (existingRequest.requesterId.toString() !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'You do not have permission to modify this request' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = BloodRequestUpdateSchema.parse(body);

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        ...(validatedData.requiredDate ? { requiredDate: new Date(validatedData.requiredDate) } : {}),
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Blood request updated successfully',
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error('Error updating blood request:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to update blood request' },
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
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blood request ID' }, { status: 400 });
    }

    await connectToDatabase();

    const existingRequest = await BloodRequest.findById(id);
    if (!existingRequest) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    if (existingRequest.requesterId.toString() !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'You do not have permission to delete this request' }, { status: 403 });
    }

    await BloodRequest.findByIdAndUpdate(id, { status: 'Cancelled' });

    return NextResponse.json({ message: 'Blood request marked as cancelled' });
  } catch (error: any) {
    console.error('Error cancelling blood request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel blood request' },
      { status: 500 }
    );
  }
}
