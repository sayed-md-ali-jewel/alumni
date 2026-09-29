export enum AlumniGroup {
  SCIENCE = 'Science',
  COMMERCE = 'Commerce',
  HUMANITIES = 'Humanities',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum DonationStatus {
  AVAILABLE = 'Available',
  RECENTLY_DONATED = 'Recently Donated',
  TEMPORARILY_UNAVAILABLE = 'Temporarily Unavailable',
  NOT_AVAILABLE = 'Not Available',
}

export enum ContactPreference {
  PHONE = 'Phone',
  EMAIL = 'Email',
  BOTH = 'Both',
}

export enum BloodRequestUrgency {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  EMERGENCY = 'Emergency',
}

export enum BloodRequestStatus {
  OPEN = 'Open',
  ACCEPTED = 'Accepted',
  PARTIALLY_FULFILLED = 'Partially Fulfilled',
  FULFILLED = 'Fulfilled',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
}

export const ALUMNI_GROUPS = [
  AlumniGroup.SCIENCE,
  AlumniGroup.COMMERCE,
  AlumniGroup.HUMANITIES,
] as const;

export const BLOOD_GROUPS = [
  BloodGroup.A_POSITIVE,
  BloodGroup.A_NEGATIVE,
  BloodGroup.B_POSITIVE,
  BloodGroup.B_NEGATIVE,
  BloodGroup.AB_POSITIVE,
  BloodGroup.AB_NEGATIVE,
  BloodGroup.O_POSITIVE,
  BloodGroup.O_NEGATIVE,
] as const;

export const DONATION_STATUSES = [
  DonationStatus.AVAILABLE,
  DonationStatus.RECENTLY_DONATED,
  DonationStatus.TEMPORARILY_UNAVAILABLE,
  DonationStatus.NOT_AVAILABLE,
] as const;

export const CONTACT_PREFERENCES = [
  ContactPreference.PHONE,
  ContactPreference.EMAIL,
  ContactPreference.BOTH,
] as const;

export const BLOOD_REQUEST_URGENCIES = [
  BloodRequestUrgency.NORMAL,
  BloodRequestUrgency.URGENT,
  BloodRequestUrgency.EMERGENCY,
] as const;

export const BLOOD_REQUEST_STATUSES = [
  BloodRequestStatus.OPEN,
  BloodRequestStatus.ACCEPTED,
  BloodRequestStatus.PARTIALLY_FULFILLED,
  BloodRequestStatus.FULFILLED,
  BloodRequestStatus.CANCELLED,
  BloodRequestStatus.EXPIRED,
] as const;
