import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { JobPost } from '@/models/JobPost';
import { JobPostSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');

    await connectToDatabase();

    const query: any = { isActive: true };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const jobs = await JobPost.find(query)
      .populate('postedBy', 'name email image isVerified')
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to post a job opportunity' }, { status: 401 });
    }

    const body = await req.json();
    const validated = JobPostSchema.parse(body);

    const requirementsArray = validated.requirements
      ? validated.requirements
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

    await connectToDatabase();

    const newJob = await JobPost.create({
      ...validated,
      requirements: requirementsArray,
      postedBy: (session.user as any).id,
      isActive: true,
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to submit job posting' },
      { status: 500 }
    );
  }
}
