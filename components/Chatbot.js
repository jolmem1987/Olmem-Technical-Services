'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GREETING, OPENING_SUGGESTIONS } from '@/lib/chatbot/knowledge';

/**
 * The on-site assistant.
 *
 * Answers come from /api/chat, which is grounded in lib/chatbot/knowledge.js.
 * When the visitor shows buying intent the assistant OFFERS to take their
 * details — it never hijacks the conversation into a form. Captured details go
 * to /api/contact with source CHAT, so the lead lands in /admin next to every
 * contact-form lead and triggers the same SMTP notification.
 */

/* ─── helpers ─── */

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const isExternal = (href) =>
  href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('/api/');

/**
 * Tags the lead with what the visitor was actually asking about, using the same
 * service labels the contact form's dropdown offers. A lead that arrives
 * labelled "Contract Preventive Maintenance" is worth more than "chat inquiry".
 */
const TOPIC_TO_SERVICE = {
  coverage: 'Industrial Maintenance Coverage',
  'contract-pm': 'Contract Preventive Maintenance',
  breakdown: 'Industrial Troubleshooting & Repair',
  cnc: 'CNC & Machine Tool Support',
  'pm-development': 'Maintenance Program Development',
  assessment: 'Equipment Assessment / Punch List',
  shutdown: 'Shutdown / Project Maintenance Support',
  equipment: 'Industrial Troubleshooting & Repair',
  pricing: 'Other',
  process: 'Other',
  availability: 'Other',
  area: 'Other',
  contact: 'Other',
};

/* ─── lead capture ─── */

const STEP_ORDER = ['name', 'company', 'email', 'phone', 'need', 'done'];

const STEP_PROMPT = {
  name: 'What’s your name?',
  company: 'Thanks. What facility or company is this for?',
  email: 'What’s the best email to reach you at?',
  phone: 'A phone number? (Optional — type “skip” to skip.)',
  need:
    'Last one — what do you need covered? Shift or schedule, expected duration, and the equipment involved all help.',
};

const nextStep = (current) => STEP_ORDER[Math.min(STEP_ORDER.indexOf(current) + 1, STEP_ORDER.length - 1)];

const BLANK_LEAD = { name: '', company: '', email: '', phone: '', need: '' };

const LEAD_HANDOFF_CHIP = 'Request maintenance coverage';

/* ─── component ─── */

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ id: 1, text: GREETING, sender: 'bot' }]);
  const [suggestions, setSuggestions] = useState(OPENING_SUGGESTIONS);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState('chat');
  const [leadStep, setLeadStep] = useState('name');
  const [lead, setLead] = useState({ ...BLANK_LEAD });
  const topicRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [msgs, suggestions]);

  const addBot = useCallback((text, links) => {
    setMsgs((p) => [...p, { id: p.length + 1, text, sender: 'bot', links }]);
  }, []);

  const startLeadCapture = useCallback(() => {
    setMode('leadCapture');
    setLeadStep('name');
    setSuggestions([]);
    addBot(`Happy to pass your details straight to Olmem. Five quick questions.\n\n${STEP_PROMPT.name}`);
  }, [addBot]);

  const submitLead = useCallback(async (l) => {
    const topic = topicRef.current;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: l.name,
          company: l.company,
          email: l.email,
          phone: l.phone || undefined,
          serviceType: (topic && TOPIC_TO_SERVICE[topic]) || 'Other',
          message: `[Site assistant lead]\nDiscussed: ${topic ?? 'not specified'}\nNeed: ${l.need}`,
          source: 'CHAT',
          website: '', // honeypot, deliberately empty
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  /* ─── knowledge-base answer (server-side /api/chat) ─── */

  const handleChatInput = useCallback(
    async (text) => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            lastTopic: topicRef.current,
            history: msgs.slice(-8).map((m) => ({ role: m.sender, text: m.text })),
          }),
        });
        const result = await res.json();
        topicRef.current = result.topic ?? null;

        addBot(result.text, result.links);

        // A buying question earns the offer to hand off — but the visitor
        // decides, rather than the bot forcing them into a form.
        const chips = [...(result.suggestions ?? [])];
        if (result.leadIntent && !chips.includes(LEAD_HANDOFF_CHIP)) chips.push(LEAD_HANDOFF_CHIP);
        setSuggestions(chips);
      } catch {
        addBot(
          'Sorry — I had trouble connecting just now. The service request form is the most reliable way to reach Olmem.',
          [{ label: 'Request service', href: '/contact' }],
        );
        setSuggestions(OPENING_SUGGESTIONS);
      }
    },
    [addBot, msgs],
  );

  /* ─── lead capture handler ─── */

  const handleLeadInput = useCallback(
    async (text) => {
      const updated = { ...lead };

      if (leadStep === 'name') {
        updated.name = text;
      } else if (leadStep === 'company') {
        updated.company = text;
      } else if (leadStep === 'email') {
        if (!isEmail(text)) {
          addBot('That doesn’t look like a valid email. Could you double-check it?');
          return;
        }
        updated.email = text;
      } else if (leadStep === 'phone') {
        updated.phone = text.trim().toLowerCase() === 'skip' ? '' : text;
      } else if (leadStep === 'need') {
        updated.need = text;
      }

      setLead(updated);
      const ns = nextStep(leadStep);

      if (ns === 'done') {
        const ok = await submitLead(updated);
        addBot(
          ok
            ? `Thank you, ${updated.name}. That’s with Olmem now — you’ll get a reply at ${updated.email}.\n\nAnything else I can answer in the meantime?`
            : `Thanks, ${updated.name}. Something went wrong submitting that, so it did NOT send — and I’d rather tell you than let you assume it did.\n\nPlease use the service request form so it doesn’t get lost.`,
          ok ? undefined : [{ label: 'Request service', href: '/contact' }],
        );
        setMode('chat');
        setLeadStep('name');
        setLead({ ...BLANK_LEAD });
        setSuggestions([]);
      } else {
        addBot(STEP_PROMPT[ns]);
        setLeadStep(ns);
      }
    },
    [lead, leadStep, addBot, submitLead],
  );

  /* ─── send orchestrator ─── */

  const send = useCallback(
    (raw) => {
      const text = raw.trim();
      if (!text || sending) return;

      setMsgs((p) => [...p, { id: p.length + 1, text, sender: 'user' }]);
      setInput('');
      setSuggestions([]);
      setSending(true);

      if (mode === 'chat' && text === LEAD_HANDOFF_CHIP) {
        startLeadCapture();
        setSending(false);
        return;
      }

      if (mode === 'leadCapture') {
        handleLeadInput(text).finally(() => setSending(false));
        return;
      }

      handleChatInput(text).finally(() => setSending(false));
    },
    [sending, mode, startLeadCapture, handleLeadInput, handleChatInput],
  );

  /* ─── render ─── */

  return (
    <>
      <button
        type="button"
        className="chat-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        aria-expanded={open}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Olmem Technical Services assistant">
          <div className="chat-head">
            <div>
              <strong>Olmem Technical Services</strong>
              <span>Maintenance coverage • Contract PM • Machine support</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="chat-log">
            {msgs.map((m) => (
              <div key={m.id} className={m.sender === 'user' ? 'chat-row user' : 'chat-row bot'}>
                <div className="chat-bubble">{m.text}</div>

                {m.links && m.links.length > 0 && (
                  <div className="chat-links">
                    {m.links.map((l) =>
                      isExternal(l.href) ? (
                        <a key={l.href} href={l.href}>
                          {l.label}
                        </a>
                      ) : (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                          {l.label}
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="chat-row bot">
                <div className="chat-bubble typing">…</div>
              </div>
            )}

            {!sending && suggestions.length > 0 && (
              <div className="chat-chips">
                {suggestions.map((s) => (
                  <button type="button" key={s} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                mode === 'leadCapture' ? 'Type your answer…' : 'Ask about coverage, PM, or a machine issue…'
              }
              disabled={sending}
              aria-label="Message"
            />
            <button type="button" onClick={() => send(input)} disabled={sending || !input.trim()}>
              {sending ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
