import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Rsvp } from '@/models/Rsvp';
import { Event } from '@/models/Event';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to RSVP' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { eventId, status, guestsCount } = await req.json();

    if (!eventId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectToDatabase();

    const rsvp = await Rsvp.findOneAndUpdate(
      { userId, eventId },
      {
        status,
        guestsCount: guestsCount || 0,
      },
      { upsert: true, new: true }
    );

    // Update Event attendees array
    if (status === 'going') {
      await Event.findByIdAndUpdate(eventId, {
        $addToSet: { attendees: userId },
      });
    } else {
      await Event.findByIdAndUpdate(eventId, {
        $pull: { attendees: userId },
      });
    }

    return NextResponse.json({ message: 'RSVP updated successfully', rsvp });
  } catch (error: any) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
