/**
 * Server-only admin authorization.
 *
 * The administrator is a single credential pair held in the environment
 * (ADMIN_USER / ADMIN_PASS) — this site has no customer accounts. Both are
 * compared in constant time so a wrong username and a wrong password cost the
 * same, and neither is ever returned to the client.
 */

import { createHash, timingSafeEqual } from 'crypto';
import { getSessionFromCookies, getSessionFromRequest } from '@/lib/session';

function constantTimeEquals(a, b) {
  const bufA = createHash('sha256').update(String(a)).digest();
  const bufB = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(bufA, bufB);
}

/** True when both admin credentials and the session secret are configured. */
export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_USER?.trim() &&
    process.env.ADMIN_PASS?.trim() &&
    process.env.SESSION_SECRET?.trim()
  );
}

/** Verify a submitted username/password against the configured administrator. */
export function verifyAdminCredentials(user, pass) {
  if (!isAdminConfigured()) return false;
  if (typeof user !== 'string' || typeof pass !== 'string') return false;
  // Both comparisons always run — no short-circuit on the username.
  const userOk = constantTimeEquals(user.trim(), process.env.ADMIN_USER.trim());
  const passOk = constantTimeEquals(pass, process.env.ADMIN_PASS);
  return userOk && passOk;
}

/** Authorization for route handlers and admin APIs. */
export function getAdminFromRequest(request) {
  return getSessionFromRequest(request);
}

/** Authorization for layouts, pages, and server actions. */
export async function getAdminFromCookies() {
  return getSessionFromCookies();
}

/** Convenience guard for admin route handlers. */
export function requireAdmin(request) {
  return getAdminFromRequest(request) !== null;
}
