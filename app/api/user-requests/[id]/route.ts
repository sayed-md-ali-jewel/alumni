import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { UserRequest } from '@/models/UserRequest';
import { Notification } from '@/models/Notification';
import { UserRequestStatusUpdateSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    await connectToDatabase();
    if (!mongoose.models.User) void User;

    const request = await UserRequest.findById(id)
      .populate('senderId', 'name email image role phone bloodGroup')
      .populate('recipientId', 'name email image role phone bloodGroup')
      .lean();

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const senderIdStr = (request.senderId as any)?._id?.toString() || (request.senderId as any)?.toString();
    const recipientIdStr = (request.recipientId as any)?._id?.toString() || (request.recipientId as any)?.toString();

    // Security: Only sender or recipient can access
    if (currentUserId !== senderIdStr && currentUserId !== recipientIdStr && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If recipient is opening unread request, mark read
    if (currentUserId === recipientIdStr && !request.read) {
      await UserRequest.findByIdAndUpdate(id, {
        read: true,
        readAt: new Date(),
        ...(request.status === 'Pending' ? { status: 'Read' } : {}),
      });
      request.read = true;
      if (request.status === 'Pending') request.status = 'Read' as any;
    }

    return NextResponse.json({ request });
  } catch (error: any) {
    console.error('Error fetching single user request:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch request' }, { status: 500 });
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

    const currentUserId = (session.user as any).id;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const request = await UserRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const senderIdStr = request.senderId.toString();
    const recipientIdStr = request.recipientId.toString();

    // Recipient actions (Accept, Reject, Mark Read)
    if (currentUserId !== recipientIdStr && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Only the recipient can update this request status' }, { status: 403 });
    }

    // Check if simple mark as read
    if (body.action === 'mark_read' || body.read === true) {
      request.read = true;
      request.readAt = new Date();
      if (request.status === 'Pending') {
        request.status = 'Read' as any;
      }
      await request.save();

      const updated = await UserRequest.findById(id)
        .populate('senderId', 'name email image role phone bloodGroup')
        .populate('recipientId', 'name email image role phone bloodGroup')
        .lean();

      return NextResponse.json({ message: 'Marked as read', request: updated });
    }

    // Validate status change (Accepted / Rejected / Read)
    const validatedData = UserRequestStatusUpdateSchema.parse(body);

    request.status = validatedData.status as any;
    request.read = true;
    request.readAt = request.readAt || new Date();
    if (validatedData.responseMessage !== undefined) {
      request.responseMessage = validatedData.responseMessage;
    }

    await request.save();

    // If Accepted or Rejected, notify sender
    if (validatedData.status === 'Accepted' || validatedData.status === 'Rejected') {
      const recipientName = session.user.name || 'Recipient';
      const statusIcon = validatedData.status === 'Accepted' ? '✅' : '❌';

      await Notification.create({
        userId: request.senderId,
        type: 'request_status',
        title: `${statusIcon} Message ${validatedData.status}`,
        message: `${recipientName} has ${validatedData.status.toLowerCase()} your message.${
          validatedData.responseMessage ? ` Note: "${validatedData.responseMessage}"` : ''
        }`,
        link: `/messages?user=${request.recipientId}`,
        read: false,
      });
    }

    const updated = await UserRequest.findById(id)
      .populate('senderId', 'name email image role phone bloodGroup')
      .populate('recipientId', 'name email image role phone bloodGroup')
      .lean();

    return NextResponse.json({
      message: `Request marked as ${validatedData.status}`,
      request: updated,
    });
  } catch (error: any) {
    console.error('Error updating user request:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error?.message || 'Failed to update request' }, { status: 500 });
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

    const currentUserId = (session.user as any).id;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    await connectToDatabase();
    const request = await UserRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const senderIdStr = request.senderId.toString();
    const isSender = currentUserId === senderIdStr;
    const isAdmin = (session.user as any).role === 'admin';

    if (!isSender && !isAdmin) {
      return NextResponse.json({ error: 'Only the sender can cancel this request' }, { status: 403 });
    }

    await UserRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user request:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete request' }, { status: 500 });
  }
}
