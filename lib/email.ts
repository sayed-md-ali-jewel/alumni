import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/mongodb';
import { SmtpSetting, DEFAULT_SMTP_SETTINGS } from '@/models/SmtpSetting';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isEnabled?: boolean;
}

/**
 * Get active SMTP configuration from database or fallback to environment variables
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    await connectToDatabase();
    const dbSettings = await SmtpSetting.findOne({ key: 'smtp_settings' }).lean();

    if (dbSettings && dbSettings.host) {
      return {
        host: dbSettings.host,
        port: Number(dbSettings.port) || 587,
        secure: Boolean(dbSettings.secure),
        user: dbSettings.user || process.env.SMTP_USER || '',
        pass: dbSettings.pass || process.env.SMTP_PASSWORD || '',
        fromName: dbSettings.fromName || DEFAULT_SMTP_SETTINGS.fromName,
        fromEmail: dbSettings.fromEmail || DEFAULT_SMTP_SETTINGS.fromEmail,
        replyTo: dbSettings.replyTo || DEFAULT_SMTP_SETTINGS.replyTo,
        isEnabled: dbSettings.isEnabled !== false,
      };
    }
  } catch (error) {
    console.error('Error fetching SMTP config from DB:', error);
  }

  // Fallback to process.env
  return {
    host: process.env.SMTP_HOST || DEFAULT_SMTP_SETTINGS.host,
    port: Number(process.env.SMTP_PORT) || DEFAULT_SMTP_SETTINGS.port,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || DEFAULT_SMTP_SETTINGS.fromName,
    fromEmail: process.env.SMTP_FROM_EMAIL || DEFAULT_SMTP_SETTINGS.fromEmail,
    replyTo: process.env.SMTP_REPLY_TO || DEFAULT_SMTP_SETTINGS.replyTo,
    isEnabled: true,
  };
}

/**
 * Creates a nodemailer transporter based on provided or stored config
 */
export function createTransporter(config: SmtpConfig) {
  const isAuthRequired = Boolean(config.user && config.pass);

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure || config.port === 465,
    auth: isAuthRequired
      ? {
          user: config.user,
          pass: config.pass,
        }
      : undefined,
    tls: {
      rejectUnauthorized: false, // allow self-signed certificates in local/dev environments
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Generic email sender function
 */
export async function sendEmail(options: EmailOptions, customConfig?: SmtpConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = customConfig || (await getSmtpConfig());

    if (!config.isEnabled && !customConfig) {
      console.warn('SMTP sending is currently disabled in settings.');
      return { success: false, error: 'SMTP sending is disabled in system settings.' };
    }

    if (!config.host) {
      return { success: false, error: 'SMTP host is not configured.' };
    }

    const transporter = createTransporter(config);
    const fromAddress = `"${options.fromName || config.fromName}" <${options.fromEmail || config.fromEmail}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ''),
      replyTo: options.replyTo || config.replyTo || config.fromEmail,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email via nodemailer:', error);
    return {
      success: false,
      error: error?.message || 'Failed to dispatch email',
    };
  }
}

/**
 * Test SMTP credentials and connection
 */
export async function testSmtpConnection(config: SmtpConfig, testRecipient: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter(config);
    // Verify connection configuration
    await transporter.verify();

    // Send a test email to the recipient
    const sendResult = await sendEmail(
      {
        to: testRecipient,
        subject: `[SMTP Test] Connection Successful - ${config.fromName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">SMTP Connection Test</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">KHS Alumni Association Portal</p>
            </div>
            <div style="padding: 24px 8px; color: #334155; font-size: 14px; line-height: 1.6;">
              <p style="margin-top: 0;">Hello Administrator,</p>
              <p>This is a verification email to confirm that your SMTP server settings are correctly configured and operational.</p>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin: 20px 0; font-family: monospace; font-size: 13px;">
                <div><strong>Host:</strong> ${config.host}</div>
                <div><strong>Port:</strong> ${config.port} (Secure: ${config.secure ? 'SSL' : 'STARTTLS'})</div>
                <div><strong>Username:</strong> ${config.user || '(none)'}</div>
                <div><strong>Sender:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</div>
                <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
              </div>
              <p style="color: #10b981; font-weight: bold; margin-bottom: 0;">✓ Outbound email delivery is active.</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
              ${config.fromName} • Automated System Notification
            </div>
          </div>
        `,
      },
      config
    );

    if (!sendResult.success) {
      throw new Error(sendResult.error || 'Failed to send test email');
    }

    return {
      success: true,
      message: `Test email successfully sent to ${testRecipient}!`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'SMTP Connection failed. Please check host, port, username, and password.',
    };
  }
}

/**
 * Send Password Reset Email Template
 */
export async function sendPasswordResetEmail({
  to,
  recipientName,
  resetUrl,
  locale = 'en',
}: {
  to: string;
  recipientName: string;
  resetUrl: string;
  locale?: string;
}): Promise<{ success: boolean; error?: string }> {
  const isBn = locale === 'bn';
  const appName = isBn ? 'কেএইচএস অ্যালামনাই অ্যাসোসিয়েশন' : 'KHS Alumni Association';

  const subject = isBn
    ? `[পাসওয়ার্ড রিসেট] আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন`
    : `Password Reset Request - ${appName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%); padding: 36px 30px; text-align: center;">
                  <div style="display: inline-block; width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 56px; font-size: 28px; margin-bottom: 12px; color: #ffffff;">
                    🔒
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                    ${isBn ? 'পাসওয়ার্ড রিসেট অনুরোধ' : 'Password Reset Request'}
                  </h1>
                  <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                    ${appName}
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 36px 30px; color: #334155; font-size: 15px; line-height: 1.6;">
                  <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                    ${isBn ? `আসসালামু আলাইকুম ${recipientName},` : `Hello ${recipientName},`}
                  </p>

                  <p>
                    ${
                      isBn
                        ? 'আপনার অ্যাকাউন্ট থেকে পাসওয়ার্ড পরিবর্তনের জন্য একটি অনুরোধ করা হয়েছে। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড নির্ধারণ করুন:'
                        : 'We received a request to reset the password for your alumni portal account. Click the button below to choose a new password:'
                    }
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(225,29,72,0.3);">
                      ${isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset My Password'}
                    </a>
                  </div>

                  <!-- Direct Link Fallback -->
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; font-size: 12px; word-break: break-all; color: #64748b; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">
                      ${isBn ? 'বাটনে কাজ না করলে নিচের লিঙ্কে প্রবেশ করুন:' : 'If the button above does not work, copy and paste this link into your browser:'}
                    </p>
                    <a href="${resetUrl}" style="color: #e11d48; text-decoration: underline;">${resetUrl}</a>
                  </div>

                  <!-- Expiry & Security Notice -->
                  <div style="border-left: 3px solid #f59e0b; background-color: #fffbeb; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin-bottom: 20px;">
                    <strong>⏱ ${isBn ? 'মেয়াদ' : 'Security Notice'}:</strong> ${
                      isBn
                        ? 'এই লিঙ্কটির মেয়াদ আগামী ১ ঘণ্টার মধ্যে শেষ হবে। আপনি যদি এই অনুরোধটি না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন—আপনার অ্যাকাউন্ট সুরক্ষিত থাকবে।'
                        : 'This password reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email; your account remains secure.'
                    }
                  </div>

                  <p style="margin-bottom: 0; font-size: 13px; color: #64748b;">
                    ${isBn ? 'ধন্যবাদ,' : 'Best regards,'}<br>
                    <strong>${appName} Support Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0 0 4px 0;">
                    ${appName} • Secure Alumni Platform
                  </p>
                  <p style="margin: 0;">
                    ${isBn ? 'এটি একটি স্বয়ংক্রিয় বার্তা, অনুগ্রহ করে উত্তর দেবেন না।' : 'This is an automated system email, please do not reply directly.'}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
  });
}
