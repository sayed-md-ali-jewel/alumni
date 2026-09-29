import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign, INITIAL_CAMPAIGNS } from '@/models/Campaign';
import { Donation } from '@/models/Donation';
import { CampaignSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();

    let [campaigns, completedDonations] = await Promise.all([
      Campaign.find().sort({ isFeatured: -1, createdAt: -1 }).lean(),
      Donation.find({ status: 'completed' }).lean(),
    ]);

    if (campaigns.length === 0) {
      await Campaign.insertMany(INITIAL_CAMPAIGNS);
      campaigns = await Campaign.find().sort({ isFeatured: -1, createdAt: -1 }).lean();
    }

    // Compute live totals per campaign
    const totalsMap = new Map<string, { total: number; donors: Set<string>; count: number }>();
    completedDonations.forEach((d: any) => {
      const cName = (d.campaign || '').trim();
      if (cName) {
        if (!totalsMap.has(cName)) {
          totalsMap.set(cName, { total: 0, donors: new Set<string>(), count: 0 });
        }
        const data = totalsMap.get(cName)!;
        data.total += Number(d.amount) || 0;
        data.count += 1;
        if (d.donorEmail) data.donors.add(d.donorEmail.toLowerCase());
      }
    });

    const enriched = campaigns.map((c: any) => {
      const liveData = totalsMap.get(c.title_en) || totalsMap.get(c.title_bn);
      const totalRaised = liveData ? liveData.total : (c.raised || 0);
      const donationsCount = liveData ? liveData.count : 0;
      const uniqueDonorsCount = liveData ? liveData.donors.size : 0;
      const progress = Math.min(100, Math.round((totalRaised / (c.goal || 1)) * 100));

      return {
        ...c,
        liveRaised: totalRaised,
        donationsCount,
        uniqueDonorsCount,
        progress,
      };
    });

    return NextResponse.json({
      campaigns: enriched,
      totalCount: enriched.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin campaigns:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const validated = CampaignSchema.parse(body);

    await connectToDatabase();

    const adminId = (session.user as any)?.id;

    const newCampaign = await Campaign.create({
      title_en: validated.title_en.trim(),
      title_bn: validated.title_bn.trim(),
      description_en: validated.description_en.trim(),
      description_bn: validated.description_bn.trim(),
      goal: validated.goal,
      category: validated.category,
      image: validated.image?.trim() || undefined,
      startDate: validated.startDate ? new Date(validated.startDate) : new Date(),
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      status: validated.status,
      isFeatured: Boolean(validated.isFeatured),
      createdBy: adminId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign created successfully.',
        campaign: newCampaign,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
