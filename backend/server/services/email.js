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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function profileLink(profileId, fallbackPath = '/likes') {
  const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (!clientUrl) return '';
  return `${clientUrl}${profileId ? `/profiles/${profileId}` : fallbackPath}`;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true, reason: 'missing-email' };

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
      ${escapeHtml(message)}
    </blockquote>
    <p>Login to reply.</p>
  `;

  return sendEmail({ to, subject, text, html });
}

export async function sendProfileLikeEmail({ to, recipientName, likerName, likerProfileId }) {
  const link = profileLink(likerProfileId);
  const subject = `${likerName} liked your profile`;
  const text = [
    `Hi ${recipientName || 'there'},`,
    '',
    `${likerName} liked your profile on ShadiMatch.`,
    link ? `View their profile: ${link}` : 'Login to view their profile.',
  ].join('\n');

  const html = `
    <p>Hi ${escapeHtml(recipientName || 'there')},</p>
    <p><strong>${escapeHtml(likerName)}</strong> liked your profile on ShadiMatch.</p>
    ${link ? `<p><a href="${escapeHtml(link)}" style="background:#e74c3c;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">View profile</a></p>` : '<p>Login to view their profile.</p>'}
  `;

  return sendEmail({ to, subject, text, html });
}

export async function sendProfileViewEmail({ to, recipientName, viewerName, viewerProfileId }) {
  const link = profileLink(viewerProfileId);
  const subject = `${viewerName} viewed your profile`;
  const text = [
    `Hi ${recipientName || 'there'},`,
    '',
    `${viewerName} visited your profile on ShadiMatch.`,
    link ? `View their profile: ${link}` : 'Login to view their profile.',
  ].join('\n');

  const html = `
    <p>Hi ${escapeHtml(recipientName || 'there')},</p>
    <p><strong>${escapeHtml(viewerName)}</strong> visited your profile on ShadiMatch.</p>
    ${link ? `<p><a href="${escapeHtml(link)}" style="background:#e74c3c;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">View profile</a></p>` : '<p>Login to view their profile.</p>'}
  `;

  return sendEmail({ to, subject, text, html });
}
