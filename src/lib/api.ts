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
 * POSTs `{ prompt }` to an AI endpoint and returns the response's `result` string.
 * Throws an Error with a user-facing message on HTTP errors, timeouts (60s) and network failures.
 */
export async function callAI(endpoint: string, prompt: string): Promise<string> {
  let result: unknown;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ prompt }),
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
    console.error("callAI error:", endpoint, message);
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
