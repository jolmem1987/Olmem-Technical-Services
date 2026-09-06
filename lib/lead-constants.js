/**
 * Lead vocabulary — statuses, priorities, methods and their labels.
 *
 * Kept free of any server-only import (no crypto, no database) so client
 * components can render the same options the API validates against. lib/leads.js
 * re-exports everything here, so server code can keep importing from one place.
 */

export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'SITE_VISIT_SCHEDULED',
  'QUOTED',
  'WON',
  'LOST',
  'ARCHIVED',
];

export const LEAD_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export const FOLLOW_UP_METHODS = ['PHONE', 'EMAIL', 'TEXT', 'SITE_VISIT', 'IN_PERSON', 'OTHER'];

export const LEAD_SOURCES = ['CONTACT_FORM', 'CHAT', 'PHONE', 'REFERRAL', 'MANUAL'];

/** Sources a public request may declare for itself. Anything else is ignored
 *  and treated as CONTACT_FORM — a visitor must not be able to mislabel a lead. */
export const PUBLIC_LEAD_SOURCES = ['CONTACT_FORM', 'CHAT'];

export const LEAD_STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  SITE_VISIT_SCHEDULED: 'Site Visit Scheduled',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
  ARCHIVED: 'Archived',
};

export const LEAD_PRIORITY_LABELS = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const FOLLOW_UP_METHOD_LABELS = {
  PHONE: 'Phone',
  EMAIL: 'Email',
  TEXT: 'Text',
  SITE_VISIT: 'Site Visit',
  IN_PERSON: 'In Person',
  OTHER: 'Other',
};

export const LEAD_SOURCE_LABELS = {
  CONTACT_FORM: 'Website Contact Form',
  CHAT: 'Site Assistant (Chat)',
  PHONE: 'Phone Call',
  REFERRAL: 'Referral',
  MANUAL: 'Added Manually',
};
