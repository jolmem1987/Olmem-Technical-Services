/**
 * Lead data layer — public inquiries captured for admin follow-up.
 *
 * Leads are ADMIN-ONLY. Nothing in this module may be surfaced through a public
 * route: not internal notes, follow-ups, status, priority, or quoted amounts.
 *
 * This layer tracks communication only. Nothing here sends email.
 */

import { randomBytes } from 'crypto';
import { ensureSchema, sql } from '@/lib/db';
import {
  FOLLOW_UP_METHODS,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from '@/lib/lead-constants';

export {
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  FOLLOW_UP_METHODS,
  LEAD_SOURCES,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
  FOLLOW_UP_METHOD_LABELS,
  LEAD_SOURCE_LABELS,
} from '@/lib/lead-constants';

const iso = (v) => (v instanceof Date ? v.toISOString() : v ? String(v) : undefined);
const text = (v) => (v === null || v === undefined || v === '' ? undefined : String(v));

const normStatus = (v) => (LEAD_STATUSES.includes(v) ? v : 'NEW');
const normPriority = (v) => (LEAD_PRIORITIES.includes(v) ? v : 'NORMAL');
const normSource = (v) => (LEAD_SOURCES.includes(v) ? v : 'CONTACT_FORM');

function mapLead(row, followUps = []) {
  return {
    id: String(row.id),
    name: String(row.name),
    company: text(row.company),
    email: String(row.email),
    phone: text(row.phone),
    serviceType: text(row.service_type),
    message: row.message ? String(row.message) : '',
    source: normSource(row.source),
    status: normStatus(row.status),
    priority: normPriority(row.priority),
    internalNotes: text(row.internal_notes),
    quotedAmount: text(row.quoted_amount),
    emailNotified: Boolean(row.email_notified),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at ?? row.created_at),
    archivedAt: iso(row.archived_at),
    lastFollowUpAt: iso(row.last_follow_up_at),
    followUps,
  };
}

function mapFollowUp(row) {
  return {
    id: String(row.id),
    method: FOLLOW_UP_METHODS.includes(row.method) ? row.method : 'OTHER',
    summary: String(row.summary),
    outcome: text(row.outcome),
    nextAction: text(row.next_action),
    nextFollowUpAt: iso(row.next_follow_up_at)?.slice(0, 10),
    adminEmail: String(row.admin_email),
    createdAt: iso(row.created_at),
  };
}

// ─── Capture (called from the public contact form handler) ───────────────────

/** Persist a public inquiry as a lead. Returns the new lead id. */
export async function createLead(input) {
  await ensureSchema();
  const id = randomBytes(12).toString('hex');
  await sql`
    INSERT INTO ots_leads (
      id, name, company, email, phone, service_type, message, source,
      status, priority, email_notified
    ) VALUES (
      ${id}, ${input.name}, ${input.company ?? null}, ${input.email.toLowerCase().trim()},
      ${input.phone ?? null}, ${input.serviceType ?? null}, ${input.message ?? ''},
      ${normSource(input.source)}, 'NEW', 'NORMAL', ${Boolean(input.emailNotified)}
    )
  `;
  return id;
}

/** Record whether the internal notification email actually went out. */
export async function markLeadNotified(id, notified) {
  await ensureSchema();
  await sql`UPDATE ots_leads SET email_notified = ${notified} WHERE id = ${id}`;
}

// ─── Admin reads ─────────────────────────────────────────────────────────────

export async function listLeads() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT l.*, MAX(f.created_at) AS last_follow_up_at
      FROM ots_leads l
      LEFT JOIN ots_lead_follow_ups f ON f.lead_id = l.id
     GROUP BY l.id
     ORDER BY l.created_at DESC
  `;
  return rows.map((r) => mapLead(r));
}

export async function getLead(id) {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM ots_leads WHERE id = ${id}`;
  if (rows.length === 0) return null;
  const { rows: followUpRows } = await sql`
    SELECT * FROM ots_lead_follow_ups WHERE lead_id = ${id} ORDER BY created_at DESC
  `;
  const followUps = followUpRows.map(mapFollowUp);
  const lead = mapLead(rows[0], followUps);
  lead.lastFollowUpAt = followUps[0]?.createdAt;
  return lead;
}

/** Counts by status, for the dashboard. Only real values — never invented. */
export async function countLeadsByStatus() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT status, COUNT(*) AS count FROM ots_leads WHERE archived_at IS NULL GROUP BY status
  `;
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  for (const row of rows) counts[normStatus(row.status)] = Number(row.count ?? 0);
  return counts;
}

// ─── Admin writes ────────────────────────────────────────────────────────────

export async function updateLead(id, input) {
  await ensureSchema();
  const { rowCount } = await sql`
    UPDATE ots_leads SET
      status         = ${input.status},
      priority       = ${input.priority},
      internal_notes = ${input.internalNotes ?? null},
      quoted_amount  = ${input.quotedAmount ?? null},
      updated_at     = NOW()
    WHERE id = ${id}
  `;
  return (rowCount ?? 0) > 0;
}

export async function addLeadFollowUp(leadId, data, adminEmail) {
  await ensureSchema();
  const id = randomBytes(12).toString('hex');
  await sql`
    INSERT INTO ots_lead_follow_ups
      (id, lead_id, method, summary, outcome, next_action, next_follow_up_at, admin_email)
    VALUES
      (${id}, ${leadId}, ${data.method}, ${data.summary}, ${data.outcome ?? null},
       ${data.nextAction ?? null}, ${data.nextFollowUpAt || null}, ${adminEmail})
  `;
  await sql`UPDATE ots_leads SET updated_at = NOW() WHERE id = ${leadId}`;
}

export async function setLeadArchived(id, archived) {
  await ensureSchema();
  const { rowCount } = await sql`
    UPDATE ots_leads
       SET archived_at = ${archived ? new Date().toISOString() : null},
           status      = ${archived ? 'ARCHIVED' : 'NEW'},
           updated_at  = NOW()
     WHERE id = ${id}
  `;
  return (rowCount ?? 0) > 0;
}
