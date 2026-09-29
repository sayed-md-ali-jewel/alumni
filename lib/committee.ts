import { connectToDatabase } from '@/lib/mongodb';
import { CommitteePost, ICommitteePost } from '@/models/CommitteePost';

export const DEFAULT_COMMITTEE_POSTS = [
  {
    name_bn: 'সভাপতি',
    name_en: 'President',
    description_bn: 'অ্যাসোসিয়েশনের প্রধান নির্বাহী ও পরিচালনা পর্ষদ সভাপতি',
    description_en: 'Executive Head and President of the Association Board',
    sortOrder: 1,
    isActive: true,
    isDefault: false,
  },
  {
    name_bn: 'সহ সভাপতি',
    name_en: 'Vice President',
    description_bn: 'কার্যনির্বাহী সহ-সভাপতি',
    description_en: 'Executive Vice President',
    sortOrder: 2,
    isActive: true,
    isDefault: false,
  },
  {
    name_bn: 'সাধারণ সম্পাদক',
    name_en: 'Secretary',
    description_bn: 'সাধারণ সম্পাদক ও প্রশাসনিক সমন্বয়কারী',
    description_en: 'General Secretary & Administrative Coordinator',
    sortOrder: 3,
    isActive: true,
    isDefault: false,
  },
  {
    name_bn: 'সদস্য',
    name_en: 'Member',
    description_bn: 'সাধারণ কার্যনির্বাহী ও অ্যালামনাই সদস্য',
    description_en: 'General Executive & Alumni Member',
    sortOrder: 4,
    isActive: true,
    isDefault: true,
  },
];

/**
 * Ensures default committee posts exist in database
 */
export async function ensureDefaultCommitteePosts() {
  await connectToDatabase();
  const count = await CommitteePost.countDocuments();
  if (count === 0) {
    await CommitteePost.insertMany(DEFAULT_COMMITTEE_POSTS);
  }
}

/**
 * Gets the default committee post (সদস্য / Member)
 */
export async function getDefaultCommitteePost(): Promise<ICommitteePost | null> {
  await connectToDatabase();
  await ensureDefaultCommitteePosts();

  // Try finding default designated post
  let defaultPost = await CommitteePost.findOne({ isDefault: true, isActive: true });
  if (!defaultPost) {
    defaultPost = await CommitteePost.findOne({ name_bn: 'সদস্য' });
  }
  if (!defaultPost) {
    defaultPost = await CommitteePost.findOne({ isDefault: true });
  }
  if (!defaultPost) {
    defaultPost = await CommitteePost.findOne().sort({ sortOrder: 1 });
  }
  return defaultPost;
}
