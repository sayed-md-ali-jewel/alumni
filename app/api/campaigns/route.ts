import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { Donation } from '@/models/Donation';

export const dynamic = 'force-dynamic';

const INITIAL_CAMPAIGNS = [
  {
    title_en: 'Student Scholarship Endowment Fund',
    title_bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থী শিক্ষাবৃত্তি তহবিল',
    description_en: 'Sponsoring full undergraduate tuition and living stipends for talented students in need.',
    description_bn: 'অসচ্ছল শিক্ষার্থীদের বার্ষিক পূর্ণ টিউশন ফি এবং মাসিক শিক্ষা ভাতা অনুদান।',
    goal: 1000000,
    category: 'Scholarship',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: true,
  },
  {
    title_en: 'Smart Classroom & AI Lab Renovation',
    title_bn: 'স্মার্ট ক্লাসরুম ও অত্যাধুনিক এআই ল্যাব উন্নয়ন',
    description_en: 'Equipping computing labs with GPU servers and modern interactive tech tools.',
    description_bn: 'আধুনিক জিপিইউ সার্ভার ও রোবোটিক্স ল্যাব উন্নয়ন।',
    goal: 750000,
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: true,
  },
  {
    title_en: 'Emergency Student Medical Relief Fund',
    title_bn: 'জরুরি শিক্ষার্থী চিকিৎসা সহায়তা তহবিল',
    description_en: 'Providing immediate medical subsidies for students during severe health emergencies.',
    description_bn: 'অপ্রত্যাশিত দুর্ঘটনা ও জটিল রোগের জরুরি চিকিৎসা অনুদান।',
    goal: 500000,
    category: 'Medical',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
    isFeatured: false,
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    let campaigns = await Campaign.find({ status: { $in: ['active', 'completed'] } })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    // Auto-seed initial campaigns if collection is completely empty
    if (campaigns.length === 0) {
      await Campaign.insertMany(INITIAL_CAMPAIGNS);
      campaigns = await Campaign.find({ status: { $in: ['active', 'completed'] } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean();
    }

    // Calculate live raised amounts and donor counts from Donation collection
    const donations = await Donation.find({ status: 'completed' }).lean();

    const campaignTotalsMap = new Map<string, { total: number; donors: Set<string> }>();
    donations.forEach((d: any) => {
      const cName = (d.campaign || '').trim();
      if (cName) {
        if (!campaignTotalsMap.has(cName)) {
          campaignTotalsMap.set(cName, { total: 0, donors: new Set<string>() });
        }
        const data = campaignTotalsMap.get(cName)!;
        data.total += Number(d.amount) || 0;
        if (d.donorEmail) data.donors.add(d.donorEmail.toLowerCase());
      }
    });

    const enrichedCampaigns = campaigns.map((c: any) => {
      const liveData = campaignTotalsMap.get(c.title_en) || campaignTotalsMap.get(c.title_bn);
      const calculatedRaised = liveData ? liveData.total : (c.raised || 0);
      const donorCount = liveData ? liveData.donors.size : 0;
      const progress = Math.min(100, Math.round((calculatedRaised / (c.goal || 1)) * 100));

      return {
        ...c,
        id: c.title_en,
        raised: calculatedRaised,
        donorCount,
        progress,
      };
    });

    return NextResponse.json({
      campaigns: enrichedCampaigns,
      totalCampaigns: enrichedCampaigns.length,
    });
  } catch (error: any) {
    console.error('Error fetching public campaigns:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
