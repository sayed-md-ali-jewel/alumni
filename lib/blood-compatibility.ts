/**
 * Standard Red Blood Cell Transfusion Compatibility Logic
 */

export const bloodCompatibility: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],

  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],

  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],

  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export const BLOOD_COMPATIBILITY_MAP = bloodCompatibility;

/**
 * Checks if a donor's blood group is compatible with the requested blood group.
 */
export function isCompatibleDonor(donorBloodGroup?: string, requestedBloodGroup?: string): boolean {
  if (!donorBloodGroup || !requestedBloodGroup) return false;
  const donor = donorBloodGroup.trim();
  const requested = requestedBloodGroup.trim();
  return Boolean(bloodCompatibility[requested]?.includes(donor));
}

/**
 * Returns list of all compatible donor blood groups for a given requested blood group.
 */
export function getCompatibleDonors(requestedBloodGroup?: string): string[] {
  if (!requestedBloodGroup) return [];
  const requested = requestedBloodGroup.trim();
  return bloodCompatibility[requested] || [];
}

/**
 * Checks if a donor is an exact blood group match.
 */
export function isExactMatch(donorBloodGroup?: string, requestedBloodGroup?: string): boolean {
  if (!donorBloodGroup || !requestedBloodGroup) return false;
  return donorBloodGroup.trim().toUpperCase() === requestedBloodGroup.trim().toUpperCase();
}
