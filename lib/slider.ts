import { connectToDatabase } from '@/lib/mongodb';
import { SliderItem, ISliderItem } from '@/models/Slider';
import { SiteSetting } from '@/models/SiteSetting';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

export const DEFAULT_SLIDER_ITEMS = [
  {
    title_en: 'Honoring Our Roots, Empowering the Future',
    title_bn: 'শিকড়ের টানে, আগামীর পানে — আমাদের অ্যালামনাই পরিবার',
    badge_en: '🎓 The Premier Global Network for Our Alumni',
    badge_bn: '🎓 বিশ্বব্যাপী প্রাক্তন শিক্ষার্থীদের সর্ববৃহৎ প্ল্যাটফর্ম',
    description_en:
      'Connect with thousands of distinguished alumni across the globe. Unlock career networking, memorable reunions, and high-impact student endowment programs.',
    description_bn:
      'আমাদের প্রিয় বিদ্যাপীঠের হাজারো কৃতি প্রাক্তনের সাথে যুক্ত হোন। পেশাগত নেটওয়ার্কিং, স্মৃতিময় পুনর্মিলনী এবং আগামী প্রজন্মের জন্য সেবামূলক উদ্যোগের সারথি হোন।',
    buttonText_en: 'Explore Directory',
    buttonText_bn: 'প্রাক্তনদের খুঁজুন',
    buttonLink: '/directory',
    secondaryButtonText_en: 'Support Endowment',
    secondaryButtonText_bn: 'তহবিলে অনুদান দিন',
    secondaryButtonLink: '/donate',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
    sortOrder: 1,
  },
  {
    title_en: 'Building Lifelong Bonds & Global Opportunities',
    title_bn: 'আজীবন সৌহার্দ্য ও বিশ্বমানের সুযোগের মেলবন্ধন',
    badge_en: '✨ Active Community & Blood Bank Network',
    badge_bn: '✨ সক্রিয় কমিউনিটি ও ব্লাড ব্যাংক নেটওয়ার্ক',
    description_en:
      'Participate in annual reunions, mentorship programs, student emergency relief, and our dedicated voluntary blood donation circle.',
    description_bn:
      'বার্ষিক পুনর্মিলনী, জুনিয়র মেন্টরশিপ, শিক্ষার্থীদের জরুরি চিকিৎসা অনুদান এবং আমাদের জরুরি রক্তদান সার্কেলে অংশ নিন।',
    buttonText_en: 'Emergency Blood Donors',
    buttonText_bn: 'জরুরি রক্তদাতা খুঁজুন',
    buttonLink: '/blood-donors',
    secondaryButtonText_en: 'Upcoming Events',
    secondaryButtonText_bn: 'আসন্ন ইভেন্টসমূহ',
    secondaryButtonLink: '/events',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
    sortOrder: 2,
  },
];

/**
 * Ensures default slides exist if none are found in database
 */
export async function ensureDefaultSliderItems() {
  await connectToDatabase();
  const count = await SliderItem.countDocuments();
  if (count === 0) {
    await SliderItem.insertMany(DEFAULT_SLIDER_ITEMS);
  }
}

/**
 * Get active slides sorted by sortOrder
 */
export async function getActiveSliderItems(): Promise<ISliderItem[]> {
  await connectToDatabase();
  await ensureDefaultSliderItems();

  const slides = await SliderItem.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(slides)) as ISliderItem[];
}

/**
 * Checks if slider is globally enabled
 */
export async function getIsSliderEnabled(): Promise<boolean> {
  try {
    await connectToDatabase();
    const settings = await SiteSetting.findOne({ key: 'site_settings' }).lean();
    if (!settings) {
      return DEFAULT_SITE_SETTINGS.isSliderEnabled ?? true;
    }
    return settings.isSliderEnabled !== false;
  } catch (e) {
    return true;
  }
}
