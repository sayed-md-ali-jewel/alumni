import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CommunitySetting } from '@/models/CommunitySetting';

// Fallback default settings
const DEFAULT_COMMUNITY_SETTINGS = {
  key: 'community_footer',
  communityName_en: 'our Alumni Community',
  communityName_bn: 'আমাদের অ্যালামনাই কমিউনিটি',
  whatsappUrl: '',
  whatsappNumber: '',
  facebookUrl: '',
  websiteUrl: '',
  customPrefix_en: 'Built with',
  customPrefix_bn: 'ভালোবাসা দিয়ে নির্মিত',
  customFor_en: 'for',
  customFor_bn: 'আমাদের',
  enabled: true,
  showSocialBadges: true,
};

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await CommunitySetting.findOne({ key: 'community_footer' }).lean();

    if (!settings) {
      // Return defaults if none created yet
      return NextResponse.json(DEFAULT_COMMUNITY_SETTINGS, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching community settings:', error);
    // Graceful fallback to avoid breaking footer
    return NextResponse.json(DEFAULT_COMMUNITY_SETTINGS);
  }
}
