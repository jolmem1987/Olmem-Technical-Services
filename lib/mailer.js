/**
 * Shared SMTP notification mailer.
 *
 * Email goes out over SMTP through Nodemailer — the same transport the Olmem
 * Technical Solutions site uses. Resend is deliberately not used here.
 * Configured with SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 * SMTP_FROM and CONTACT_TO_EMAIL.
 *
 * Sending is best-effort: a mail failure must never fail the request that
 * triggered it, so callers get `false` rather than an exception.
 */

import nodemailer from 'nodemailer';

const REQUIRED_VARS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'CONTACT_TO_EMAIL'];

function parseRecipients(input) {
  return input.split(',').map((value) => value.trim()).filter(Boolean);
}

/** True when every SMTP variable the mailer needs is present. */
export function isMailConfigured() {
  return REQUIRED_VARS.every((name) => process.env[name]?.trim());
}

/**
 * Send an internal notification email. Returns true when the message was handed
 * to the SMTP server, false when SMTP is unconfigured or the send failed.
 * Never throws.
 */
export async function sendNotificationEmail({ subject, text, replyTo }, context) {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    console.warn(`${context}: SMTP is not configured (missing ${missing.join(', ')}), skipping notification email.`);
    return false;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isFinite(port)) {
    console.error(`${context}: SMTP_PORT must be a valid number, skipping notification email.`);
    return false;
  }

  const recipients = parseRecipients(process.env.CONTACT_TO_EMAIL.trim());
  if (recipients.length === 0) {
    console.error(`${context}: CONTACT_TO_EMAIL has no recipients, skipping notification email.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM.trim(),
      to: recipients,
      replyTo,
      subject,
      text,
    });

    return true;
  } catch (error) {
    console.error(`${context}: failed to send notification email`, error);
    return false;
  }
}
