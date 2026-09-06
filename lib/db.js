/**
 * Database connection and schema initialization.
 *
 * Uses @vercel/postgres (Neon Postgres, serverless-compatible) against a single
 * env var: DATABASE_URL. In Vercel, connect the Neon store with the custom
 * prefix DATABASE so the pooled connection string is injected as DATABASE_URL.
 * For local development set DATABASE_URL in .env.local.
 *
 * Tables are prefixed `ots_` so this site can safely share a Neon database with
 * the Olmem Technical Solutions site without the two lead pipelines colliding.
 */

import { createPool } from '@vercel/postgres';

// Lazy pool: created on first query, not at module load, so a build without
// DATABASE_URL still succeeds.
let _pool = null;

function getPool() {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. In Vercel, connect your ' +
        'Neon database with the DATABASE prefix so DATABASE_URL is injected. ' +
        'For local development, set DATABASE_URL in .env.local.'
      );
    }
    _pool = createPool({ connectionString });
  }
  return _pool;
}

/** Tagged-template SQL helper backed by DATABASE_URL. */
export const sql = (strings, ...values) => getPool().sql(strings, ...values);

let schemaReady = null;

async function createTables() {
  // Leads — every public inquiry from the contact form, kept so it can be
  // worked in the admin instead of living only in an inbox. ADMIN-ONLY data:
  // nothing here may be surfaced through a public route.
  await sql`
    CREATE TABLE IF NOT EXISTS ots_leads (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      company           TEXT,
      email             TEXT NOT NULL,
      phone             TEXT,
      service_type      TEXT,
      message           TEXT NOT NULL DEFAULT '',
      source            TEXT NOT NULL DEFAULT 'CONTACT_FORM',
      status            TEXT NOT NULL DEFAULT 'NEW',
      priority          TEXT NOT NULL DEFAULT 'NORMAL',
      internal_notes    TEXT,
      quoted_amount     TEXT,
      email_notified    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_at       TIMESTAMPTZ
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ots_leads_status ON ots_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ots_leads_created_at ON ots_leads(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ots_leads_email ON ots_leads(email)`;

  // Follow-up log. This records communication only — nothing here sends email.
  await sql`
    CREATE TABLE IF NOT EXISTS ots_lead_follow_ups (
      id                TEXT PRIMARY KEY,
      lead_id           TEXT NOT NULL REFERENCES ots_leads(id) ON DELETE CASCADE,
      method            TEXT NOT NULL,
      summary           TEXT NOT NULL,
      outcome           TEXT,
      next_action       TEXT,
      next_follow_up_at DATE,
      admin_email       TEXT NOT NULL,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ots_follow_ups_lead_id ON ots_lead_follow_ups(lead_id)`;
}

/** Call before any DB operation to ensure tables exist. Runs once per process. */
export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = createTables().catch((err) => {
      schemaReady = null; // reset so the next call retries
      throw err;
    });
  }
  return schemaReady;
}

/** True when a database is configured. Used to degrade gracefully, not to hide errors. */
export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
