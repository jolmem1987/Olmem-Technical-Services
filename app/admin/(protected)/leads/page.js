import Link from 'next/link';
import { isDatabaseConfigured } from '@/lib/db';
import { listLeads, LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/leads';
import LeadStatusBadge, { LeadPriorityBadge } from '@/components/admin/LeadStatusBadge';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Leads', robots: { index: false, follow: false } };

export default async function AdminLeadsPage({ searchParams }) {
  const params = await searchParams;
  const statusFilter = LEAD_STATUSES.includes(params?.status) ? params.status : null;
  const showArchived = params?.archived === '1';

  if (!isDatabaseConfigured()) {
    return (
      <div className="admin-container">
        <h1>Leads</h1>
        <p className="admin-empty">
          No database is connected yet. Set <code>DATABASE_URL</code> to start capturing leads.
        </p>
      </div>
    );
  }

  let leads;
  try {
    leads = await listLeads();
  } catch (error) {
    console.error('admin leads: failed to load leads', error);
    return (
      <div className="admin-container">
        <h1>Leads</h1>
        <p className="admin-error">
          Could not reach the database. Check that <code>DATABASE_URL</code> is set correctly.
        </p>
      </div>
    );
  }

  const visible = leads
    .filter((lead) => (showArchived ? Boolean(lead.archivedAt) : !lead.archivedAt))
    .filter((lead) => (statusFilter ? lead.status === statusFilter : true));

  return (
    <div className="admin-container">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow dark">Pipeline</p>
          <h1>Leads</h1>
        </div>
      </div>

      <div className="admin-filters">
        <Link className={!statusFilter && !showArchived ? 'admin-chip active' : 'admin-chip'} href="/admin/leads">
          All Active
        </Link>
        {LEAD_STATUSES.filter((s) => s !== 'ARCHIVED').map((status) => (
          <Link
            key={status}
            href={`/admin/leads?status=${status}`}
            className={statusFilter === status && !showArchived ? 'admin-chip active' : 'admin-chip'}
          >
            {LEAD_STATUS_LABELS[status]}
          </Link>
        ))}
        <Link className={showArchived ? 'admin-chip active' : 'admin-chip'} href="/admin/leads?archived=1">
          Archived
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="admin-empty">No leads match this view.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr key={lead.id}>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>
                    <Link className="text-link" href={`/admin/leads/${lead.id}`}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.company || '—'}</td>
                  <td>
                    <a className="admin-quiet-link" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <>
                        <br />
                        <a className="admin-quiet-link" href={`tel:${lead.phone}`}>
                          {lead.phone}
                        </a>
                      </>
                    )}
                  </td>
                  <td>{lead.serviceType || '—'}</td>
                  <td>
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td>
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>
                  <td>{lead.lastFollowUpAt ? formatDate(lead.lastFollowUpAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
