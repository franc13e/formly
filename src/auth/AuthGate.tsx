import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { CSS, C } from "../theme";
import { getSupabase } from "../lib/supabase";
import { clearAppData, deleteRemoteState, pullOrSeed, startAutoSync } from "../lib/sync";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { AuthScreen } from "./AuthScreen";

/** Set when the visitor chooses "Continue without an account" (internal key, never synced). */
const GUEST_KEY = "formly:guest";

type GateState =
  | { status: "loading" }
  | { status: "local" }
  | { status: "signed-out"; client: SupabaseClient }
  | { status: "guest"; client: SupabaseClient }
  | { status: "syncing"; client: SupabaseClient }
  | { status: "signed-in"; client: SupabaseClient; user: User }
  | { status: "error"; client: SupabaseClient; message: string };

function isGuest(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

function setGuest(on: boolean): void {
  try {
    if (on) localStorage.setItem(GUEST_KEY, "1");
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/**
 * Wraps the app with optional Supabase accounts. Without Supabase configured the
 * app renders exactly as before (local-only).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ status: "loading" });
  const statusRef = useRef<GateState["status"]>("loading");
  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

  const enterAccount = useCallback(async (client: SupabaseClient, user: User) => {
    setState({ status: "syncing", client });
    try {
      await pullOrSeed(client, user.id);
      setGuest(false);
      setState({ status: "signed-in", client, user });
    } catch (error) {
      setState({ status: "error", client, message: errorMessage(error) });
    }
  }, []);

  // Resolve config + existing session once, then follow sign-in events.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const client = await getSupabase();
      if (cancelled) return;
      if (!client) {
        setState({ status: "local" });
        return;
      }
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      if (data.session) await enterAccount(client, data.session.user);
      else setState(isGuest() ? { status: "guest", client } : { status: "signed-out", client });

      // Fires after the sign-in form succeeds (and on email-confirmation redirects).
      const { data: sub } = client.auth.onAuthStateChange((event, session) => {
        const waitingForSignIn = ["signed-out", "guest", "error"].includes(statusRef.current);
        if (event === "SIGNED_IN" && session && waitingForSignIn) void enterAccount(client, session.user);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [enterAccount]);

  // Keep the cloud copy up to date while signed in.
  useEffect(() => {
    if (state.status !== "signed-in") return;
    return startAutoSync(state.client, state.user.id, (error) => console.error("Sync failed:", error));
  }, [state]);

  const auth = useMemo<AuthContextValue>(() => {
    const client = "client" in state ? state.client : null;
    return {
      mode: state.status === "signed-in" ? "account" : state.status === "local" ? "local" : "guest",
      email: state.status === "signed-in" ? state.user.email ?? null : null,
      startSignIn: () => {
        if (client) setState({ status: "signed-out", client });
      },
      signOut: async () => {
        if (!client) return;
        await client.auth.signOut();
        clearAppData(localStorage);
        setGuest(false);
        window.location.reload();
      },
      deleteCloudData: async () => {
        if (state.status === "signed-in") await deleteRemoteState(state.client, state.user.id);
      },
    };
  }, [state]);

  switch (state.status) {
    case "loading":
    case "syncing":
      return <Splash text={state.status === "syncing" ? "Syncing your data…" : "Loading…"} />;
    case "signed-out":
      return (
        <AuthScreen
          client={state.client}
          onContinueAsGuest={() => {
            setGuest(true);
            setState({ status: "guest", client: state.client });
          }}
        />
      );
    case "error":
      return (
        <Splash text={`Couldn't sync your data: ${state.message}`}>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            Try again
          </button>
          <button className="btn btn-ghost" style={{ marginTop: 8 }}
            onClick={() => { setGuest(true); setState({ status: "guest", client: state.client }); }}>
            Continue offline
          </button>
        </Splash>
      );
    default:
      return (
        <AuthContext.Provider value={auth}>
          {/* Remount when the account changes so the app re-reads the synced data. */}
          <div key={state.status === "signed-in" ? state.user.id : "local"} style={{ display: "contents" }}>
            {children}
          </div>
        </AuthContext.Provider>
      );
  }
}

function Splash({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🌸</div>
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: C.textMid }}>{text}</div>
          {children}
        </div>
      </div>
    </>
  );
}
