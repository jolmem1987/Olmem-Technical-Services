import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLead, FOLLOW_UP_METHOD_LABELS, LEAD_SOURCE_LABELS } from '@/lib/leads';
import { isDatabaseConfigured } from '@/lib/db';
import LeadWorkspace from '@/components/admin/LeadWorkspace';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Lead', robots: { index: false, follow: false } };

export default async function LeadDetailPage({ params }) {
  if (!isDatabaseConfigured()) notFound();

  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <div className="admin-container">
      <Link className="admin-back" href="/admin/leads">
        ← Back to leads
      </Link>

      <div className="admin-page-head">
        <div>
          <p className="eyebrow dark">{LEAD_SOURCE_LABELS[lead.source]}</p>
          <h1>{lead.name}</h1>
          <p className="admin-subhead">
            {lead.company ? `${lead.company} · ` : ''}Received {formatDateTime(lead.createdAt)}
          </p>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div>
          <section className="admin-card">
            <h2>Request</h2>
            <dl className="admin-dl">
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="admin-quiet-link" href={`mailto:${lead.email}`}>
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  {lead.phone ? (
                    <a className="admin-quiet-link" href={`tel:${lead.phone}`}>
                      {lead.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{lead.company || '—'}</dd>
              </div>
              <div>
                <dt>Service requested</dt>
                <dd>{lead.serviceType || '—'}</dd>
              </div>
              <div>
                <dt>Email notification</dt>
                <dd>{lead.emailNotified ? 'Sent' : 'Not sent'}</dd>
              </div>
            </dl>
            <h3 className="admin-h3">Message</h3>
            <p className="admin-message">{lead.message || '—'}</p>
          </section>

          <section className="admin-card">
            <h2>Contact history</h2>
            {lead.followUps.length === 0 ? (
              <p className="admin-empty">
                Nothing logged yet. Record a call or email below so the next person picking this
                up knows where it stands.
              </p>
            ) : (
              <ul className="admin-timeline">
                {lead.followUps.map((entry) => (
                  <li key={entry.id}>
                    <div className="admin-timeline-head">
                      <strong>{FOLLOW_UP_METHOD_LABELS[entry.method]}</strong>
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <p>{entry.summary}</p>
                    {entry.outcome && (
                      <p className="admin-timeline-meta">Outcome: {entry.outcome}</p>
                    )}
                    {entry.nextAction && (
                      <p className="admin-timeline-meta">Next: {entry.nextAction}</p>
                    )}
                    {entry.nextFollowUpAt && (
                      <p className="admin-timeline-meta">Follow up on {entry.nextFollowUpAt}</p>
                    )}
                    <p className="admin-timeline-meta">Logged by {entry.adminEmail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <LeadWorkspace lead={lead} />
      </div>
    </div>
  );
}
