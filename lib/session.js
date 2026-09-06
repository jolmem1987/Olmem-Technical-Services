/**
 * Admin session cookie — HMAC-signed, stateless.
 *
 * Mirrors the signed-token approach used on the Olmem Technical Solutions site,
 * scaled down: this site has no customer portal, so the only identity is the
 * single administrator defined by ADMIN_USER / ADMIN_PASS.
 *
 * Node runtime only (uses node:crypto). Middleware checks cookie PRESENCE for a
 * cheap redirect; the signature is always verified again server-side before any
 * admin data is read.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'ots_admin';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');
  return secret;
}

function base64url(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  return Buffer.from(pad ? padded + '='.repeat(4 - pad) : padded, 'base64').toString('utf8');
}

const HEADER = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

function sign(headerDotPayload) {
  return base64url(createHmac('sha256', getSecret()).update(headerDotPayload).digest());
}

export function createSession(user) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = base64url(JSON.stringify({ user, exp }));
  return `${HEADER}.${payload}.${sign(`${HEADER}.${payload}`)}`;
}

export function verifySession(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    if (header !== HEADER) return null;
    const actual = Buffer.from(sig);
    const expected = Buffer.from(sign(`${header}.${payload}`));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(base64urlDecode(payload));
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof data.user !== 'string') return null;
    return { user: data.user };
  } catch {
    return null;
  }
}

export function setSessionCookie(response, user) {
  response.cookies.set(COOKIE_NAME, createSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? verifySession(match[1]) : null;
}

export async function getSessionFromCookies() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifySession(token) : null;
}
