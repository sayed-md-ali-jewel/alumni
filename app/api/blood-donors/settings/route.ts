import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { AlumniProfile } from '@/models/AlumniProfile';
import { User } from '@/models/User';
import { BloodDonorSettingsSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const profile = await AlumniProfile.findOne({ userId });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      isBloodDonor: profile.isBloodDonor,
      bloodGroup: profile.bloodGroup || 'O+',
      donationStatus: profile.donationStatus || 'Available',
      lastDonationDate: profile.lastDonationDate,
      nextEligibleDate: profile.nextEligibleDate,
      donorLocation: profile.donorLocation || profile.location || '',
      contactPreference: profile.contactPreference || 'Both',
      donorNotes: profile.donorNotes || '',
      bloodDonationConsent: profile.bloodDonationConsent || false,
      allowAlumniContact: profile.allowAlumniContact !== false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch donor settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validatedData = BloodDonorSettingsSchema.parse(body);

    await connectToDatabase();

    // Sync bloodGroup to User model
    if (validatedData.bloodGroup) {
      await User.findByIdAndUpdate(userId, { bloodGroup: validatedData.bloodGroup });
    }

    // Update AlumniProfile donor settings
    const updatedProfile = await AlumniProfile.findOneAndUpdate(
      { userId },
      {
        isBloodDonor: validatedData.isBloodDonor,
        bloodGroup: validatedData.bloodGroup,
        donationStatus: validatedData.donationStatus,
        lastDonationDate: validatedData.lastDonationDate ? new Date(validatedData.lastDonationDate) : undefined,
        nextEligibleDate: validatedData.nextEligibleDate ? new Date(validatedData.nextEligibleDate) : undefined,
        donorLocation: validatedData.donorLocation,
        contactPreference: validatedData.contactPreference,
        donorNotes: validatedData.donorNotes || '',
        bloodDonationConsent: validatedData.bloodDonationConsent,
        allowAlumniContact: validatedData.allowAlumniContact,
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Blood donation settings updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error updating blood donor settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update donor settings' },
      { status: 500 }
    );
  }
}
