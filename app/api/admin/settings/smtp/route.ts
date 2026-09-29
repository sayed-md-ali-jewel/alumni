import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { SmtpSetting, DEFAULT_SMTP_SETTINGS } from '@/models/SmtpSetting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    await connectToDatabase();

    let settings = await SmtpSetting.findOne({ key: 'smtp_settings' }).lean();

    if (!settings) {
      settings = {
        ...DEFAULT_SMTP_SETTINGS,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD ? '••••••••' : '',
      } as any;
    } else {
      // Don't leak full raw password if not needed, but keep a marker if set
      settings = {
        ...settings,
        hasPassword: Boolean(settings.pass || process.env.SMTP_PASSWORD),
      } as any;
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching admin SMTP settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch SMTP settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const adminId = (session.user as any)?.id;
    const body = await req.json();

    await connectToDatabase();

    const existing = await SmtpSetting.findOne({ key: 'smtp_settings' });

    const updatePayload: any = {
      host: body.host !== undefined ? body.host.trim() : DEFAULT_SMTP_SETTINGS.host,
      port: body.port !== undefined ? Number(body.port) : DEFAULT_SMTP_SETTINGS.port,
      secure: Boolean(body.secure),
      user: body.user !== undefined ? body.user.trim() : '',
      fromName: body.fromName !== undefined ? body.fromName.trim() : DEFAULT_SMTP_SETTINGS.fromName,
      fromEmail: body.fromEmail !== undefined ? body.fromEmail.trim() : DEFAULT_SMTP_SETTINGS.fromEmail,
      replyTo: body.replyTo !== undefined ? body.replyTo.trim() : DEFAULT_SMTP_SETTINGS.replyTo,
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
      updatedBy: adminId,
    };

    // Only update password if a new non-empty password is provided
    if (body.pass !== undefined && body.pass.trim() !== '') {
      updatePayload.pass = body.pass.trim();
    } else if (!existing) {
      updatePayload.pass = '';
    }

    const updated = await SmtpSetting.findOneAndUpdate(
      { key: 'smtp_settings' },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'SMTP settings updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Error updating SMTP settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update SMTP settings' },
      { status: 500 }
    );
  }
}
