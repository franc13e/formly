import type { ChatMessage, CycleInfo } from "../types";

// ── Food chat ─────────────────────────────────────────────────────────────────

/** Suggestion chips shown while the chat is empty. */
export const STARTER_PROMPTS = [
  "What should I eat before a morning workout?",
  "I'm bloated before my period, any tips?",
  "High-protein snacks without dairy?",
  "I want to build my glutes, how should I eat?",
];

/** How many messages are kept in localStorage ("food-chat"). */
export const CHAT_HISTORY_LIMIT = 40;
/** How many recent messages are sent to the backend with each question. */
export const CHAT_SEND_LIMIT = 12;
/** Mirrors the backend caps in main.py (MAX_USER_MESSAGE_CHARS / MAX_ASSISTANT_MESSAGE_CHARS / MAX_CONTEXT_CHARS). */
export const MAX_USER_CHARS = 1500;
const MAX_ASSISTANT_CHARS = 4000;
const MAX_CONTEXT_CHARS = 500;

/** Keeps the newest `limit` messages. */
export function trimHistory(messages: ChatMessage[], limit = CHAT_HISTORY_LIMIT): ChatMessage[] {
  return messages.length > limit ? messages.slice(-limit) : messages;
}

/**
 * The slice of the conversation sent to /api/food-chat: the newest `limit` messages,
 * starting with a user message and with each message clipped to the backend's length caps.
 */
export function recentForSend(messages: ChatMessage[], limit = CHAT_SEND_LIMIT): ChatMessage[] {
  const recent = messages.slice(-limit);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return (firstUser < 0 ? [] : recent.slice(firstUser)).map((m) => ({
    role: m.role,
    content: m.content.slice(0, m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS),
  }));
}

/** Context line for the coach: current cycle phase/day and the user's saved goal, if any. */
export function buildFoodContext(cycleInfo: CycleInfo | null, goal: string): string {
  const parts: string[] = [];
  if (cycleInfo) parts.push(`Currently in the ${cycleInfo.phase.label.toLowerCase()} phase, day ${cycleInfo.dayOfCycle} of a ${cycleInfo.cycleLength}-day cycle.`);
  if (goal.trim()) parts.push(`Main goal: ${goal.trim()}.`);
  return parts.join(" ").slice(0, MAX_CONTEXT_CHARS);
}

/** Removes markdown emphasis (**bold**, *italic*) and heading hashes; turns "* " bullets into "- ". */
export function stripEmphasis(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)\*(?![\w*])/g, "$1$2")
    .replace(/^(\s*)[*•]\s+/gm, "$1- ")
    .replace(/^#{1,6}\s*/gm, "")
    .trim();
}
