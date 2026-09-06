import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
