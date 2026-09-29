import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { PasswordResetToken } from '@/models/PasswordResetToken';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  locale: z.string().optional().default('en'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ResetPasswordSchema.parse(body);
    const { token, password, locale } = validatedData;
    const isBn = locale === 'bn';

    await connectToDatabase();

    const resetRecord = await PasswordResetToken.findOne({
      token: token.trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          error: isBn
            ? 'পাসওয়ার্ড রিসেট লিঙ্কটি অবৈধ বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে পুনরায় অনুরোধ করুন।'
            : 'This password reset link is invalid or has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      return NextResponse.json(
        { error: isBn ? 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' : 'User account could not be found.' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used and invalidate all tokens for this email
    await PasswordResetToken.updateMany(
      { email: resetRecord.email },
      { $set: { used: true } }
    );

    return NextResponse.json({
      success: true,
      message: isBn
        ? 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! অনুগ্রহ করে নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
        : 'Your password has been reset successfully! You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Password reset execution error:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
