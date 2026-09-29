import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { Campaign, INITIAL_CAMPAIGNS } from '@/models/Campaign';
import { AdminDonationSchema } from '@/lib/validations';
import { generateTxnId, generateReceiptNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const campaign = searchParams.get('campaign');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');

    const query: any = {};

    if (campaign && campaign !== 'all') {
      query.campaign = campaign;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (method && method !== 'all') {
      query.method = method;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { donorName: regex },
        { donorEmail: regex },
        { donorPhone: regex },
        { transactionId: regex },
        { receiptNumber: regex },
        { campaign: regex },
      ];
    }

    let [donations, allDonationsForStats, registeredCampaigns] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).lean(),
      Donation.find().lean(),
      Campaign.find().sort({ createdAt: -1 }).lean(),
    ]);

    if (registeredCampaigns.length === 0) {
      await Campaign.insertMany(INITIAL_CAMPAIGNS);
      registeredCampaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    }

    // Grouping by Campaign (Donation-wise / Campaign-wise Breakdown)
    const campaignMap = new Map<string, {
      campaign: string;
      campaignDoc?: any;
      totalRaised: number;
      completedCount: number;
      pendingCount: number;
      cancelledCount: number;
      allCount: number;
      avgAmount: number;
      donations: any[];
      donorsList: Set<string>;
    }>();

    // Seed with all registered campaigns so empty/new campaigns appear in ledger
    registeredCampaigns.forEach((camp: any) => {
      const cName = camp.title_en || camp.title_bn;
      campaignMap.set(cName, {
        campaign: cName,
        campaignDoc: camp,
        totalRaised: 0,
        completedCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        allCount: 0,
        avgAmount: 0,
        donations: [],
        donorsList: new Set<string>(),
      });
    });

    allDonationsForStats.forEach((d: any) => {
      const cName = d.campaign || 'General Endowment Fund';
      if (!campaignMap.has(cName)) {
        const matchingDoc = registeredCampaigns.find(
          (rc: any) => rc.title_en === cName || rc.title_bn === cName
        );
        campaignMap.set(cName, {
          campaign: cName,
          campaignDoc: matchingDoc,
          totalRaised: 0,
          completedCount: 0,
          pendingCount: 0,
          cancelledCount: 0,
          allCount: 0,
          avgAmount: 0,
          donations: [],
          donorsList: new Set<string>(),
        });
      }

      const cData = campaignMap.get(cName)!;
      cData.allCount += 1;
      cData.donations.push(d);
      if (d.donorEmail) {
        cData.donorsList.add(d.donorEmail.toLowerCase());
      }

      if (d.status === 'completed') {
        cData.totalRaised += Number(d.amount) || 0;
        cData.completedCount += 1;
      } else if (d.status === 'pending') {
        cData.pendingCount += 1;
      } else if (d.status === 'cancelled') {
        cData.cancelledCount += 1;
      }
    });

    const campaignStats = Array.from(campaignMap.values()).map((c) => ({
      campaign: c.campaign,
      campaignDoc: c.campaignDoc,
      campaignId: c.campaignDoc?._id,
      goal: c.campaignDoc?.goal,
      category: c.campaignDoc?.category,
      status: c.campaignDoc?.status || 'active',
      image: c.campaignDoc?.image,
      totalRaised: c.totalRaised,
      completedCount: c.completedCount,
      pendingCount: c.pendingCount,
      cancelledCount: c.cancelledCount,
      allCount: c.allCount,
      uniqueDonorsCount: c.donorsList.size,
      avgAmount: c.completedCount > 0 ? Math.round(c.totalRaised / c.completedCount) : 0,
      recentDonations: c.donations.slice(0, 5),
    })).sort((a, b) => b.totalRaised - a.totalRaised);

    // Grouping by Payment Method
    const methodMap = new Map<string, { method: string; count: number; total: number }>();
    allDonationsForStats.forEach((d: any) => {
      const m = d.method || 'other';
      if (!methodMap.has(m)) {
        methodMap.set(m, { method: m, count: 0, total: 0 });
      }
      const mData = methodMap.get(m)!;
      mData.count += 1;
      if (d.status === 'completed') {
        mData.total += Number(d.amount) || 0;
      }
    });

    const methodStats = Array.from(methodMap.values()).sort((a, b) => b.total - a.total);

    // Overall summary metrics
    const totalRaised = allDonationsForStats
      .filter((d: any) => d.status === 'completed')
      .reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

    const completedCount = allDonationsForStats.filter((d: any) => d.status === 'completed').length;
    const pendingCount = allDonationsForStats.filter((d: any) => d.status === 'pending').length;
    const cancelledCount = allDonationsForStats.filter((d: any) => d.status === 'cancelled').length;

    return NextResponse.json({
      donations,
      campaignStats,
      methodStats,
      summary: {
        totalRaised,
        totalCount: allDonationsForStats.length,
        completedCount,
        pendingCount,
        cancelledCount,
        uniqueCampaignsCount: campaignStats.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin donations:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch donations' },
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
    const validated = AdminDonationSchema.parse(body);

    await connectToDatabase();

    const prefix = (validated.method || 'adm').substring(0, 3).toUpperCase();
    const finalTrxId = validated.transactionId?.trim() || generateTxnId(prefix);
    const receiptNumber = validated.receiptNumber?.trim() || generateReceiptNumber();

    const newDonation = await Donation.create({
      donorName: validated.donorName.trim(),
      donorEmail: validated.donorEmail.toLowerCase().trim(),
      donorPhone: validated.donorPhone?.trim() || undefined,
      amount: validated.amount,
      currency: 'BDT',
      campaign: validated.campaign.trim(),
      isAnonymous: Boolean(validated.isAnonymous),
      method: validated.method,
      transactionId: finalTrxId,
      receiptNumber,
      status: validated.status,
      recipientName: validated.recipientName || validated.givenTo,
      givenTo: validated.givenTo || validated.recipientName,
      recipientId: validated.recipientId || undefined,
      donationDate: validated.donationDate ? new Date(validated.donationDate) : new Date(),
      donationTime: validated.donationTime || undefined,
      notes: validated.notes || undefined,
      paidAt: validated.status === 'completed' ? (validated.paidAt ? new Date(validated.paidAt) : new Date()) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Donation record created successfully.',
        donation: newDonation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin donation:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create donation record' },
      { status: 500 }
    );
  }
}
