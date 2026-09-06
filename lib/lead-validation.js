/**
 * Input validation for lead writes. Every admin mutation and the public contact
 * form go through here, so no unchecked client value reaches the database.
 */

import {
  FOLLOW_UP_METHODS,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  PUBLIC_LEAD_SOURCES,
} from '@/lib/lead-constants';

function requiredText(value, label, max) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
  if (value.trim().length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return value.trim();
}

function optionalText(value, label, max) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error(`${label} is invalid.`);
  if (value.trim().length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return value.trim() || undefined;
}

function optionalDate(value, label) {
  if (value === undefined || value === null || value === '') return undefined;
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  ) {
    throw new Error(`${label} is invalid.`);
  }
  return value;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a submission from the public contact form. */
export function validateContactInput(body) {
  const email = requiredText(body.email, 'Email', 200);
  if (!EMAIL_RE.test(email)) throw new Error('Please enter a valid email address.');
  return {
    name: requiredText(body.name, 'Name', 200),
    email,
    company: optionalText(body.company, 'Company', 200),
    phone: optionalText(body.phone, 'Phone', 50),
    serviceType: optionalText(body.serviceType, 'Service type', 200),
    message: requiredText(body.message, 'Message', 5000),
    // A visitor may say the request came from the chat assistant, but only from
    // that short allowlist — never an arbitrary label of their choosing.
    source: PUBLIC_LEAD_SOURCES.includes(body.source) ? body.source : 'CONTACT_FORM',
  };
}

export function validateLeadUpdateInput(body) {
  if (!LEAD_STATUSES.includes(body.status)) throw new Error('Invalid lead status.');
  if (!LEAD_PRIORITIES.includes(body.priority)) throw new Error('Invalid lead priority.');
  return {
    status: body.status,
    priority: body.priority,
    internalNotes: optionalText(body.internalNotes, 'Internal notes', 5000),
    quotedAmount: optionalText(body.quotedAmount, 'Quoted amount', 100),
  };
}

export function validateFollowUpInput(body) {
  if (!FOLLOW_UP_METHODS.includes(body.method)) throw new Error('Invalid contact method.');
  return {
    method: body.method,
    summary: requiredText(body.summary, 'Summary', 3000),
    outcome: optionalText(body.outcome, 'Outcome', 2000),
    nextAction: optionalText(body.nextAction, 'Next action', 1000),
    nextFollowUpAt: optionalDate(body.nextFollowUpAt, 'Next follow-up date'),
  };
}
