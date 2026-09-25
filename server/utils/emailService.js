const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

let transporter = null;

// Initialize or retrieve Nodemailer Transporter
const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: port || 587,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  } else {
    // Development fallback: Use Ethereal or test mock transport
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Nodemailer initialized with Ethereal test account:', testAccount.user);
    } catch (err) {
      // Fallback dummy transport that logs without error
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('📧 Nodemailer using JSON transport fallback.');
    }
  }

  return transporter;
};

// Base HTML Email Template Generator echoing UniSphere's Minimalist SaaS Aesthetic
const createBaseEmailHtml = ({ preheader, title, badge, contentHtml, actionUrl, actionText, footerNote }) => {
  const brandName = 'UniSphere';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resolvedActionUrl = actionUrl ? (actionUrl.startsWith('http') ? actionUrl : `${clientUrl}${actionUrl}`) : clientUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || brandName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #faf9f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #121212;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 580px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 1px solid #e7e5de;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .header {
      padding: 32px 36px 20px;
      border-bottom: 1px solid #f1efe8;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #111827;
      text-decoration: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #f3f2ec;
      border: 1px solid #e5e3dc;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px;
    }
    .headline {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.25;
      color: #111827;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 24px 0;
    }
    .card-box {
      background-color: #faf9f6;
      border: 1px solid #ece9df;
      border-radius: 16px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #111827;
      text-align: center;
      margin: 16px 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .btn-pill {
      display: inline-block;
      background-color: #111827;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 9999px;
      margin: 16px 0 8px;
      text-align: center;
    }
    .footer {
      background-color: #faf9f5;
      padding: 24px 36px;
      border-top: 1px solid #f1efe8;
      font-size: 12px;
      color: #8c8f96;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div style="display: none; font-size: 1px; color: #faf9f5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title || 'UniSphere Academic Notification'}
  </div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <div class="wrapper">
          <div class="header">
            <span class="logo">🎓 UniSphere</span>
            ${badge ? `<span class="badge">${badge}</span>` : ''}
          </div>
          <div class="content">
            <h1 class="headline">${title}</h1>
            ${contentHtml}
            ${actionText ? `<div style="text-align: center; margin: 28px 0 12px;"><a href="${resolvedActionUrl}" class="btn-pill">${actionText} &nearr;</a></div>` : ''}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">UniSphere AI-Powered Academic Super-App &bull; Unified Campus Hub</p>
            <p style="margin: 0;">${footerNote || 'This is an automated system email. Do not share confidential security codes.'}</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send 6-digit OTP verification email
 */
const sendOtpEmail = async ({ to, name, otp }) => {
  const mailTransporter = await getTransporter();
  const from = process.env.EMAIL_FROM || '"UniSphere Security" <noreply@unisphere.edu>';
  const subject = `Your UniSphere Verification Code: ${otp}`;

  const contentHtml = `
    <p class="body-text">Hello ${name ? name.split(' ')[0] : 'there'},</p>
    <p class="body-text">Thank you for joining UniSphere. To complete your registration and activate your university workspace, please enter the 6-digit verification code below:</p>
    <div class="card-box">
      <div style="text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">One-Time Security Code</div>
      <div class="otp-code">${otp}</div>
      <div style="text-align: center; font-size: 12px; color: #9ca3af;">Valid for 10 minutes &bull; Single use only</div>
    </div>
    <p class="body-text">If you did not initiate this request, you can safely disregard this email.</p>
  `;

  const html = createBaseEmailHtml({
    preheader: `Your UniSphere verification code is ${otp}`,
    title: 'Verify Your Email Address',
    badge: 'Security OTP',
    contentHtml,
    actionText: 'Enter Code in UniSphere',
    actionUrl: `/verify-otp?email=${encodeURIComponent(to)}`,
    footerNote: 'Never share your verification code with anyone.',
  });

  try {
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (nodemailer.getTestMessageUrl && info.messageId) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(`📧 Ethereal OTP Email Preview URL: ${preview}`);
    }

    await NotificationLog.create({
      recipientEmail: to,
      type: 'otp',
      subject,
      message: `OTP code dispatched to ${to}`,
      status: 'sent',
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    await NotificationLog.create({
      recipientEmail: to,
      type: 'otp',
      subject,
      message: `Failed to send OTP to ${to}`,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Send an academic event notification email (replaces in-app notification feed)
 */
const sendNotificationEmail = async ({
  to,
  recipientId,
  name,
  subject,
  title,
  message,
  category = 'general',
  actionUrl = '/dashboard',
  actionText = 'View in Workspace',
  metadata = {},
}) => {
  if (!to) return { success: false, error: 'No recipient email' };

  const mailTransporter = await getTransporter();
  const from = process.env.EMAIL_FROM || '"UniSphere Updates" <noreply@unisphere.edu>';

  let metaItemsHtml = '';
  if (Object.keys(metadata).length > 0) {
    metaItemsHtml = `
      <div class="card-box" style="margin-top: 16px;">
        ${Object.entries(metadata)
          .map(
            ([k, v]) => `
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f0eee7;">
            <span style="color: #6b7280; font-weight: 500;">${k}</span>
            <span style="color: #111827; font-weight: 600;">${v}</span>
          </div>`
          )
          .join('')}
      </div>
    `;
  }

  const contentHtml = `
    <p class="body-text">Hello ${name ? name.split(' ')[0] : 'Student'},</p>
    <p class="body-text">${message}</p>
    ${metaItemsHtml}
  `;

  const html = createBaseEmailHtml({
    preheader: subject,
    title: title || subject,
    badge: category.toUpperCase(),
    contentHtml,
    actionUrl,
    actionText,
    footerNote: 'You received this notification as part of your UniSphere campus updates.',
  });

  try {
    const info = await mailTransporter.sendMail({
      from,
      to,
      subject: `[UniSphere] ${subject}`,
      html,
    });

    if (nodemailer.getTestMessageUrl && info.messageId) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(`📧 Ethereal Notification Preview URL: ${preview}`);
    }

    await NotificationLog.create({
      recipientEmail: to,
      recipientId,
      type: category,
      subject,
      message,
      status: 'sent',
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send notification email to ${to}:`, error.message);
    await NotificationLog.create({
      recipientEmail: to,
      recipientId,
      type: category,
      subject,
      message,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendNotificationEmail,
};
