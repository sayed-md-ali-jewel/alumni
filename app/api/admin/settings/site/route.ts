import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';
import { CommunitySetting } from '@/models/CommunitySetting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    await connectToDatabase();

    let settings = await SiteSetting.findOne({ key: 'site_settings' }).lean();

    if (!settings) {
      settings = DEFAULT_SITE_SETTINGS as any;
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching admin site settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const adminId = (session.user as any)?.id;
    const body = await req.json();

    await connectToDatabase();

    const updatePayload = {
      // Header & Branding
      siteName_en: body.siteName_en || DEFAULT_SITE_SETTINGS.siteName_en,
      siteName_bn: body.siteName_bn || DEFAULT_SITE_SETTINGS.siteName_bn,
      tagline_en: body.tagline_en || DEFAULT_SITE_SETTINGS.tagline_en,
      tagline_bn: body.tagline_bn || DEFAULT_SITE_SETTINGS.tagline_bn,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : '',
      faviconUrl: body.faviconUrl !== undefined ? body.faviconUrl : '',

      // Footer
      footerTagline_en: body.footerTagline_en || DEFAULT_SITE_SETTINGS.footerTagline_en,
      footerTagline_bn: body.footerTagline_bn || DEFAULT_SITE_SETTINGS.footerTagline_bn,
      about_en: body.about_en || DEFAULT_SITE_SETTINGS.about_en,
      about_bn: body.about_bn || DEFAULT_SITE_SETTINGS.about_bn,
      address: body.address || DEFAULT_SITE_SETTINGS.address,
      phone: body.phone || DEFAULT_SITE_SETTINGS.phone,
      email: body.email || DEFAULT_SITE_SETTINGS.email,
      copyright_en: body.copyright_en || DEFAULT_SITE_SETTINGS.copyright_en,
      copyright_bn: body.copyright_bn || DEFAULT_SITE_SETTINGS.copyright_bn,

      // Social Links
      facebookUrl: body.facebookUrl !== undefined ? body.facebookUrl : DEFAULT_SITE_SETTINGS.facebookUrl,
      linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : DEFAULT_SITE_SETTINGS.linkedinUrl,
      youtubeUrl: body.youtubeUrl !== undefined ? body.youtubeUrl : DEFAULT_SITE_SETTINGS.youtubeUrl,
      websiteUrl: body.websiteUrl !== undefined ? body.websiteUrl : DEFAULT_SITE_SETTINGS.websiteUrl,
      twitterUrl: body.twitterUrl !== undefined ? body.twitterUrl : '',
      instagramUrl: body.instagramUrl !== undefined ? body.instagramUrl : '',
      whatsappUrl: body.whatsappUrl !== undefined ? body.whatsappUrl : '',
      whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : '',

      // Community footer badge
      communityName_en: body.communityName_en || DEFAULT_SITE_SETTINGS.communityName_en,
      communityName_bn: body.communityName_bn || DEFAULT_SITE_SETTINGS.communityName_bn,
      customPrefix_en: body.customPrefix_en || DEFAULT_SITE_SETTINGS.customPrefix_en,
      customPrefix_bn: body.customPrefix_bn || DEFAULT_SITE_SETTINGS.customPrefix_bn,
      customFor_en: body.customFor_en || DEFAULT_SITE_SETTINGS.customFor_en,
      customFor_bn: body.customFor_bn || DEFAULT_SITE_SETTINGS.customFor_bn,
      showCommunityBadge: body.showCommunityBadge !== undefined ? body.showCommunityBadge : true,
      showSocialBadges: body.showSocialBadges !== undefined ? body.showSocialBadges : true,
      isChatEnabled: body.isChatEnabled !== undefined ? Boolean(body.isChatEnabled) : true,

      // Manual Payment Configuration
      bkashNumber: body.bkashNumber !== undefined ? body.bkashNumber : DEFAULT_SITE_SETTINGS.bkashNumber,
      bkashType: body.bkashType || DEFAULT_SITE_SETTINGS.bkashType,
      bkashInstructions_en: body.bkashInstructions_en !== undefined ? body.bkashInstructions_en : DEFAULT_SITE_SETTINGS.bkashInstructions_en,
      bkashInstructions_bn: body.bkashInstructions_bn !== undefined ? body.bkashInstructions_bn : DEFAULT_SITE_SETTINGS.bkashInstructions_bn,
      isBkashEnabled: body.isBkashEnabled !== undefined ? body.isBkashEnabled : true,

      nagadNumber: body.nagadNumber !== undefined ? body.nagadNumber : DEFAULT_SITE_SETTINGS.nagadNumber,
      nagadType: body.nagadType || DEFAULT_SITE_SETTINGS.nagadType,
      nagadInstructions_en: body.nagadInstructions_en !== undefined ? body.nagadInstructions_en : DEFAULT_SITE_SETTINGS.nagadInstructions_en,
      nagadInstructions_bn: body.nagadInstructions_bn !== undefined ? body.nagadInstructions_bn : DEFAULT_SITE_SETTINGS.nagadInstructions_bn,
      isNagadEnabled: body.isNagadEnabled !== undefined ? body.isNagadEnabled : true,

      cashInstructions_en: body.cashInstructions_en !== undefined ? body.cashInstructions_en : DEFAULT_SITE_SETTINGS.cashInstructions_en,
      cashInstructions_bn: body.cashInstructions_bn !== undefined ? body.cashInstructions_bn : DEFAULT_SITE_SETTINGS.cashInstructions_bn,
      isCashEnabled: body.isCashEnabled !== undefined ? body.isCashEnabled : true,

      // Hero Header Section (Home Banner)
      heroBadge_en: body.heroBadge_en !== undefined ? body.heroBadge_en : DEFAULT_SITE_SETTINGS.heroBadge_en,
      heroBadge_bn: body.heroBadge_bn !== undefined ? body.heroBadge_bn : DEFAULT_SITE_SETTINGS.heroBadge_bn,
      heroTitle_en: body.heroTitle_en !== undefined ? body.heroTitle_en : DEFAULT_SITE_SETTINGS.heroTitle_en,
      heroTitle_bn: body.heroTitle_bn !== undefined ? body.heroTitle_bn : DEFAULT_SITE_SETTINGS.heroTitle_bn,
      heroSubtitle_en: body.heroSubtitle_en !== undefined ? body.heroSubtitle_en : DEFAULT_SITE_SETTINGS.heroSubtitle_en,
      heroSubtitle_bn: body.heroSubtitle_bn !== undefined ? body.heroSubtitle_bn : DEFAULT_SITE_SETTINGS.heroSubtitle_bn,
      heroPrimaryBtnText_en: body.heroPrimaryBtnText_en !== undefined ? body.heroPrimaryBtnText_en : DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_en,
      heroPrimaryBtnText_bn: body.heroPrimaryBtnText_bn !== undefined ? body.heroPrimaryBtnText_bn : DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_bn,
      heroPrimaryBtnLink: body.heroPrimaryBtnLink !== undefined ? body.heroPrimaryBtnLink : DEFAULT_SITE_SETTINGS.heroPrimaryBtnLink,
      heroSecondaryBtnText_en: body.heroSecondaryBtnText_en !== undefined ? body.heroSecondaryBtnText_en : DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_en,
      heroSecondaryBtnText_bn: body.heroSecondaryBtnText_bn !== undefined ? body.heroSecondaryBtnText_bn : DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_bn,
      heroSecondaryBtnLink: body.heroSecondaryBtnLink !== undefined ? body.heroSecondaryBtnLink : DEFAULT_SITE_SETTINGS.heroSecondaryBtnLink,
      heroShowStats: body.heroShowStats !== undefined ? body.heroShowStats : true,

      updatedBy: adminId,
    };

    const updatedSettings = await SiteSetting.findOneAndUpdate(
      { key: 'site_settings' },
      updatePayload,
      { new: true, upsert: true }
    );

    // Keep legacy CommunitySetting model in sync as well
    try {
      await CommunitySetting.findOneAndUpdate(
        { key: 'community_footer' },
        {
          communityName_en: updatePayload.communityName_en,
          communityName_bn: updatePayload.communityName_bn,
          whatsappUrl: updatePayload.whatsappUrl,
          whatsappNumber: updatePayload.whatsappNumber,
          facebookUrl: updatePayload.facebookUrl,
          websiteUrl: updatePayload.websiteUrl,
          customPrefix_en: updatePayload.customPrefix_en,
          customPrefix_bn: updatePayload.customPrefix_bn,
          customFor_en: updatePayload.customFor_en,
          customFor_bn: updatePayload.customFor_bn,
          enabled: updatePayload.showCommunityBadge,
          showSocialBadges: updatePayload.showSocialBadges,
          updatedBy: adminId,
        },
        { upsert: true }
      );
    } catch (e) {
      console.warn('Failed to sync legacy CommunitySetting:', e);
    }

    return NextResponse.json({
      message: 'Site settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error updating admin site settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
