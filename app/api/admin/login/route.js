import { NextResponse } from 'next/server';
import { isAdminConfigured, verifyAdminCredentials } from '@/lib/adminAuth';
import { setSessionCookie } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin access is not configured. Set ADMIN_USER, ADMIN_PASS and SESSION_SECRET.' },
      { status: 503 }
    );
  }

  let username;
  let password;
  try {
    ({ username, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // One generic message for both a bad username and a bad password — never
  // reveal which half was wrong.
  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
  }

  return setSessionCookie(NextResponse.json({ ok: true }), process.env.ADMIN_USER.trim());
}
