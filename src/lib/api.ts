import type { ChatMessage, RecipePhoto, RecipeRequest } from "../types";
import { parseRecipePhoto } from "./recipePhotos";

// ─── Backend helper ───────────────────────────────────────────────────────────
// Same-origin by default (Vercel serves the FastAPI app under /api); override with VITE_API_URL.
const API = import.meta.env.VITE_API_URL || "";

function errorDetail(body: unknown): unknown {
  return typeof body === "object" && body !== null && "detail" in body ? body.detail : undefined;
}

function resultField(body: unknown): unknown {
  return typeof body === "object" && body !== null && "result" in body ? body.result : undefined;
}

/**
 * POSTs a JSON `body` to an AI endpoint and returns the response's `result` string.
 * Throws an Error with a user-facing message on HTTP errors, timeouts (60s) and network failures.
 * `label` names the caller in console errors.
 */
async function postJson(endpoint: string, body: unknown, label: string): Promise<unknown> {
  let result: unknown;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err: unknown = await res.json().catch(()=>({}));
      const detail = errorDetail(err);
      throw new Error(detail ? String(detail) : `Server error ${res.status}`);
    }
    result = await res.json();
  } catch(e) {
    const name = e instanceof Error ? e.name : undefined;
    const message = e instanceof Error ? e.message : undefined;
    console.error(`${label} error:`, endpoint, message);
    if (name === "AbortError") throw new Error("Request timed out. Please try again.", { cause: e });
    throw new Error(message || "Request failed", { cause: e });
  } finally {
    // Also clear the timer when fetch / reading the body throws.
    clearTimeout(timeout);
  }
  return result;
}

async function postForResult(endpoint: string, body: unknown, label: string): Promise<string> {
  const result = resultField(await postJson(endpoint, body, label));
  // The callers only ever use the result as a string. A missing / non-string result
  // used to surface as a TypeError in the caller; keep it a TypeError here.
  if (typeof result !== "string") throw new TypeError(`Unexpected response from ${endpoint}: "result" is not a string`);
  return result;
}

/**
 * POSTs `{ prompt }` to an AI endpoint and returns the response's `result` string.
 * Throws an Error with a user-facing message on HTTP errors, timeouts (60s) and network failures.
 */
export function callAI(endpoint: string, prompt: string): Promise<string> {
  return postForResult(endpoint, { prompt }, "callAI");
}

/**
 * Sends the recent food-chat conversation (oldest first, ending with the user's message)
 * plus optional cycle/goal `context` to /api/food-chat and returns the coach's reply.
 * Errors are thrown like `callAI`'s.
 */
export function callFoodChat(messages: ChatMessage[], context?: string): Promise<string> {
  return postForResult("/api/food-chat", { messages: messages.map(({ role, content }) => ({ role, content })), context }, "callFoodChat");
}

/** Asks /api/recipe for a recipe; returns its plain-text reply (see `parseRecipe`). Errors are thrown like `callAI`'s. */
export function callRecipe(request: RecipeRequest): Promise<string> {
  return postForResult("/api/recipe", request, "callRecipe");
}

/**
 * Looks up a food photo for a recipe name via GET /api/recipe-photo (Pexels when the server has a key,
 * otherwise Openverse). Resolves null when there is no photo; throws on HTTP errors, timeouts (15s) and network failures.
 */
export async function getRecipePhoto(name: string): Promise<RecipePhoto | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API}/api/recipe-photo?q=${encodeURIComponent(name.trim().slice(0, 120))}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return parseRecipePhoto(await res.json());
  } finally {
    clearTimeout(timeout);
  }
}

/** Asks /api/form-tips for form tips for a workout; returns its plain-text reply (see `parseFormTips`). Errors are thrown like `callAI`'s. */
export function callFormTips(name: string, muscle?: string): Promise<string> {
  return postForResult("/api/form-tips", { name: name.trim().slice(0, 80), muscle: muscle?.trim().slice(0, 40) || undefined }, "callFormTips");
}

/** The training coach chat (/api/coach-chat); same shape and errors as `callFoodChat`. */
export function callCoachChat(messages: ChatMessage[], context?: string): Promise<string> {
  return postForResult("/api/coach-chat", { messages: messages.map(({ role, content }) => ({ role, content })), context }, "callCoachChat");
}

/** Asks /api/plan-week for a 7-day plan; returns the cleaned plan (ids are library workout ids). */
export async function callPlanWeek(request: unknown): Promise<{ summary: string; days: { date: string; ids: number[]; note: string }[] }> {
  const body = await postJson("/api/plan-week", request, "callPlanWeek");
  const plan = typeof body === "object" && body !== null && "plan" in body ? (body as { plan: unknown }).plan : null;
  if (!plan || typeof plan !== "object" || !Array.isArray((plan as { days?: unknown }).days)) throw new Error("The coach sent back something unexpected. Try again.");
  return plan as { summary: string; days: { date: string; ids: number[]; note: string }[] };
}
