import Link from 'next/link';
import { isDatabaseConfigured } from '@/lib/db';
import { countLeadsByStatus, listLeads, LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/leads';
import LeadStatusBadge from '@/components/admin/LeadStatusBadge';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="admin-container">
        <h1>Dashboard</h1>
        <p className="admin-empty">
          No database is connected yet. Set <code>DATABASE_URL</code> in your Vercel project (or in{' '}
          <code>.env.local</code> for local development) to start capturing and working leads.
        </p>
      </div>
    );
  }

  let counts;
  let leads;
  try {
    [counts, leads] = await Promise.all([countLeadsByStatus(), listLeads()]);
  } catch (error) {
    console.error('admin dashboard: failed to load leads', error);
    return (
      <div className="admin-container">
        <h1>Dashboard</h1>
        <p className="admin-error">
          Could not reach the database. Check that <code>DATABASE_URL</code> is set correctly.
        </p>
      </div>
    );
  }

  const open = leads.filter((l) => !l.archivedAt);
  const recent = open.slice(0, 8);
  const needsFollowUp = open.filter((l) => l.status === 'NEW' || l.status === 'CONTACTED').length;

  return (
    <div className="admin-container">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow dark">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <Link className="button button-sm" href="/admin/leads">
          All Leads
        </Link>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{open.length}</strong>
          <span>Active leads</span>
        </div>
        <div className="admin-stat">
          <strong>{counts.NEW}</strong>
          <span>New / unworked</span>
        </div>
        <div className="admin-stat">
          <strong>{needsFollowUp}</strong>
          <span>Awaiting follow-up</span>
        </div>
        <div className="admin-stat">
          <strong>{counts.WON}</strong>
          <span>Won</span>
        </div>
      </div>

      <h2 className="admin-section-title">Pipeline</h2>
      <div className="admin-pipeline">
        {LEAD_STATUSES.filter((s) => s !== 'ARCHIVED').map((status) => (
          <Link key={status} href={`/admin/leads?status=${status}`} className="admin-pipe">
            <strong>{counts[status]}</strong>
            <span>{LEAD_STATUS_LABELS[status]}</span>
          </Link>
        ))}
      </div>

      <h2 className="admin-section-title">Latest requests</h2>
      {recent.length === 0 ? (
        <p className="admin-empty">
          No leads yet. Every submission from the website contact form will appear here.
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Company</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((lead) => (
                <tr key={lead.id}>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>
                    <Link className="text-link" href={`/admin/leads/${lead.id}`}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.company || '—'}</td>
                  <td>{lead.serviceType || '—'}</td>
                  <td>
                    <LeadStatusBadge status={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
