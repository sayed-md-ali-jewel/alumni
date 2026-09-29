import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CommunitySetting } from '@/models/CommunitySetting';

// Helper to normalize WhatsApp link
function normalizeWhatsAppUrl(inputUrl: string, inputNumber: string): string {
  const url = (inputUrl || '').trim();
  const num = (inputNumber || '').replace(/[^0-9+]/g, '');

  if (url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If user provided a phone number or raw handle in whatsappUrl field
    const cleanNum = url.replace(/[^0-9]/g, '');
    if (cleanNum.length >= 7) {
      return `https://wa.me/${cleanNum}`;
    }
    return `https://${url}`;
  }

  if (num) {
    const cleanNum = num.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}`;
  }

  return '';
}

// Helper to normalize Facebook URL
function normalizeFacebookUrl(inputUrl: string): string {
  const url = (inputUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    await connectToDatabase();

    let settings = await CommunitySetting.findOne({ key: 'community_footer' }).lean();

    if (!settings) {
      const created = await CommunitySetting.create({
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
      });
      return NextResponse.json(created);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Admin GET community settings error:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      communityName_en,
      communityName_bn,
      whatsappUrl,
      whatsappNumber,
      facebookUrl,
      websiteUrl,
      customPrefix_en,
      customPrefix_bn,
      customFor_en,
      customFor_bn,
      enabled,
      showSocialBadges,
    } = body;

    const normalizedWhatsapp = normalizeWhatsAppUrl(whatsappUrl, whatsappNumber);
    const normalizedFacebook = normalizeFacebookUrl(facebookUrl);
    const normalizedWebsite = websiteUrl?.trim()
      ? websiteUrl.startsWith('http')
        ? websiteUrl.trim()
        : `https://${websiteUrl.trim()}`
      : '';

    await connectToDatabase();

    const updated = await CommunitySetting.findOneAndUpdate(
      { key: 'community_footer' },
      {
        $set: {
          communityName_en: (communityName_en || 'our Alumni Community').trim(),
          communityName_bn: (communityName_bn || 'আমাদের অ্যালামনাই কমিউনিটি').trim(),
          whatsappUrl: normalizedWhatsapp,
          whatsappNumber: (whatsappNumber || '').trim(),
          facebookUrl: normalizedFacebook,
          websiteUrl: normalizedWebsite,
          customPrefix_en: (customPrefix_en || 'Built with').trim(),
          customPrefix_bn: (customPrefix_bn || 'ভালোবাসা দিয়ে নির্মিত').trim(),
          customFor_en: (customFor_en || 'for').trim(),
          customFor_bn: (customFor_bn || 'আমাদের').trim(),
          enabled: enabled !== undefined ? Boolean(enabled) : true,
          showSocialBadges: showSocialBadges !== undefined ? Boolean(showSocialBadges) : true,
          updatedBy: (session.user as any)?.id,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Community & footer settings updated successfully',
    });
  } catch (error) {
    console.error('Admin POST community settings error:', error);
    return NextResponse.json({ error: 'Failed to update community settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
