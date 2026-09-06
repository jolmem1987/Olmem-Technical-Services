/**
 * Public contact form handler.
 *
 * Two independent things happen per submission, and neither is allowed to sink
 * the other: the inquiry is stored as a lead (so it shows up in /admin even if
 * mail is down), and an internal notification goes out over SMTP. The request
 * succeeds if at least one of them worked; it fails only when both failed, so
 * the visitor is never told "sent" when the message went nowhere.
 */

import { createLead, markLeadNotified } from '@/lib/leads';
import { validateContactInput } from '@/lib/lead-validation';
import { isDatabaseConfigured } from '@/lib/db';
import { isMailConfigured, sendNotificationEmail } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function POST(request) {
  let input;
  try {
    const body = await request.json();
    if (body.website) return Response.json({ ok: true }); // honeypot
    input = validateContactInput(body);
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to process request.' }, { status: 400 });
  }

  if (!isDatabaseConfigured() && !isMailConfigured()) {
    return Response.json(
      {
        error:
          'The website contact form is not configured yet. Add the SMTP and DATABASE_URL environment variables in Vercel.',
      },
      { status: 503 }
    );
  }

  const text = [
    'New Olmem Technical Services website request',
    '',
    `Name: ${input.name}`,
    `Company: ${input.company || '-'}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || '-'}`,
    `Service: ${input.serviceType || '-'}`,
    '',
    'Request:',
    input.message,
  ].join('\n');

  const subject = `Service request from ${input.name}${input.company ? ` - ${input.company}` : ''}`;

  const [emailed, leadId] = await Promise.all([
    sendNotificationEmail({ subject, text, replyTo: input.email }, 'contact form'),
    isDatabaseConfigured()
      ? createLead(input).catch((error) => {
          console.error('contact form: failed to store lead', error);
          return null;
        })
      : Promise.resolve(null),
  ]);

  if (leadId && emailed) {
    await markLeadNotified(leadId, true).catch(() => {});
  }

  if (!leadId && !emailed) {
    return Response.json(
      { error: 'We could not deliver your request. Please call us directly.' },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
