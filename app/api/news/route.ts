import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { NewsPost } from '@/models/NewsPost';
import { NewsSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    await connectToDatabase();

    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const posts = await NewsPost.find(query)
      .populate('authorId', 'name image role')
      .sort({ publishedAt: -1 })
      .limit(limit);

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const validated = NewsSchema.parse(body);

    await connectToDatabase();

    const existingSlug = await NewsPost.findOne({ slug: validated.slug });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already exists. Please choose a unique slug.' }, { status: 400 });
    }

    const newPost = await NewsPost.create({
      ...validated,
      authorId: (session.user as any).id,
      publishedAt: new Date(),
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    const errorMsg =
      error?.errors?.[0]?.message ||
      error?.issues?.[0]?.message ||
      error?.message ||
      'Failed to publish news post';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const validated = NewsSchema.parse(data);

    await connectToDatabase();

    // Check if slug is used by another post
    const existingSlug = await NewsPost.findOne({
      slug: validated.slug,
      _id: { $ne: id },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use by another article' }, { status: 400 });
    }

    const updated = await NewsPost.findByIdAndUpdate(
      id,
      { ...validated },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    const errorMsg =
      error?.errors?.[0]?.message ||
      error?.issues?.[0]?.message ||
      error?.message ||
      'Failed to update news post';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await NewsPost.findByIdAndDelete(id);

    return NextResponse.json({ message: 'News article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}

