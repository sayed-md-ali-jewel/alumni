import { NextResponse } from 'next/server';
import { getActiveSliderItems, getIsSliderEnabled } from '@/lib/slider';

export async function GET() {
  try {
    const isEnabled = await getIsSliderEnabled();
    const slides = await getActiveSliderItems();

    return NextResponse.json({
      enabled: isEnabled,
      slides,
    });
  } catch (error: any) {
    console.error('Error in /api/slider:', error);
    return NextResponse.json(
      { enabled: true, slides: [], error: 'Failed to fetch slider items' },
      { status: 500 }
    );
  }
}
