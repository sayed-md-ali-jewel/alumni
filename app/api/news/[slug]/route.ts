import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NewsPost } from '@/models/NewsPost';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const post = await NewsPost.findOneAndUpdate(
      { slug: params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('authorId', 'name image role');

    if (!post) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get related articles
    const related = await NewsPost.find({
      _id: { $ne: post._id },
      category: post.category,
    })
      .limit(3)
      .select('title_bn title_en slug publishedAt image category');

    return NextResponse.json({ post, related });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
