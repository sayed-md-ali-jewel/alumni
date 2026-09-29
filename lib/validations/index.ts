import { z } from 'zod';
import {
  ALUMNI_GROUPS,
  BLOOD_GROUPS,
  DONATION_STATUSES,
  CONTACT_PREFERENCES,
  BLOOD_REQUEST_URGENCIES,
  BLOOD_REQUEST_STATUSES,
  DonationStatus,
  ContactPreference,
  BloodRequestUrgency,
  BloodRequestStatus,
} from '@/lib/types';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    batchYear: z.coerce.number().min(1950, 'Invalid graduation year').max(2035, 'Invalid graduation year'),
    group: z.enum(ALUMNI_GROUPS, {
      errorMap: () => ({ message: 'Please select a valid group (Science, Commerce, or Humanities)' }),
    }),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    isBloodDonor: z.boolean().default(false),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  batchYear: z.coerce.number().min(1950).max(2035),
  group: z.enum(ALUMNI_GROUPS, {
    errorMap: () => ({ message: 'Please select a valid group (Science, Commerce, or Humanities)' }),
  }),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  linkedin: z.string().url('Invalid LinkedIn URL format').or(z.literal('')).optional(),
  facebook: z.string().url('Invalid Facebook URL format').or(z.literal('')).optional(),
  instagram: z.string().url('Invalid Instagram URL format').or(z.literal('')).optional(),
  whatsapp: z.string().max(30, 'Invalid WhatsApp number').optional(),
  skills: z.string().optional(), // comma-separated input
  phone: z.string().optional(),
  visibility: z.enum(['public', 'alumni_only']).default('public'),
  image: z.string().optional(),
  // Blood donor preferences
  isBloodDonor: z.boolean().default(false),
  donationStatus: z.enum(DONATION_STATUSES).default(DonationStatus.AVAILABLE),
  lastDonationDate: z.string().optional(),
  nextEligibleDate: z.string().optional(),
  donorLocation: z.string().optional(),
  contactPreference: z.enum(CONTACT_PREFERENCES).default(ContactPreference.BOTH),
  donorNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  bloodDonationConsent: z.boolean().default(false),
  allowAlumniContact: z.boolean().default(true),
});

export const BloodDonorSettingsSchema = z.object({
  isBloodDonor: z.boolean(),
  bloodGroup: z.enum(BLOOD_GROUPS),
  donationStatus: z.enum(DONATION_STATUSES),
  lastDonationDate: z.string().optional().nullable(),
  nextEligibleDate: z.string().optional().nullable(),
  donorLocation: z.string().min(2, 'Location is required'),
  contactPreference: z.enum(CONTACT_PREFERENCES),
  donorNotes: z.string().max(500).optional(),
  bloodDonationConsent: z.boolean(),
  allowAlumniContact: z.boolean(),
});

export const BloodRequestCreateSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum(BLOOD_GROUPS, {
    errorMap: () => ({ message: 'Please select a valid blood group' }),
  }),
  requiredUnits: z.coerce.number().min(1, 'At least 1 unit is required').max(20, 'Maximum 20 units'),
  hospitalName: z.string().min(2, 'Hospital name is required'),
  hospitalAddress: z.string().max(300).optional(),
  hospitalLocation: z.string().min(2, 'Hospital location is required'),
  requiredDate: z.string().min(1, 'Required date is required'),
  urgency: z.enum(BLOOD_REQUEST_URGENCIES, {
    errorMap: () => ({ message: 'Please select an urgency level' }),
  }),
  contactName: z.string().min(2, 'Contact person name is required'),
  contactPhone: z.string().min(7, 'Valid contact phone is required'),
  additionalInformation: z.string().max(1000).optional(),
});

export const BloodRequestUpdateSchema = z.object({
  patientName: z.string().min(2).optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  requiredUnits: z.coerce.number().min(1).max(20).optional(),
  hospitalName: z.string().min(2).optional(),
  hospitalAddress: z.string().max(300).optional(),
  hospitalLocation: z.string().min(2).optional(),
  requiredDate: z.string().optional(),
  urgency: z.enum(BLOOD_REQUEST_URGENCIES).optional(),
  contactName: z.string().min(2).optional(),
  contactPhone: z.string().min(7).optional(),
  additionalInformation: z.string().max(1000).optional(),
  status: z.enum(BLOOD_REQUEST_STATUSES).optional(),
});

export const BloodContactSchema = z.object({
  donorId: z.string().min(1, 'Donor ID is required'),
  bloodRequestId: z.string().optional(),
  reason: z.string().min(3, 'Reason is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum(BLOOD_GROUPS),
  hospitalName: z.string().min(2, 'Hospital name is required'),
  hospitalAddress: z.string().max(300).optional(),
  hospitalLocation: z.string().min(2, 'Hospital location is required'),
  urgency: z.enum(BLOOD_REQUEST_URGENCIES).default(BloodRequestUrgency.NORMAL),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  contactPhone: z.string().min(7, 'Your contact phone number is required'),
});

export const EventSchema = z.object({
  title_bn: z.string().min(2, 'Bangla title is required'),
  title_en: z.string().min(2, 'English title is required'),
  description_bn: z.string().min(1, 'Bangla description is required'),
  description_en: z.string().min(1, 'English description is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required'),
  category: z.enum(['Reunion', 'Webinar', 'Gala', 'Workshop', 'Sports', 'Networking']),
  capacity: z.coerce.number().min(1).default(500),
  image: z.string().optional(),
});

export const NewsSchema = z.object({
  title_bn: z.string().min(2, 'Bangla title is required'),
  title_en: z.string().min(2, 'English title is required'),
  slug: z.string().min(2, 'Slug is required'),
  summary_bn: z.string().optional(),
  summary_en: z.string().optional(),
  content_bn: z.string().min(1, 'Bangla content is required'),
  content_en: z.string().min(1, 'English content is required'),
  category: z.enum(['Spotlight', 'Announcement', 'Achievement', 'Campus', 'Story']).default('Announcement'),
  image: z.string().optional(),
});

export const JobPostSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['full_time', 'part_time', 'remote', 'internship', 'contract']),
  salaryRange: z.string().optional(),
  description: z.string().min(20, 'Job description is required'),
  requirements: z.string().optional(), // comma-separated
  applicationUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  isReferral: z.boolean().default(false),
});

export const DonationInitSchema = z.object({
  donorName: z.string().min(2, 'Donor name is required'),
  donorEmail: z.string().email('Valid email is required'),
  donorPhone: z.string().min(11, 'Valid Bangladeshi mobile number is required'),
  amount: z.coerce.number().min(10, 'Minimum donation amount is 10 BDT'),
  campaign: z.string().min(2, 'Campaign is required'),
  isAnonymous: z.boolean().default(false),
  method: z.enum(['bkash', 'nagad', 'cash', 'rocket', 'upay', 'card', 'bank']).default('bkash'),
  givenTo: z.string().optional(),
  recipientName: z.string().optional(),
  recipientId: z.string().optional(),
  donationDate: z.string().optional(),
  donationTime: z.string().optional(),
  notes: z.string().optional(),
});

export const ManualDonationSchema = z
  .object({
    donorName: z.string().min(2, 'Donor name is required'),
    donorEmail: z.string().email('Valid email is required'),
    donorPhone: z.string().min(11, 'Valid mobile number is required'),
    amount: z.coerce.number().min(10, 'Minimum donation amount is 10 BDT'),
    campaign: z.string().min(2, 'Campaign is required'),
    isAnonymous: z.boolean().default(false),
    method: z.enum(['bkash', 'nagad', 'cash']),
    transactionId: z.string().optional(),
    givenTo: z.string().optional(),
    recipientName: z.string().optional(),
    recipientId: z.string().optional(),
    donationDate: z.string().optional(),
    donationTime: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'bkash' || data.method === 'nagad') {
        return !!data.transactionId && data.transactionId.trim().length >= 4;
      }
      return true;
    },
    {
      message: 'Transaction ID is required for bKash / Nagad payments',
      path: ['transactionId'],
    }
  );

export const BankTransferSchema = z.object({
  donorName: z.string().min(2, 'Donor name is required'),
  donorEmail: z.string().email('Valid email is required'),
  donorPhone: z.string().min(11, 'Valid phone number is required'),
  amount: z.coerce.number().min(10, 'Minimum amount is 10 BDT'),
  campaign: z.string().min(2, 'Campaign is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  branch: z.string().optional(),
  transactionRef: z.string().min(4, 'Transaction Reference / Deposit slip number is required'),
  screenshotUrl: z.string().optional(),
  givenTo: z.string().optional(),
  recipientName: z.string().optional(),
  recipientId: z.string().optional(),
  donationDate: z.string().optional(),
  donationTime: z.string().optional(),
  notes: z.string().optional(),
});

export const AdminDonationSchema = z.object({
  donorName: z.string().min(2, 'Donor name is required'),
  donorEmail: z.string().email('Valid email is required'),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(10, 'Minimum donation amount is 10 BDT'),
  campaign: z.string().min(2, 'Campaign name is required'),
  method: z.enum(['bkash', 'nagad', 'cash', 'rocket', 'upay', 'card', 'bank', 'bank_manual']).default('bkash'),
  transactionId: z.string().optional(),
  receiptNumber: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('completed'),
  isAnonymous: z.boolean().default(false),
  paidAt: z.string().optional(),
  givenTo: z.string().optional(),
  recipientName: z.string().optional(),
  recipientId: z.string().optional(),
  donationDate: z.string().optional(),
  donationTime: z.string().optional(),
  notes: z.string().optional(),
});

export const CampaignSchema = z.object({
  title_en: z.string().min(2, 'English title is required'),
  title_bn: z.string().min(2, 'Bangla title is required'),
  description_en: z.string().min(10, 'English description is required'),
  description_bn: z.string().min(10, 'Bangla description is required'),
  goal: z.coerce.number().min(1000, 'Minimum campaign goal is 1,000 BDT'),
  category: z.enum([
    'Scholarship',
    'Infrastructure',
    'Medical',
    'Relief',
    'General',
    'Endowment',
    'Sports',
    'Technology',
  ]).default('Scholarship'),
  image: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'draft']).default('active'),
  isFeatured: z.boolean().default(false),
});
