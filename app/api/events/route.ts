import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { EventSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'upcoming', 'past', or 'all'
    const category = searchParams.get('category');

    await connectToDatabase();

    const query: any = {};
    const now = new Date();

    if (filter === 'upcoming') {
      query.date = { $gte: now };
    } else if (filter === 'past') {
      query.date = { $lt: now };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const events = await Event.find(query)
      .populate('attendees', 'name email image')
      .populate('createdBy', 'name email')
      .sort({ date: filter === 'past' ? -1 : 1 });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const validated = EventSchema.parse(body);

    await connectToDatabase();

    const newEvent = await Event.create({
      ...validated,
      date: new Date(validated.date),
      createdBy: (session.user as any).id,
      attendees: [],
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    const errorMsg =
      error?.errors?.[0]?.message ||
      error?.issues?.[0]?.message ||
      error?.message ||
      'Failed to create event';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
