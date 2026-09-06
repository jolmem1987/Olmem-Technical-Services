'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FOLLOW_UP_METHODS,
  FOLLOW_UP_METHOD_LABELS,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from '@/lib/lead-constants';

/**
 * The write side of a lead: status/priority/notes, logging a contact attempt,
 * and archiving. Logging a follow-up records what happened — it never sends
 * anything to the customer.
 */
export default function LeadWorkspace({ lead }) {
  const router = useRouter();

  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority);
  const [internalNotes, setInternalNotes] = useState(lead.internalNotes ?? '');
  const [quotedAmount, setQuotedAmount] = useState(lead.quotedAmount ?? '');
  const [savingLead, setSavingLead] = useState(false);
  const [leadMessage, setLeadMessage] = useState('');

  const [followUp, setFollowUp] = useState({
    method: 'PHONE',
    summary: '',
    outcome: '',
    nextAction: '',
    nextFollowUpAt: '',
  });
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');

  const [archiving, setArchiving] = useState(false);
  const isArchived = Boolean(lead.archivedAt);

  async function saveLead(e) {
    e.preventDefault();
    setSavingLead(true);
    setLeadMessage('');
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, internalNotes, quotedAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save changes.');
      setLeadMessage('Saved.');
      router.refresh();
    } catch (err) {
      setLeadMessage(err.message);
    } finally {
      setSavingLead(false);
    }
  }

  async function logFollowUp(e) {
    e.preventDefault();
    setSavingFollowUp(true);
    setFollowUpMessage('');
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUp),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to log this follow-up.');
      setFollowUp({ method: 'PHONE', summary: '', outcome: '', nextAction: '', nextFollowUpAt: '' });
      setFollowUpMessage('Logged.');
      router.refresh();
    } catch (err) {
      setFollowUpMessage(err.message);
    } finally {
      setSavingFollowUp(false);
    }
  }

  async function toggleArchive() {
    setArchiving(true);
    try {
      const url = `/api/admin/leads/${lead.id}${isArchived ? '?restore=1' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Unable to change the archive state.');
      router.refresh();
    } catch (err) {
      setLeadMessage(err.message);
    } finally {
      setArchiving(false);
    }
  }

  const field = (key) => (e) => setFollowUp({ ...followUp, [key]: e.target.value });

  return (
    <aside className="admin-side">
      <section className="admin-card">
        <h2>Status</h2>
        <form className="contact-form" onSubmit={saveLead}>
          <label>
            Pipeline stage
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {LEAD_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {LEAD_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quoted amount
            <input
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(e.target.value)}
              placeholder="e.g. $4,800 or $95/hr"
            />
          </label>
          <label>
            Internal notes
            <textarea
              rows="6"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal only — never shown to the customer."
            />
          </label>
          <button className="button" disabled={savingLead}>
            {savingLead ? 'Saving…' : 'Save'}
          </button>
          {leadMessage && <p className="form-status">{leadMessage}</p>}
        </form>

        <button
          type="button"
          className="admin-linkbutton danger"
          onClick={toggleArchive}
          disabled={archiving}
        >
          {archiving ? 'Working…' : isArchived ? 'Restore lead' : 'Archive lead'}
        </button>
      </section>

      <section className="admin-card">
        <h2>Log contact</h2>
        <p className="admin-hint">Records what happened. Nothing is emailed to the customer.</p>
        <form className="contact-form" onSubmit={logFollowUp}>
          <label>
            Method
            <select value={followUp.method} onChange={field('method')}>
              {FOLLOW_UP_METHODS.map((m) => (
                <option key={m} value={m}>
                  {FOLLOW_UP_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Summary
            <textarea
              rows="3"
              required
              value={followUp.summary}
              onChange={field('summary')}
              placeholder="Called about the PM schedule for their two VMCs…"
            />
          </label>
          <label>
            Outcome
            <input value={followUp.outcome} onChange={field('outcome')} />
          </label>
          <label>
            Next action
            <input value={followUp.nextAction} onChange={field('nextAction')} />
          </label>
          <label>
            Next follow-up date
            <input type="date" value={followUp.nextFollowUpAt} onChange={field('nextFollowUpAt')} />
          </label>
          <button className="button" disabled={savingFollowUp}>
            {savingFollowUp ? 'Logging…' : 'Log Contact'}
          </button>
          {followUpMessage && <p className="form-status">{followUpMessage}</p>}
        </form>
      </section>
    </aside>
  );
}
