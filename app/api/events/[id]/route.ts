import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { Rsvp } from '@/models/Rsvp';
import { EventSchema } from '@/lib/validations';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const event = await Event.findById(params.id)
      .populate('attendees', 'name email image')
      .populate('createdBy', 'name email');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rsvps = await Rsvp.find({ eventId: params.id }).populate(
      'userId',
      'name email image'
    );

    return NextResponse.json({ event, rsvps });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const validated = EventSchema.parse(body);

    await connectToDatabase();
    const updated = await Event.findByIdAndUpdate(
      params.id,
      {
        ...validated,
        date: new Date(validated.date),
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    const errorMsg =
      error?.errors?.[0]?.message ||
      error?.issues?.[0]?.message ||
      error?.message ||
      'Failed to update event';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();
    await Promise.all([
      Event.findByIdAndDelete(params.id),
      Rsvp.deleteMany({ eventId: params.id }),
    ]);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
