import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { CommitteePost } from '@/models/CommitteePost';
import { ALUMNI_GROUPS, BLOOD_GROUPS } from '@/lib/types';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      role = 'alumni',
      phone,
      bloodGroup,
      image,
      isVerified = true,
      batchYear,
      group,
      jobTitle,
      company,
      location,
      bio,
      skills,
      linkedin,
      facebook,
      instagram,
      whatsapp,
      visibility = 'public',
      isBloodDonor = false,
      donationStatus = 'Available',
      bloodDonationConsent = false,
      committeePost,
      committeeRoleTitle,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!batchYear) {
      return NextResponse.json({ error: 'Batch Year is required' }, { status: 400 });
    }

    if (!group) {
      return NextResponse.json({ error: 'Academic Group is required' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    // Default password if not provided
    const rawPassword = password && password.trim() ? password.trim() : 'Alumni@123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // Format skills
    let formattedSkills: string[] = [];
    if (Array.isArray(skills)) {
      formattedSkills = skills.map((s: string) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      formattedSkills = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    // Create User
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'alumni',
      phone: phone ? phone.trim() : '',
      bloodGroup: bloodGroup || undefined,
      image: image || '',
      isVerified: Boolean(isVerified),
    });

    // Target committee post
    const targetPost =
      committeePost && mongoose.Types.ObjectId.isValid(committeePost)
        ? new mongoose.Types.ObjectId(committeePost)
        : null;

    // Create Alumni Profile
    const newProfile = await AlumniProfile.create({
      userId: newUser._id,
      batchYear: parseInt(String(batchYear), 10),
      group,
      bloodGroup: bloodGroup || undefined,
      jobTitle: jobTitle ? jobTitle.trim() : '',
      company: company ? company.trim() : '',
      location: location ? location.trim() : 'Dhaka, Bangladesh',
      bio: bio ? bio.trim() : '',
      skills: formattedSkills,
      linkedin: linkedin ? linkedin.trim() : '',
      facebook: facebook ? facebook.trim() : '',
      instagram: instagram ? instagram.trim() : '',
      whatsapp: whatsapp ? whatsapp.trim() : '',
      visibility: visibility || 'public',
      isBloodDonor: Boolean(isBloodDonor),
      donationStatus: donationStatus || 'Available',
      bloodDonationConsent: Boolean(isBloodDonor || bloodDonationConsent),
      committeePost: targetPost,
      committeeRoleTitle: committeeRoleTitle ? committeeRoleTitle.trim() : '',
    });

    const populatedProfile = await AlumniProfile.findById(newProfile._id)
      .populate('userId', 'name email image isVerified role bloodGroup phone')
      .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault');

    return NextResponse.json({
      message: 'Alumni member created successfully',
      profile: populatedProfile,
    });
  } catch (error: any) {
    console.error('Error creating alumni member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create alumni member' },
      { status: 500 }
    );
  }
}
