import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { C, CSS } from "../theme";

interface AuthScreenProps {
  client: SupabaseClient;
  onContinueAsGuest: () => void;
}

type Mode = "sign-in" | "sign-up";

export function AuthScreen({ client, onContinueAsGuest }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async () => {
    setError("");
    setNotice("");
    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error: err } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (err) setError(err.message);
        // On success the auth listener in AuthGate takes over.
      } else {
        const { data, error: err } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) setError(err.message);
        else if (!data.session) {
          setNotice("Check your inbox to confirm your email, then sign in here.");
          setMode("sign-in");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="scroll" style={{ padding: "48px 24px 40px", maxWidth: 420, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌸</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </div>
          <div style={{ fontSize: 14, color: C.textSoft, fontWeight: 500, margin: "6px 0 24px", lineHeight: 1.6 }}>
            Sign in to keep your workouts, measurements and cycle data in sync across your devices.
          </div>

          <form
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <div>
              <label className="label" htmlFor="auth-email">Email</label>
              <input id="auth-email" className="input" type="email" autoComplete="email"
                placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="auth-password">Password</label>
              <input id="auth-password" className="input" type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div role="alert" style={{ fontSize: 13, color: "#C05070", fontWeight: 600 }}>{error}</div>}
            {notice && <div role="status" style={{ fontSize: 13, color: "#3A7A50", fontWeight: 600 }}>{notice}</div>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 12 }}
            onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); setNotice(""); }}>
            {mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8, color: C.textSoft }} onClick={onContinueAsGuest}>
            Continue without an account
          </button>
          <div style={{ fontSize: 12, color: C.textSoft, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            Without an account, your data stays in this browser only.
          </div>
        </div>
      </div>
    </>
  );
}
