import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AlumniProfile } from '@/models/AlumniProfile';
import { CommitteePost } from '@/models/CommitteePost';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectToDatabase();

    let profile = await AlumniProfile.findById(id)
      .populate('userId', 'name email image isVerified isChatEnabled role bloodGroup phone')
      .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault');

    if (!profile) {
      profile = await AlumniProfile.findOne({ userId: id })
        .populate('userId', 'name email image isVerified isChatEnabled role bloodGroup phone')
        .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault');
    }

    if (!profile) {
      return NextResponse.json({ error: 'Alumni member not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching alumni member:', error);
    return NextResponse.json({ error: 'Failed to fetch alumni member' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(req, params.id);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdate(req, params.id);
}

async function handleUpdate(req: Request, id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      phone,
      bloodGroup,
      image,
      isVerified,
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
      visibility,
      isBloodDonor,
      donationStatus,
      bloodDonationConsent,
      committeePost,
      committeeRoleTitle,
    } = body;

    await connectToDatabase();

    // Find profile
    let profile = await AlumniProfile.findById(id);
    let userId: any = id;

    if (profile) {
      userId = profile.userId;
    } else {
      profile = await AlumniProfile.findOne({ userId: id });
    }

    if (!profile && !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Alumni record not found' }, { status: 404 });
    }

    // User updates
    const userUpdates: any = {};
    if (name !== undefined) userUpdates.name = name.trim();
    if (email !== undefined && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Another user already uses this email address' },
          { status: 400 }
        );
      }
      userUpdates.email = normalizedEmail;
    }
    if (password && password.trim()) {
      userUpdates.password = await bcrypt.hash(password.trim(), 12);
    }
    if (role !== undefined) userUpdates.role = role;
    if (phone !== undefined) userUpdates.phone = phone.trim();
    if (bloodGroup !== undefined) userUpdates.bloodGroup = bloodGroup;
    if (image !== undefined) userUpdates.image = image;
    if (isVerified !== undefined) userUpdates.isVerified = Boolean(isVerified);
    if (body.isChatEnabled !== undefined) userUpdates.isChatEnabled = Boolean(body.isChatEnabled);

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: userUpdates }, { new: true });

    // Profile updates
    const profileUpdates: any = {};
    if (batchYear !== undefined) profileUpdates.batchYear = parseInt(String(batchYear), 10);
    if (group !== undefined) profileUpdates.group = group;
    if (bloodGroup !== undefined) profileUpdates.bloodGroup = bloodGroup;
    if (jobTitle !== undefined) profileUpdates.jobTitle = jobTitle.trim();
    if (company !== undefined) profileUpdates.company = company.trim();
    if (location !== undefined) profileUpdates.location = location.trim();
    if (bio !== undefined) profileUpdates.bio = bio.trim();
    if (skills !== undefined) {
      profileUpdates.skills = Array.isArray(skills)
        ? skills.map((s: string) => String(s).trim()).filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    if (linkedin !== undefined) profileUpdates.linkedin = linkedin.trim();
    if (facebook !== undefined) profileUpdates.facebook = facebook.trim();
    if (instagram !== undefined) profileUpdates.instagram = instagram.trim();
    if (whatsapp !== undefined) profileUpdates.whatsapp = whatsapp.trim();
    if (visibility !== undefined) profileUpdates.visibility = visibility;
    if (body.contactPrivacy !== undefined) profileUpdates.contactPrivacy = body.contactPrivacy;
    if (body.isChatEnabled !== undefined) profileUpdates.isChatEnabled = Boolean(body.isChatEnabled);
    if (isBloodDonor !== undefined) {
      profileUpdates.isBloodDonor = Boolean(isBloodDonor);
      if (isBloodDonor) {
        profileUpdates.bloodDonationConsent = true;
      }
    }
    if (donationStatus !== undefined) profileUpdates.donationStatus = donationStatus;
    if (bloodDonationConsent !== undefined) profileUpdates.bloodDonationConsent = Boolean(bloodDonationConsent);

    if (committeePost !== undefined) {
      profileUpdates.committeePost =
        committeePost && mongoose.Types.ObjectId.isValid(committeePost)
          ? new mongoose.Types.ObjectId(committeePost)
          : null;
    }
    if (committeeRoleTitle !== undefined) {
      profileUpdates.committeeRoleTitle = committeeRoleTitle.trim();
    }

    const updatedProfile = await AlumniProfile.findOneAndUpdate(
      profile ? { _id: profile._id } : { userId },
      { $set: profileUpdates },
      { new: true, upsert: true }
    )
      .populate('userId', 'name email image isVerified isChatEnabled role bloodGroup phone')
      .populate('committeePost', 'name_en name_bn sortOrder isActive isDefault');

    return NextResponse.json({
      message: 'Alumni member updated successfully',
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error updating alumni member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectToDatabase();

    let profile = await AlumniProfile.findById(id);
    let userId: string = id;

    if (profile) {
      userId = profile.userId.toString();
      await AlumniProfile.findByIdAndDelete(id);
    } else {
      await AlumniProfile.findOneAndDelete({ userId: id });
    }

    // Do not delete self if admin is logged in
    if (session.user && (session.user as any).id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account while logged in' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'Alumni member and user account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting alumni member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete alumni member' },
      { status: 500 }
    );
  }
}
