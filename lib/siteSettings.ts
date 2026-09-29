export interface SiteSettings {
  key?: string;
  // Header & Brand Settings
  siteName_en: string;
  siteName_bn: string;
  tagline_en: string;
  tagline_bn: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Footer Settings
  footerTagline_en: string;
  footerTagline_bn: string;
  about_en: string;
  about_bn: string;
  address: string;
  phone: string;
  email: string;
  copyright_en: string;
  copyright_bn: string;

  // Social Links
  facebookUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  whatsappNumber?: string;

  // Community Footer Badge
  communityName_en: string;
  communityName_bn: string;
  customPrefix_en: string;
  customPrefix_bn: string;
  customFor_en: string;
  customFor_bn: string;
  showCommunityBadge: boolean;
  showSocialBadges: boolean;

  // Manual Donation Payment Configuration
  bkashNumber: string;
  bkashType: string;
  bkashInstructions_en: string;
  bkashInstructions_bn: string;
  isBkashEnabled: boolean;

  nagadNumber: string;
  nagadType: string;
  nagadInstructions_en: string;
  nagadInstructions_bn: string;
  isNagadEnabled: boolean;

  cashInstructions_en: string;
  cashInstructions_bn: string;
  isCashEnabled: boolean;

  // Dynamic Slider
  isSliderEnabled: boolean;
  sliderShowTitle?: boolean;
  sliderShowDescription?: boolean;
  sliderShowButton?: boolean;

  // Hero Header Section (Home Banner)
  heroBadge_en: string;
  heroBadge_bn: string;
  heroTitle_en: string;
  heroTitle_bn: string;
  heroSubtitle_en: string;
  heroSubtitle_bn: string;
  heroPrimaryBtnText_en: string;
  heroPrimaryBtnText_bn: string;
  heroPrimaryBtnLink: string;
  heroSecondaryBtnText_en: string;
  heroSecondaryBtnText_bn: string;
  heroSecondaryBtnLink: string;
  heroShowStats: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  key: 'site_settings',
  siteName_en: 'Alumni Association',
  siteName_bn: 'অ্যালামনাই অ্যাসোসিয়েশন',
  tagline_en: 'Legacy & Network',
  tagline_bn: 'ঐতিহ্য ও অগ্রযাত্রা',
  logoUrl: '',
  faviconUrl: '',
  isSliderEnabled: true,
  sliderShowTitle: true,
  sliderShowDescription: true,
  sliderShowButton: true,

  footerTagline_en: 'Connecting Legacy, Empowering the Future',
  footerTagline_bn: 'ঐতিহ্যের বন্ধনে প্রাক্তনদের সংযোগ',
  about_en:
    'A dedicated platform uniting our esteemed graduates worldwide to foster mentorship, scholarship endowments, and lifelong alumni pride.',
  about_bn:
    'বিশ্বজুড়ে ছড়িয়ে থাকা আমাদের বিশ্ববিদ্যালয়ের হাজারো কৃতি প্রাক্তনদের একটি সুদৃঢ় ও ফলপ্রসূ সংযোগ প্ল্যাটফর্ম।',
  address: 'Alumni Bhavan, Central Campus, Dhaka-1000, Bangladesh',
  phone: '+880 2 9876543, +8801700000000',
  email: 'info@alumni.ac.bd',
  copyright_en: 'Alumni Association. All rights reserved.',
  copyright_bn: 'অ্যালামনাই অ্যাসোসিয়েশন। সর্বস্বত্ব সংরক্ষিত।',

  facebookUrl: 'https://facebook.com',
  linkedinUrl: 'https://linkedin.com',
  youtubeUrl: 'https://youtube.com',
  websiteUrl: 'https://alumni.ac.bd',
  twitterUrl: '',
  instagramUrl: '',
  whatsappUrl: '',
  whatsappNumber: '',

  communityName_en: 'our Alumni Community',
  communityName_bn: 'আমাদের অ্যালামনাই কমিউনিটি',
  customPrefix_en: 'Built with',
  customPrefix_bn: 'ভালোবাসা দিয়ে নির্মিত',
  customFor_en: 'for',
  customFor_bn: 'আমাদের',
  showCommunityBadge: true,
  showSocialBadges: true,

  // Manual Donation Payment Defaults
  bkashNumber: '01712345678',
  bkashType: 'Personal',
  bkashInstructions_en: '1. Open bKash App or dial *247#.\n2. Choose "Send Money" (Personal) or "Make Payment" (Merchant).\n3. Enter the number above and input your donation amount.\n4. Enter Reference (e.g. "Alumni") and complete transaction with your PIN.\n5. Copy the Transaction ID (TrxID) and enter it below.',
  bkashInstructions_bn: '১. বিকাশ অ্যাপ ওপেন করুন অথবা *247# ডায়াল করুন।\n২. "Send Money" (ব্যক্তিগত) অথবা "Payment" অপশন বেছে নিন।\n৩. উপরের বিকাশ নম্বরে আপনার অনুদানের পরিমাণ পাঠান।\n৪. রেফারেন্সে "Alumni" লিখুন এবং পিন দিয়ে সম্পন্ন করুন।\n৫. প্রাপ্ত Transaction ID (TrxID) নিচে লিখে সাবমিট করুন।',
  isBkashEnabled: true,

  nagadNumber: '01812345678',
  nagadType: 'Personal',
  nagadInstructions_en: '1. Open Nagad App or dial *167#.\n2. Choose "Send Money" (Personal) or "Merchant Pay".\n3. Enter the number above and input your donation amount.\n4. Complete the transfer with your PIN.\n5. Copy the Transaction ID (TxnID) and enter it below.',
  nagadInstructions_bn: '১. নগদ অ্যাপ ওপেন করুন অথবা *167# ডায়াল করুন।\n২. "Send Money" বা "Merchant Pay" অপশন নির্বাচন করুন।\n৩. উপরের নগদ নম্বরে অনুদানের সঠিক পরিমাণ প্রেরণ করুন।\n৪. আপনার পিন দিয়ে ট্রানজেকশন সম্পন্ন করুন।\n৫. প্রাপ্ত Transaction ID (TxnID) নিচে ইনপুট দিন।',
  isNagadEnabled: true,

  cashInstructions_en: 'You can deposit your cash donation directly at the Alumni Association Secretariat Desk (Office Room #102, Central Campus, Dhaka-1000). A physical authenticated receipt will be issued immediately upon deposit and your online record will be marked verified by admin.',
  cashInstructions_bn: 'আপনি সরাসরি বিদ্যালয় অ্যালামনাই সচিবালয় অফিসে (কক্ষ নং ১০২, মূল ক্যাম্পাস, ঢাকা) নগদ অনুদান জমা দিতে পারেন। অনুদান জমা দেওয়ার সাথে সাথে সিলযুক্ত রশিদ প্রদান করা হবে এবং আপনার অনলাইন প্রোফাইলে তা অনুমোদিত হিসেবে যুক্ত হবে।',
  isCashEnabled: true,

  // Hero Header Section Defaults
  heroBadge_en: '🎓 The Premier Global Network for Our Alumni',
  heroBadge_bn: '🎓 বিশ্বব্যাপী প্রাক্তন শিক্ষার্থীদের সর্ববৃহৎ প্ল্যাটফর্ম',
  heroTitle_en: 'Honoring Our Roots, Empowering the Future',
  heroTitle_bn: 'শিকড়ের টানে, আগামীর পানে — আমাদের অ্যালামনাই পরিবার',
  heroSubtitle_en:
    'Connect with thousands of distinguished alumni across the globe. Unlock career networking, memorable reunions, and high-impact student endowment programs.',
  heroSubtitle_bn:
    'আমাদের প্রিয় বিদ্যাপীঠের হাজারো কৃতি প্রাক্তনের সাথে যুক্ত হোন। পেশাগত নেটওয়ার্কিং, স্মৃতিময় পুনর্মিলনী এবং আগামী প্রজন্মের জন্য সেবামূলক উদ্যোগের সারথি হোন।',
  heroPrimaryBtnText_en: 'Explore Directory',
  heroPrimaryBtnText_bn: 'প্রাক্তনদের খুঁজুন',
  heroPrimaryBtnLink: '/directory',
  heroSecondaryBtnText_en: 'Support Endowment',
  heroSecondaryBtnText_bn: 'তহবিলে অনুদান দিন',
  heroSecondaryBtnLink: '/donate',
  heroShowStats: true,
};
