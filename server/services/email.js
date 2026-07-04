import nodemailer from 'nodemailer';

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOfflineMessageEmail({ to, recipientName, senderName, message }) {
  if (!to) return { skipped: true, reason: 'missing-email' };

  const subject = `New message from ${senderName}`;
  const text = [
    `Hi ${recipientName || 'there'},`,
    '',
    `${senderName} sent you a message on ShadiMatch:`,
    '',
    message,
    '',
    'Login to reply.',
  ].join('\n');

  const html = `
    <p>Hi ${recipientName || 'there'},</p>
    <p><strong>${senderName}</strong> sent you a message on ShadiMatch:</p>
    <blockquote style="border-left: 4px solid #e74c3c; margin: 16px 0; padding-left: 12px;">
      ${String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </blockquote>
    <p>Login to reply.</p>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    console.log('[email:fallback]', { to, subject, text });
    return { skipped: true, reason: 'smtp-not-configured' };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}
