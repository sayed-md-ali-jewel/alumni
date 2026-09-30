import { connectToDatabase } from '@/lib/mongodb';
import { BlockedUser } from '@/models/BlockedUser';
import mongoose from 'mongoose';

/**
 * Check mutual or directional block status between two users.
 */
export async function checkBlockStatus(
  viewerUserId: string | mongoose.Types.ObjectId,
  targetUserId: string | mongoose.Types.ObjectId
) {
  await connectToDatabase();

  const viewerIdStr = viewerUserId.toString();
  const targetIdStr = targetUserId.toString();

  if (viewerIdStr === targetIdStr) {
    return {
      isSelf: true,
      isBlockedByViewer: false,
      isBlockedByTarget: false,
      isBlockedEitherWay: false,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(viewerIdStr) || !mongoose.Types.ObjectId.isValid(targetIdStr)) {
    return {
      isSelf: false,
      isBlockedByViewer: false,
      isBlockedByTarget: false,
      isBlockedEitherWay: false,
    };
  }

  const vId = new mongoose.Types.ObjectId(viewerIdStr);
  const tId = new mongoose.Types.ObjectId(targetIdStr);

  const [viewerBlockedTarget, targetBlockedViewer] = await Promise.all([
    BlockedUser.findOne({ blockerId: vId, blockedUserId: tId }).lean(),
    BlockedUser.findOne({ blockerId: tId, blockedUserId: vId }).lean(),
  ]);

  return {
    isSelf: false,
    isBlockedByViewer: Boolean(viewerBlockedTarget),
    isBlockedByTarget: Boolean(targetBlockedViewer),
    isBlockedEitherWay: Boolean(viewerBlockedTarget || targetBlockedViewer),
  };
}

/**
 * Validates whether a sender can interact with/send a request or inquiry to a recipient.
 */
export async function canUserInteract(
  senderUserId: string | mongoose.Types.ObjectId,
  recipientUserId: string | mongoose.Types.ObjectId
): Promise<{ allowed: boolean; reason?: string; isBlockedByViewer?: boolean; isBlockedByTarget?: boolean }> {
  const senderStr = senderUserId.toString();
  const recipientStr = recipientUserId.toString();

  if (senderStr === recipientStr) {
    return {
      allowed: false,
      reason: 'You cannot send a request or message to yourself.',
    };
  }

  const { isBlockedByViewer, isBlockedByTarget } = await checkBlockStatus(senderUserId, recipientUserId);

  if (isBlockedByViewer) {
    return {
      allowed: false,
      reason: 'You have blocked this user. Please unblock them to send requests or messages.',
      isBlockedByViewer: true,
    };
  }

  if (isBlockedByTarget) {
    return {
      allowed: false,
      reason: 'Unable to send request. This user is not accepting messages from you.',
      isBlockedByTarget: true,
    };
  }

  return { allowed: true };
}

/**
 * Retrieve all user IDs blocked by the given user.
 */
export async function getBlockedUserIds(userId: string | mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]> {
  await connectToDatabase();
  const uId = new mongoose.Types.ObjectId(userId.toString());
  const records = await BlockedUser.find({ blockerId: uId }).select('blockedUserId').lean();
  return records.map((r) => r.blockedUserId);
}
