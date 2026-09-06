import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { getLead, setLeadArchived, updateLead } from '@/lib/leads';
import { validateLeadUpdateInput } from '@/lib/lead-validation';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
}

export async function GET(request, { params }) {
  if (!getAdminFromRequest(request)) return unauthorized();
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(request, { params }) {
  if (!getAdminFromRequest(request)) return unauthorized();
  const { id } = await params;

  let input;
  try {
    input = validateLeadUpdateInput(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    const updated = await updateLead(id, input);
    if (!updated) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('admin: failed to update lead', error);
    return NextResponse.json({ error: 'Unable to save changes.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!getAdminFromRequest(request)) return unauthorized();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  // Archiving is reversible: ?restore=1 puts the lead back in the pipeline.
  const archived = searchParams.get('restore') !== '1';

  try {
    const changed = await setLeadArchived(id, archived);
    if (!changed) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, archived });
  } catch (error) {
    console.error('admin: failed to archive lead', error);
    return NextResponse.json({ error: 'Unable to archive this lead.' }, { status: 500 });
  }
}
