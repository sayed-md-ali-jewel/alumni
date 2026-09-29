import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { ProfileUpdateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const [user, profile] = await Promise.all([
      User.findById(userId).select('-password'),
      AlumniProfile.findOne({ userId }),
    ]);

    return NextResponse.json({ user, profile });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validatedData = ProfileUpdateSchema.parse(body);

    await connectToDatabase();

    // Parse comma-separated skills
    const skillsArray = validatedData.skills
      ? validatedData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Update User Name, Image, phone, bloodGroup
    await User.findByIdAndUpdate(userId, {
      name: validatedData.name,
      ...(validatedData.image ? { image: validatedData.image } : {}),
      ...(validatedData.phone ? { phone: validatedData.phone } : {}),
      ...(validatedData.bloodGroup ? { bloodGroup: validatedData.bloodGroup } : {}),
    });

    // Update or Upsert AlumniProfile
    const updatedProfile = await AlumniProfile.findOneAndUpdate(
      { userId },
      {
        batchYear: validatedData.batchYear,
        group: validatedData.group,
        bloodGroup: validatedData.bloodGroup,
        company: validatedData.company || '',
        jobTitle: validatedData.jobTitle || '',
        location: validatedData.location || '',
        bio: validatedData.bio || '',
        linkedin: validatedData.linkedin || '',
        facebook: validatedData.facebook || '',
        instagram: validatedData.instagram || '',
        whatsapp: validatedData.whatsapp || '',
        skills: skillsArray,
        phone: validatedData.phone || '',
        visibility: validatedData.visibility || 'public',
        // Blood donation fields
        isBloodDonor: validatedData.isBloodDonor,
        donationStatus: validatedData.donationStatus,
        lastDonationDate: validatedData.lastDonationDate ? new Date(validatedData.lastDonationDate) : undefined,
        nextEligibleDate: validatedData.nextEligibleDate ? new Date(validatedData.nextEligibleDate) : undefined,
        donorLocation: validatedData.donorLocation || validatedData.location || '',
        contactPreference: validatedData.contactPreference,
        donorNotes: validatedData.donorNotes || '',
        bloodDonationConsent: validatedData.bloodDonationConsent,
        allowAlumniContact: validatedData.allowAlumniContact,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error', errors: messages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
