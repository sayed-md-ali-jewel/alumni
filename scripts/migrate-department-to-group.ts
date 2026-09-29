import mongoose from 'mongoose';
import { AlumniProfile } from '../models/AlumniProfile';
import { AlumniGroup } from '../lib/types';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_db';

/**
 * Migration Script: Safely migrate legacy `department` values to standard `group` (Science, Commerce, Humanities)
 * Requirement #29: Safe database migration
 */
async function migrateDepartmentToGroup() {
  console.log('Connecting to MongoDB for migration...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const profiles = await AlumniProfile.find({});
  console.log(`Found ${profiles.length} alumni profiles to inspect.`);

  let migratedCount = 0;
  let alreadyValidCount = 0;
  let manualReviewCount = 0;

  for (const profile of profiles) {
    const rawGroup = (profile as any).group;
    const rawDept = (profile as any).department;

    if (rawGroup && Object.values(AlumniGroup).includes(rawGroup as AlumniGroup)) {
      alreadyValidCount++;
      continue;
    }

    let targetGroup: AlumniGroup | null = null;
    const checkStr = (rawDept || rawGroup || '').toLowerCase();

    if (
      checkStr.includes('science') ||
      checkStr.includes('engineering') ||
      checkStr.includes('cse') ||
      checkStr.includes('eee') ||
      checkStr.includes('math') ||
      checkStr.includes('physics') ||
      checkStr.includes('chemistry') ||
      checkStr.includes('biology') ||
      checkStr.includes('architecture') ||
      checkStr.includes('civil')
    ) {
      targetGroup = AlumniGroup.SCIENCE;
    } else if (
      checkStr.includes('commerce') ||
      checkStr.includes('business') ||
      checkStr.includes('bba') ||
      checkStr.includes('accounting') ||
      checkStr.includes('finance') ||
      checkStr.includes('marketing') ||
      checkStr.includes('management')
    ) {
      targetGroup = AlumniGroup.COMMERCE;
    } else if (
      checkStr.includes('humanities') ||
      checkStr.includes('arts') ||
      checkStr.includes('economics') ||
      checkStr.includes('law') ||
      checkStr.includes('english') ||
      checkStr.includes('bangla') ||
      checkStr.includes('history') ||
      checkStr.includes('sociology')
    ) {
      targetGroup = AlumniGroup.HUMANITIES;
    }

    if (targetGroup) {
      profile.group = targetGroup;
      // Preserve old department field safely while populating new group
      await profile.save();
      migratedCount++;
      console.log(`✓ Migrated profile ${profile._id} (${rawDept || rawGroup}) -> ${targetGroup}`);
    } else {
      manualReviewCount++;
      console.warn(`⚠ Unmatched department for profile ${profile._id}: "${rawDept || rawGroup}". Flagged for manual review.`);
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total Inspected: ${profiles.length}`);
  console.log(`Already Valid: ${alreadyValidCount}`);
  console.log(`Successfully Migrated: ${migratedCount}`);
  console.log(`Flagged for Manual Review: ${manualReviewCount}`);

  await mongoose.disconnect();
  console.log('Migration finished & disconnected.');
}

migrateDepartmentToGroup().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
