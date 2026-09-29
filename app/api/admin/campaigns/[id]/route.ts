import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { CampaignSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    await connectToDatabase();
    const campaign = await Campaign.findById(id).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error('Error fetching single campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    const body = await req.json();
    const validated = CampaignSchema.parse(body);

    await connectToDatabase();

    const updated = await Campaign.findByIdAndUpdate(
      id,
      {
        $set: {
          title_en: validated.title_en.trim(),
          title_bn: validated.title_bn.trim(),
          description_en: validated.description_en.trim(),
          description_bn: validated.description_bn.trim(),
          goal: validated.goal,
          category: validated.category,
          image: validated.image?.trim() || undefined,
          startDate: validated.startDate ? new Date(validated.startDate) : undefined,
          endDate: validated.endDate ? new Date(validated.endDate) : undefined,
          status: validated.status,
          isFeatured: Boolean(validated.isFeatured),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully.',
      campaign: updated,
    });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Campaign.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign permanently deleted.',
    });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
