'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setStatus('');
    // Held onto now: React clears currentTarget once we await below.
    const formEl = e.currentTarget;
    const payload = Object.fromEntries(new FormData(formEl).entries());
    try {
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to send request.');
      setStatus('Thanks — your request was sent. We will follow up as soon as possible.');
      formEl.reset();
    } catch (err) {
      setStatus(err.message || 'Unable to send request. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Company<input name="company" /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Phone<input type="tel" name="phone" /></label>
      </div>
      <label>What type of support do you need?
        <select name="serviceType" defaultValue="">
          <option value="" disabled>Select a service</option>
          <option>Industrial Maintenance Coverage</option>
          <option>Contract Preventive Maintenance</option>
          <option>Industrial Troubleshooting & Repair</option>
          <option>CNC & Machine Tool Support</option>
          <option>Maintenance Program Development</option>
          <option>Equipment Assessment / Punch List</option>
          <option>Shutdown / Project Maintenance Support</option>
          <option>Other</option>
        </select>
      </label>
      <label>Tell us about the equipment or maintenance need<textarea name="message" rows="6" required placeholder="For maintenance coverage: desired shift or schedule, expected hours, duration, equipment, location and required skills. For contract PM: equipment count, PM frequency and estimated hours. For a machine issue: model, symptoms, urgency and anything already tried..." /></label>
      <label className="honeypot">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
      <button className="button" disabled={busy}>{busy ? 'Sending…' : 'Send Service Request'}</button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}
