import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await SiteSetting.findOne({ key: 'site_settings' }).lean();

    if (!settings) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS, {
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
    console.error('Error fetching public site settings:', error);
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}
