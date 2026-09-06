/**
 * The assistant's matcher. Pure, synchronous, no network, no model.
 *
 * Given what the visitor typed (and what they were just talking about), it picks
 * the single best entry from KNOWLEDGE, or admits it doesn't know. It can only
 * return text that exists in knowledge.js — hallucination is structurally
 * impossible, which is the entire point.
 */

import { FALLBACK, FALLBACK_SUGGESTIONS, KNOWLEDGE } from '@/lib/chatbot/knowledge';

const PHRASE_SCORE = 6;
const KEYWORD_SCORE = 2;
/** Nudges the active topic ahead of an equally-scoring one. Deliberately small:
 *  it should break ties, never override a clear new intent. */
const CONTEXT_BONUS = 1;
/** Below this, we say we don't know rather than serve a bad match. One phrase
 *  hit clears it; a single stray keyword does not. */
const CONFIDENCE_FLOOR = 4;

/** Words too common to carry intent — they'd match everything. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'so', 'of', 'for', 'to', 'in', 'on', 'at',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'have', 'has', 'had',
  'i', 'you', 'we', 'they', 'it', 'my', 'your', 'our', 'me', 'us', 'this', 'that', 'these', 'those',
  'can', 'could', 'would', 'should', 'will', 'just', 'got', 'want', 'need', 'like', 'know',
  'there', 'here', 'with', 'about', 'from', 'into', 'out', 'up', 'down', 'please', 'thanks', 'hi',
  'hello', 'hey', 'im', 'ive', 'id', 'youre', 'whats', 'tell', 'give', 'show', 'looking',
]);

/** Any question about money. */
const PRICE_INTENT =
  /\b(how much|cost|costs|price|prices|pricing|priced|charge|charges|quote|ballpark|afford|expensive|cheap|rate|rates|fee|fees|budget)\b/;

/**
 * A price question that also names a service ("how much for contract PM") should
 * get that service's scoping answer, not the generic pricing entry. One keyword
 * hit is enough to prefer it — the price intent is already established, so we
 * only need to know which thing they meant.
 */
const SERVICE_HINT_FLOOR = 2;

/** Bare price questions with no subject — meaningless without context. */
const CONTEXTUAL_PRICE_PATTERNS = [
  /^how much(\s+is\s+(it|that|this))?\??$/,
  /^(what|hows)?\s*(the|its)?\s*price\??$/,
  /^(what|how much)\s+(does|do|would)\s+(it|that|this)\s+cost\??$/,
  /^cost\??$/,
  /^price\??$/,
  /^and\s+(the\s+)?(price|cost)\??$/,
];

function normalize(input) {
  return input
    .toLowerCase()
    .replace(/[‘’]/g, "'") // curly → straight, so "what's" matches
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(normalized) {
  return normalized.split(' ').filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Prefix match, so one keyword covers a family: "pric" hits price/prices/pricing.
 * Only fires when the token is at least as long as the keyword, which stops
 * short keywords from matching unrelated long words.
 */
function tokenMatches(token, keyword) {
  if (token === keyword) return true;
  if (token.length > keyword.length && token.startsWith(keyword)) return true;
  // Handle the reverse: user typed "price", keyword is "pricing".
  if (keyword.length > token.length && keyword.startsWith(token) && token.length >= 4) return true;
  return false;
}

function scoreEntry(entry, normalized, tokens) {
  let score = 0;

  for (const phrase of entry.phrases ?? []) {
    if (normalized.includes(phrase)) score += PHRASE_SCORE;
  }

  const seen = new Set();
  for (const token of tokens) {
    for (const keyword of entry.keywords ?? []) {
      if (seen.has(keyword)) continue;
      if (tokenMatches(token, keyword)) {
        score += KEYWORD_SCORE;
        seen.add(keyword);
      }
    }
  }

  return score;
}

function isBarePriceQuestion(normalized) {
  return CONTEXTUAL_PRICE_PATTERNS.some((re) => re.test(normalized));
}

function toAnswer(entry) {
  return {
    text: entry.answer,
    links: entry.links ?? [],
    suggestions: entry.followUps ?? [],
    topic: entry.id,
    leadIntent: entry.leadIntent ?? false,
    unknown: false,
  };
}

function scopingAnswer(entry) {
  return {
    text: entry.scoping,
    links: entry.links ?? [],
    suggestions: entry.followUps ?? [],
    topic: entry.id,
    leadIntent: true,
    unknown: false,
  };
}

function fallbackAnswer(topic) {
  return {
    text: FALLBACK,
    links: [],
    suggestions: FALLBACK_SUGGESTIONS,
    topic,
    leadIntent: false,
    unknown: true,
  };
}

/**
 * @param {string} input       what the visitor typed
 * @param {string|null} lastTopic the entry id from the previous bot turn, if any
 * @returns {{text: string, links: object[], suggestions: string[], topic: string|null, leadIntent: boolean, unknown: boolean}}
 */
export function answer(input, lastTopic = null) {
  const normalized = normalize(input);
  if (!normalized) return fallbackAnswer(lastTopic);

  // "How much?" on its own means "how much for the thing we were just discussing."
  // Answer from the active topic's own scoping line rather than the generic
  // pricing entry, which is what a person would do.
  if (isBarePriceQuestion(normalized) && lastTopic) {
    const active = KNOWLEDGE.find((e) => e.id === lastTopic);
    if (active?.scoping) return scopingAnswer(active);
  }

  const tokens = tokenize(normalized);

  // "How much for contract PM?" names its subject. Answer that service's scoping
  // rather than reciting the generic pricing entry at someone who was specific.
  if (PRICE_INTENT.test(normalized)) {
    let service = null;
    let serviceScore = 0;

    for (const entry of KNOWLEDGE) {
      if (entry.id === 'pricing' || !entry.scoping) continue;
      const score = scoreEntry(entry, normalized, tokens);
      if (score > serviceScore) {
        serviceScore = score;
        service = entry;
      }
    }

    if (service && serviceScore >= SERVICE_HINT_FLOOR) return scopingAnswer(service);
  }

  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = scoreEntry(entry, normalized, tokens);
    if (score > 0 && entry.id === lastTopic) score += CONTEXT_BONUS;

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (!best || bestScore < CONFIDENCE_FLOOR) return fallbackAnswer(lastTopic);

  return toAnswer(best);
}

/** Exported for the OpenAI grounding layer and for tests. */
export const __internals = { normalize, tokenize, scoreEntry, isBarePriceQuestion, CONFIDENCE_FLOOR };
