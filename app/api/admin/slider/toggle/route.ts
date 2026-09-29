import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { SiteSetting, DEFAULT_SITE_SETTINGS } from '@/models/SiteSetting';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { isSliderEnabled, sliderShowTitle, sliderShowDescription, sliderShowButton } = body;

    const updateFields: any = {};
    if (typeof isSliderEnabled === 'boolean') updateFields.isSliderEnabled = isSliderEnabled;
    if (typeof sliderShowTitle === 'boolean') updateFields.sliderShowTitle = sliderShowTitle;
    if (typeof sliderShowDescription === 'boolean') updateFields.sliderShowDescription = sliderShowDescription;
    if (typeof sliderShowButton === 'boolean') updateFields.sliderShowButton = sliderShowButton;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid boolean toggle parameters provided' }, { status: 400 });
    }

    await connectToDatabase();

    const {
      isSliderEnabled: _defaultSliderEnabled,
      sliderShowTitle: _defaultShowTitle,
      sliderShowDescription: _defaultShowDescription,
      sliderShowButton: _defaultShowButton,
      ...initialDefaults
    } = DEFAULT_SITE_SETTINGS;

    const updatedSetting = await SiteSetting.findOneAndUpdate(
      { key: 'site_settings' },
      {
        $set: updateFields,
        $setOnInsert: {
          key: 'site_settings',
          ...initialDefaults,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: 'Slider display options updated successfully',
      isSliderEnabled: updatedSetting.isSliderEnabled,
      sliderShowTitle: updatedSetting.sliderShowTitle !== false,
      sliderShowDescription: updatedSetting.sliderShowDescription !== false,
      sliderShowButton: updatedSetting.sliderShowButton !== false,
    });
  } catch (error: any) {
    console.error('Error updating slider toggle state:', error);
    return NextResponse.json({ error: 'Failed to update slider settings' }, { status: 500 });
  }
}
