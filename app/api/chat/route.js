/**
 * POST /api/chat  { message, lastTopic?, history? }
 * The per-message endpoint the on-site chat widget calls (same-origin).
 *
 * The reply is ALWAYS grounded in this site's curated knowledge (knowledge.js).
 * The deterministic engine produces the structured parts (links, suggestion
 * chips, lead intent, topic). If OPENAI_API_KEY is set, OpenAI rephrases the
 * prose from that same grounded context; otherwise — or if the API call fails —
 * we return the deterministic text. Node runtime; the key stays server-side.
 */

import { answer } from '@/lib/chatbot/engine';
import { isOpenAIEnabled, llmText } from '@/lib/chatbot/openai';

export const runtime = 'nodejs';

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_TURNS = 12;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const message = typeof body?.message === 'string' ? body.message.slice(0, MAX_MESSAGE_CHARS) : '';
  const lastTopic = typeof body?.lastTopic === 'string' ? body.lastTopic : null;
  const history = sanitizeHistory(body?.history);

  // Deterministic answer first — gives links, suggestions, topic, leadIntent.
  const base = answer(message, lastTopic);

  // If OpenAI is enabled, replace ONLY the prose text with a grounded reply.
  if (message && isOpenAIEnabled()) {
    try {
      const text = await llmText({ message, history, lastTopic });
      return Response.json({ ...base, text });
    } catch (error) {
      // Degrade to the deterministic reply instead of erroring the widget.
      console.error('[chat] OpenAI generation failed, falling back:', error);
    }
  }

  return Response.json(base);
}

/** Keep only the last few well-formed turns the widget sent. */
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return undefined;
  const turns = [];
  for (const turn of history.slice(-MAX_HISTORY_TURNS)) {
    const role = turn?.role === 'bot' ? 'bot' : turn?.role === 'user' ? 'user' : null;
    const text = typeof turn?.text === 'string' ? turn.text.slice(0, MAX_MESSAGE_CHARS) : '';
    if (role && text) turns.push({ role, text });
  }
  return turns.length ? turns : undefined;
}
