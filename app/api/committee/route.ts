import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CommitteePost, ICommitteePost } from '@/models/CommitteePost';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { ensureDefaultCommitteePosts } from '@/lib/committee';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDefaultCommitteePosts();

    // Fetch active executive committee posts in sortOrder (EXCLUDING the default regular member post)
    const posts = await CommitteePost.find({
      isActive: true,
      isDefault: { $ne: true },
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    // Group members by specific non-default post
    const committeeSections = await Promise.all(
      posts.map(async (post) => {
        const members = await AlumniProfile.find({ committeePost: post._id })
          .populate({
            path: 'userId',
            select: 'name email image isVerified bloodGroup phone role',
            model: User,
          })
          .sort({ batchYear: 1, createdAt: 1 })
          .lean();

        // Filter out any orphaned profile without a valid user
        const validMembers = members.filter((m) => m.userId && (m.userId as any).name);

        return {
          ...post,
          members: validMembers,
          memberCount: validMembers.length,
        };
      })
    );

    return NextResponse.json({
      sections: committeeSections,
    });
  } catch (error: any) {
    console.error('Error fetching committee members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch committee structure', sections: [] },
      { status: 500 }
    );
  }
}
