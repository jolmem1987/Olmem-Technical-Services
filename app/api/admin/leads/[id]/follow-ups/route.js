import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { addLeadFollowUp, getLead } from '@/lib/leads';
import { validateFollowUpInput } from '@/lib/lead-validation';

export const runtime = 'nodejs';

/** Log a contact attempt against a lead. This records only — it sends nothing. */
export async function POST(request, { params }) {
  const session = getAdminFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });

  const { id } = await params;

  let input;
  try {
    input = validateFollowUpInput(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    const lead = await getLead(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

    const adminEmail = process.env.ADMIN_EMAIL?.trim() || session.user;
    await addLeadFollowUp(id, input, adminEmail);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('admin: failed to log follow-up', error);
    return NextResponse.json({ error: 'Unable to log this follow-up.' }, { status: 500 });
  }
}
