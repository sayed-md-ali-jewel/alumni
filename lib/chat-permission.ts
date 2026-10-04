import { connectToDatabase } from '@/lib/mongodb';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export interface ChatPermissionResult {
  isAllowed: boolean;
  isGlobalEnabled: boolean;
  isUserEnabled: boolean;
  reason: 'enabled' | 'global_disabled' | 'user_disabled' | 'unauthenticated';
  message: string;
}

/**
 * Priority Logic for Chat Access:
 * 1. Global Chat OFF -> Chat disabled for everyone
 * 2. Global Chat ON + Individual Chat OFF -> Chat disabled only for that alumni
 * 3. Global Chat ON + Individual Chat ON -> Chat available
 */
export async function getChatPermission(userId?: string | null): Promise<ChatPermissionResult> {
  await connectToDatabase();

  // 1. Check Global Chat Setting
  let isGlobalEnabled = true;
  try {
    const siteSettings = await SiteSetting.findOne({ key: 'site_settings' }).lean();
    if (siteSettings) {
      isGlobalEnabled = siteSettings.isChatEnabled !== false;
    } else {
      isGlobalEnabled = DEFAULT_SITE_SETTINGS.isChatEnabled !== false;
    }
  } catch (err) {
    console.error('Error fetching global chat setting:', err);
    isGlobalEnabled = true;
  }

  // If Global Chat is OFF -> Chat disabled for everyone
  if (!isGlobalEnabled) {
    return {
      isAllowed: false,
      isGlobalEnabled: false,
      isUserEnabled: true,
      reason: 'global_disabled',
      message: 'Chat functionality is currently disabled across the system by administrator.',
    };
  }

  // If no user is logged in
  if (!userId) {
    return {
      isAllowed: false,
      isGlobalEnabled: true,
      isUserEnabled: false,
      reason: 'unauthenticated',
      message: 'Please sign in to access chat.',
    };
  }

  // 2. Check Individual Alumni Chat Setting
  let isUserEnabled = true;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const user = await User.findById(userId).select('isChatEnabled role').lean();
      if (user) {
        isUserEnabled = user.isChatEnabled !== false;
      }
    } catch (err) {
      console.error('Error fetching user chat permission:', err);
      isUserEnabled = true;
    }
  }

  // If Individual Chat is OFF -> Chat disabled only for that alumni
  if (!isUserEnabled) {
    return {
      isAllowed: false,
      isGlobalEnabled: true,
      isUserEnabled: false,
      reason: 'user_disabled',
      message: 'Chat is currently unavailable for your account.',
    };
  }

  // Global ON + Individual ON -> Chat available
  return {
    isAllowed: true,
    isGlobalEnabled: true,
    isUserEnabled: true,
    reason: 'enabled',
    message: 'Chat is available.',
  };
}
