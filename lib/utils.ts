import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English numbers to Bengali numerals
export function toBengaliNumerals(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

// Format Currency in BDT (৳)
export function formatCurrency(amount: number, locale: string = 'bn'): string {
  if (locale === 'bn') {
    const formatted = new Intl.NumberFormat('en-IN').format(amount);
    return `৳${toBengaliNumerals(formatted)}`;
  }
  return `৳ ${new Intl.NumberFormat('en-US').format(amount)}`;
}

// Format Date localized
export function formatDate(date: string | Date, locale: string = 'bn'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (locale === 'bn') {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('bn-BD', options).format(d);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

// Generate Unique Transaction ID
export function generateTxnId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

// Generate Receipt Number
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ALM-REC-${year}-${randomNum}`;
}

/**
 * Calculates the next eligible blood donation date (strictly +3 calendar months).
 * Uses proper calendar month arithmetic instead of fixed day count.
 */
export function calculateNextEligibleDate(donationDate: Date | string = new Date()): Date {
  const d = new Date(donationDate);
  const nextDate = new Date(d);
  nextDate.setMonth(nextDate.getMonth() + 3);
  return nextDate;
}

/**
 * Determines whether a donor is dynamically eligible and available right now.
 * Dynamic rule:
 * - isBloodDonor === true
 * - bloodDonationConsent === true
 * - donationStatus !== 'Not Available'
 * - (!nextEligibleDate || new Date() >= new Date(nextEligibleDate))
 */
export function isDonorEligibleNow(donor: {
  isBloodDonor?: boolean;
  bloodDonationConsent?: boolean;
  donationStatus?: string;
  nextEligibleDate?: Date | string | null;
}): boolean {
  if (!donor.isBloodDonor || !donor.bloodDonationConsent) return false;
  if (donor.donationStatus === 'Not Available') return false;
  if (donor.nextEligibleDate) {
    const nextDate = new Date(donor.nextEligibleDate);
    if (new Date() < nextDate) {
      return false; // In waiting period
    }
  }
  return true;
}

/**
 * Returns dynamic donor status and badge metadata
 */
export function getDonorDynamicStatus(donor: {
  isBloodDonor?: boolean;
  bloodDonationConsent?: boolean;
  donationStatus?: string;
  nextEligibleDate?: Date | string | null;
}): {
  status: 'Available' | 'Recently Donated' | 'Temporarily Unavailable' | 'Not Available';
  isAvailable: boolean;
  nextEligibleDate?: Date;
} {
  if (!donor.isBloodDonor || !donor.bloodDonationConsent || donor.donationStatus === 'Not Available') {
    return { status: 'Not Available', isAvailable: false };
  }

  if (donor.nextEligibleDate) {
    const nextDate = new Date(donor.nextEligibleDate);
    if (new Date() < nextDate) {
      return { status: 'Recently Donated', isAvailable: false, nextEligibleDate: nextDate };
    }
  }

  if (donor.donationStatus === 'Temporarily Unavailable') {
    return { status: 'Temporarily Unavailable', isAvailable: false };
  }

  return { status: 'Available', isAvailable: true };
}

/**
 * Safely parses any error (Zod error JSON string, ZodError object, Error instance, string, array)
 * into a clean array of human-readable error messages.
 */
export function parseErrorMessages(err: any): string[] {
  if (!err) return [];

  // If already an array
  if (Array.isArray(err)) {
    const list: string[] = [];
    for (const item of err) {
      if (typeof item === 'string') {
        const sub = parseErrorMessages(item);
        list.push(...sub);
      } else if (typeof item === 'object' && item !== null) {
        if (item.message) list.push(String(item.message));
        else if (item.msg) list.push(String(item.msg));
        else if (item.error) list.push(String(item.error));
        else list.push(JSON.stringify(item));
      } else {
        list.push(String(item));
      }
    }
    return list.filter(Boolean);
  }

  // If it's an object with .errors or .issues (Zod)
  if (typeof err === 'object' && err !== null) {
    if (Array.isArray(err.errors)) {
      return parseErrorMessages(err.errors);
    }
    if (Array.isArray(err.issues)) {
      return parseErrorMessages(err.issues);
    }
    if (err.error) {
      return parseErrorMessages(err.error);
    }
    if (err.message && typeof err.message === 'string') {
      return parseErrorMessages(err.message);
    }
  }

  // If it's a string
  if (typeof err === 'string') {
    const trimmed = err.trim();
    // Check if it's a JSON array or object string (e.g. `[{"code":"too_small","message":"..."}]`)
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseErrorMessages(parsed);
      } catch {
        // Not valid JSON, proceed as plain string
      }
    }
    return [trimmed];
  }

  return [String(err)];
}

/**
 * Formats any error into a single friendly readable sentence.
 */
export function formatErrorMessage(err: any, separator: string = '. '): string {
  const messages = parseErrorMessages(err);
  if (!messages || messages.length === 0) return 'An unexpected error occurred';
  return messages.join(separator);
}
