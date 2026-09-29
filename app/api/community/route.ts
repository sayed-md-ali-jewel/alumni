import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Discussion } from '@/models/Discussion';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const batchYear = searchParams.get('batchYear');
    const group = searchParams.get('group');

    await connectToDatabase();

    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (batchYear && batchYear !== 'all') {
      query.batchYear = parseInt(batchYear, 10);
    }
    if (group && group !== 'all') {
      query.group = group;
    }

    const discussions = await Discussion.find(query)
      .populate('authorId', 'name image role isVerified')
      .populate('comments.authorId', 'name image role isVerified')
      .sort({ createdAt: -1 });

    return NextResponse.json(discussions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to post' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { title, content, category, batchYear, group, discussionId, commentContent } =
      await req.json();

    await connectToDatabase();

    // If adding comment to existing discussion
    if (discussionId && commentContent) {
      const updated = await Discussion.findByIdAndUpdate(
        discussionId,
        {
          $push: {
            comments: {
              authorId: userId,
              content: commentContent,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      ).populate('comments.authorId', 'name image role isVerified');

      return NextResponse.json(updated);
    }

    // Creating new discussion topic
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newDiscussion = await Discussion.create({
      title,
      content,
      category: category || 'General',
      batchYear: batchYear ? parseInt(batchYear, 10) : undefined,
      group,
      authorId: userId,
      comments: [],
      likes: [],
    });

    return NextResponse.json(newDiscussion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit discussion' }, { status: 500 });
  }
}
