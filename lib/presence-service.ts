/**
 * Server-side Presence Service
 * Tracks real-time active / online status of authenticated users.
 */

interface PresenceRecord {
  lastSeen: number;
  isOnline: boolean;
}

// Global registry singleton across Next.js dev server reloads
declare global {
  // eslint-disable-next-line no-var
  var __presenceRegistry: Map<string, PresenceRecord> | undefined;
}

const presenceRegistry =
  global.__presenceRegistry || new Map<string, PresenceRecord>();

if (process.env.NODE_ENV !== 'production') {
  global.__presenceRegistry = presenceRegistry;
}

// Presence timeout in milliseconds (60 seconds)
export const PRESENCE_TIMEOUT_MS = 60 * 1000;

/**
 * Record an active heartbeat for a logged-in user
 */
export function recordHeartbeat(userId: string | null | undefined): void {
  if (!userId) return;
  const normalizedId = String(userId).trim();
  if (!normalizedId) return;

  presenceRegistry.set(normalizedId, {
    lastSeen: Date.now(),
    isOnline: true,
  });
}

/**
 * Explicitly mark a user as offline (e.g. on logout or tab close)
 */
export function recordOffline(userId: string | null | undefined): void {
  if (!userId) return;
  const normalizedId = String(userId).trim();
  if (!normalizedId) return;

  presenceRegistry.set(normalizedId, {
    lastSeen: 0,
    isOnline: false,
  });
}

/**
 * Check if a user is genuinely online and currently active
 */
export function isUserOnline(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const normalizedId = String(userId).trim();
  if (!normalizedId) return false;

  const record = presenceRegistry.get(normalizedId);
  if (!record || !record.isOnline) return false;

  const now = Date.now();
  const elapsed = now - record.lastSeen;
  if (elapsed >= PRESENCE_TIMEOUT_MS) {
    // Timeout expired - mark offline
    record.isOnline = false;
    return false;
  }

  return true;
}

/**
 * Get detailed presence state for a single user
 */
export function getUserPresence(userId: string | null | undefined): {
  isOnline: boolean;
  lastActiveAt: number | null;
} {
  if (!userId) {
    return { isOnline: false, lastActiveAt: null };
  }
  const normalizedId = String(userId).trim();
  const online = isUserOnline(normalizedId);
  const record = presenceRegistry.get(normalizedId);

  return {
    isOnline: online,
    lastActiveAt: record?.lastSeen && record.lastSeen > 0 ? record.lastSeen : null,
  };
}

/**
 * Batch presence lookup for multiple users
 */
export function getUsersPresence(
  userIds: (string | null | undefined)[]
): Record<string, { isOnline: boolean; lastActiveAt: number | null }> {
  const result: Record<string, { isOnline: boolean; lastActiveAt: number | null }> = {};

  for (const id of userIds) {
    if (!id) continue;
    const normalizedId = String(id).trim();
    result[normalizedId] = getUserPresence(normalizedId);
  }

  return result;
}
