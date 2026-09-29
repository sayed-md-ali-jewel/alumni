import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PasswordResetToken } from '@/models/PasswordResetToken';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'Reset token is required' }, { status: 400 });
    }

    await connectToDatabase();

    const resetRecord = await PasswordResetToken.findOne({
      token: token.trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          valid: false,
          error: 'This password reset link is invalid or has already expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Mask email for security display (e.g. j***@example.com)
    const [localPart, domain] = resetRecord.email.split('@');
    const maskedEmail =
      localPart.length > 2
        ? `${localPart.substring(0, 2)}***@${domain}`
        : `${localPart.substring(0, 1)}***@${domain}`;

    return NextResponse.json({
      valid: true,
      email: maskedEmail,
      expiresAt: resetRecord.expiresAt,
    });
  } catch (error: any) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { valid: false, error: 'An unexpected error occurred while verifying the token' },
      { status: 500 }
    );
  }
}
