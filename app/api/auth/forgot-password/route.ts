import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { PasswordResetToken } from '@/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  locale: z.string().optional().default('en'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ForgotPasswordSchema.parse(body);
    const email = validatedData.email.toLowerCase().trim();
    const locale = validatedData.locale || 'en';

    await connectToDatabase();

    const user = await User.findOne({ email });

    // Always respond with a generic success message to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          locale === 'bn'
            ? 'যদি এই ইমেইলে কোনো অ্যাকাউন্ট থেকে থাকে, তবে পাসওয়ার্ড রিসেটের লিঙ্ক পাঠানো হয়েছে।'
            : 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Invalidate any existing unused tokens for this email
    await PasswordResetToken.updateMany(
      { email, used: false },
      { $set: { used: true } }
    );

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour validity

    // Extract client IP if available
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Store token in database
    await PasswordResetToken.create({
      email,
      token,
      expiresAt,
      used: false,
      ipAddress,
    });

    // Determine base URL
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/${locale}/reset-password?token=${token}`;

    console.log(`[Password Reset] Generated reset link for ${email}: ${resetUrl}`);

    // Send email via configured SMTP
    const emailResult = await sendPasswordResetEmail({
      to: email,
      recipientName: user.name || 'Alumni Member',
      resetUrl,
      locale,
    });

    if (!emailResult.success) {
      console.warn(`[Password Reset Email] Email failed to send: ${emailResult.error}`);
    }

    return NextResponse.json({
      success: true,
      message:
        locale === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।'
          : 'A password reset link has been sent to your email. Please check your inbox or spam folder.',
      // In non-production or if email failed, return the reset url for easy developer testing
      debugResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
