import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testSmtpConnection, getSmtpConfig } from '@/lib/email';
import { SmtpSetting } from '@/models/SmtpSetting';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

const TestSmtpSchema = z.object({
  recipientEmail: z.string().email('Please enter a valid recipient email'),
  host: z.string().optional(),
  port: z.number().optional(),
  secure: z.boolean().optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = TestSmtpSchema.parse(body);

    await connectToDatabase();
    const dbSettings = await SmtpSetting.findOne({ key: 'smtp_settings' }).lean();

    // Build configuration using provided payload or stored settings
    const config = {
      host: validatedData.host || dbSettings?.host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: validatedData.port || Number(dbSettings?.port) || 587,
      secure: validatedData.secure !== undefined ? validatedData.secure : Boolean(dbSettings?.secure),
      user: validatedData.user !== undefined ? validatedData.user : dbSettings?.user || process.env.SMTP_USER || '',
      pass: validatedData.pass && validatedData.pass.trim() !== ''
        ? validatedData.pass
        : dbSettings?.pass || process.env.SMTP_PASSWORD || '',
      fromName: validatedData.fromName || dbSettings?.fromName || 'KHS Alumni Association',
      fromEmail: validatedData.fromEmail || dbSettings?.fromEmail || 'noreply@khsalumni.org',
    };

    if (!config.host) {
      return NextResponse.json({ error: 'SMTP host is required' }, { status: 400 });
    }

    const result = await testSmtpConnection(config, validatedData.recipientEmail);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error during SMTP test:', error);
    if (error?.name === 'ZodError' || error?.errors) {
      const messages = (error.errors || []).map((e: any) => e.message).filter(Boolean);
      return NextResponse.json(
        { error: messages.join('. ') || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'SMTP test execution failed' },
      { status: 500 }
    );
  }
}
