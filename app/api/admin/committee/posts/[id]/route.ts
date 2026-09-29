import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CommitteePost } from '@/models/CommitteePost';
import { AlumniProfile } from '@/models/AlumniProfile';
import { getDefaultCommitteePost } from '@/lib/committee';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    await connectToDatabase();
    const post = await CommitteePost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const body = await req.json();
    await connectToDatabase();

    // If setting as default, unset others
    if (body.isDefault === true) {
      await CommitteePost.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } });
    }

    const updatedPost = await CommitteePost.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Committee post updated successfully',
      post: updatedPost,
    });
  } catch (error: any) {
    console.error('Error updating committee post:', error);
    return NextResponse.json({ error: 'Failed to update committee post' }, { status: 500 });
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

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    await connectToDatabase();
    const postToDelete = await CommitteePost.findById(id);

    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (postToDelete.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default committee post. Please assign another default post first.' },
        { status: 400 }
      );
    }

    // Reassign members belonging to this post to default post
    const defaultPost = await getDefaultCommitteePost();
    if (defaultPost) {
      await AlumniProfile.updateMany(
        { committeePost: id },
        { $set: { committeePost: defaultPost._id } }
      );
    }

    await CommitteePost.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Committee post deleted successfully, members migrated to default post.',
    });
  } catch (error: any) {
    console.error('Error deleting committee post:', error);
    return NextResponse.json({ error: 'Failed to delete committee post' }, { status: 500 });
  }
}
