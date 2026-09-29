import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { SliderItem } from '@/models/Slider';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';
import { ensureDefaultSliderItems, getIsSliderEnabled } from '@/lib/slider';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    await connectToDatabase();
    await ensureDefaultSliderItems();

    const [slides, isSliderEnabled, settings] = await Promise.all([
      SliderItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      getIsSliderEnabled(),
      SiteSetting.findOne({ key: 'site_settings' }).lean(),
    ]);

    return NextResponse.json({
      slides,
      isSliderEnabled,
      sliderShowTitle: settings?.sliderShowTitle !== false,
      sliderShowDescription: settings?.sliderShowDescription !== false,
      sliderShowButton: settings?.sliderShowButton !== false,
    });
  } catch (error: any) {
    console.error('Error fetching admin slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title_en,
      title_bn,
      description_en,
      description_bn,
      buttonText_en,
      buttonText_bn,
      buttonLink,
      image,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!title_en || !title_bn || !description_en || !description_bn) {
      return NextResponse.json(
        { error: 'Title and Description (in both English and Bengali) are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newSlide = await SliderItem.create({
      title_en,
      title_bn,
      description_en,
      description_bn,
      buttonText_en: buttonText_en || '',
      buttonText_bn: buttonText_bn || '',
      buttonLink: buttonLink || '',
      image: image || '',
      badge_en: '',
      badge_bn: '',
      secondaryButtonText_en: '',
      secondaryButtonText_bn: '',
      secondaryButtonLink: '',
      isActive: isActive !== false,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    });

    return NextResponse.json(
      { message: 'Slide created successfully', slide: newSlide },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating slide:', error);
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}
