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
async function postForResult(endpoint: string, body: unknown, label: string): Promise<string> {
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
    result = resultField(await res.json());
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
