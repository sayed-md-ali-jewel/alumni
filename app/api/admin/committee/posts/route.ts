import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CommitteePost } from '@/models/CommitteePost';
import { AlumniProfile } from '@/models/AlumniProfile';
import { ensureDefaultCommitteePosts } from '@/lib/committee';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();
    await ensureDefaultCommitteePosts();

    const posts = await CommitteePost.find().sort({ sortOrder: 1, createdAt: 1 }).lean();

    // Attach member count for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (p) => {
        let count = 0;
        if (p.isDefault) {
          count = await AlumniProfile.countDocuments({
            $or: [
              { committeePost: p._id },
              { committeePost: { $exists: false } },
              { committeePost: null },
            ],
          });
        } else {
          count = await AlumniProfile.countDocuments({ committeePost: p._id });
        }
        return {
          ...p,
          memberCount: count,
        };
      })
    );

    return NextResponse.json({ posts: postsWithCounts });
  } catch (error: any) {
    console.error('Error fetching admin committee posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name_en,
      name_bn,
      description_en = '',
      description_bn = '',
      sortOrder = 0,
      isActive = true,
      isDefault = false,
    } = body;

    if (!name_en?.trim() || !name_bn?.trim()) {
      return NextResponse.json(
        { error: 'Post name in both English and Bengali is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If marked as default, unset existing default
    if (isDefault) {
      await CommitteePost.updateMany({}, { $set: { isDefault: false } });
    }

    const newPost = await CommitteePost.create({
      name_en: name_en.trim(),
      name_bn: name_bn.trim(),
      description_en: description_en.trim(),
      description_bn: description_bn.trim(),
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
      isDefault: isDefault === true,
    });

    return NextResponse.json(
      { message: 'Committee post created successfully', post: newPost },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating committee post:', error);
    return NextResponse.json({ error: 'Failed to create committee post' }, { status: 500 });
  }
}
