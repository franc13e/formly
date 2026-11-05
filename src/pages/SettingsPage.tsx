import { useState, type ReactNode } from "react";
import { C } from "../theme";
import { save } from "../lib/storage";
import { useAuth } from "../auth/AuthContext";
import { Glyph } from "../components/Glyph";
import type { Setter, ShowToast } from "../types";

interface CycleSummary {
  /** Cycle length used for predictions, and how many logged cycles it comes from (0 = setting). */
  length: number;
  cyclesLogged: number;
  periodLength: number;
  periodsLogged: number;
}

interface SettingsPageProps {
  userName: string;
  setUserName: Setter<string>;
  showToast: ShowToast;
  /** Omitted until cycle tracking is set up. */
  cycle?: CycleSummary | null;
  /** Opens the Body tab, where the cycle settings live. */
  onOpenCycle?: () => void;
}

const FEATURES = [
  { emoji: "🌙", title: "Your cycle, understood", desc: "A cycle ring and calendar that learn your real cycle and period length." },
  { emoji: "🥗", title: "Food for your phase", desc: "What to eat now, plus recipes with photos and how-to videos." },
  { emoji: "💭", title: "Ask anything", desc: "A food coach for cravings, bloating, snacks and goals." },
  { emoji: "🏋️", title: "Workouts that fit", desc: "Week and month plans, your own workouts, a history calendar." },
  { emoji: "📏", title: "Body tracking", desc: "Weight and measurements over time, in context." },
  { emoji: "✨", title: "AI coach", desc: "Plans shaped by your phase, goal and routine." },
];

const PRINCIPLES = [
  { title: "Awareness over numbers", desc: "A heavier week in your luteal phase is water and hormones, not failure." },
  { title: "Work with your cycle", desc: "Push when your energy rises, ease off when your body asks for rest." },
  { title: "Gentle, not perfect", desc: "Every logged day helps Formly learn you. Missing one is fine." },
];

/** A small all-caps label above a group of cards, like a settings screen. */
function Section({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <div className="row-between" style={{ padding: "0 4px", marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.textSoft }}>{label}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SettingsPage({ userName, setUserName, showToast, cycle, onOpenCycle }: SettingsPageProps) {
  const [localName, setLocalName] = useState(userName || "");
  const auth = useAuth();
  const initial = (userName || "F").trim().slice(0, 1).toUpperCase();
  const status = auth.mode === "account" ? `Signed in as ${auth.email}` : auth.mode === "guest" ? "Using Formly without an account" : "Using Formly on this device";
  const synced = auth.mode === "account";
  const privacy = [
    { emoji: "📅", title: synced ? "Stored on this device and in your account" : "Stored on this device", desc: synced
      ? "Your logs live in this browser and sync to your account, where only you can read them."
      : "Your periods, workouts, food chats and measurements stay in this browser." },
    { emoji: "✨", title: "AI features", desc: "When you ask the food coach, make a recipe or get a plan, your question and the context it needs (like your phase and goal) are sent to our AI service to write the answer." },
    { emoji: "🥗", title: "Recipe photos", desc: "Recipe names are sent to Openverse to find openly licensed photos. Nothing about you is included." },
  ];

  return (
    <div className="scroll" style={{ padding: "32px 20px 40px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6, marginBottom: 26 }}>
        <span style={{ width: 76, height: 76, borderRadius: "50%", background: C.petal, color: C.text, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, boxShadow: `0 0 0 6px ${C.white}, 0 10px 24px ${C.shadow}` }}>{initial}</span>
        <div className="h-display" style={{ fontSize: 30, color: C.text, lineHeight: 1.1, marginTop: 10 }}>{userName || "Your profile"}</div>
        <div style={{ fontSize: 13, color: C.textSoft, overflowWrap: "anywhere" }}>{status}</div>
      </div>

      <Section label="You">
        <div className="card">
          <label className="label" htmlFor="display-name">Display name</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input id="display-name" className="input" placeholder="e.g. Sofia" value={localName} onChange={e => setLocalName(e.target.value)} />
            <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => { setUserName(localName); save("user-name", localName); showToast("Name saved"); }}>Save</button>
          </div>
        </div>
      </Section>

      <Section label="Your cycle" action={onOpenCycle && <button className="btn btn-ghost btn-sm" onClick={onOpenCycle}>{cycle ? "Edit" : "Set up"}</button>}>
        <div className="card">
          {cycle ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
              {[
                { label: "Cycle length", value: cycle.length, note: cycle.cyclesLogged > 1 ? `from your last ${cycle.cyclesLogged} cycles` : cycle.cyclesLogged === 1 ? "from your last cycle" : "your setting" },
                { label: "Period length", value: cycle.periodLength, note: cycle.periodsLogged > 1 ? `from ${cycle.periodsLogged} logged periods` : cycle.periodsLogged === 1 ? "from your last period" : "your setting" },
              ].map(s => (
                <div key={s.label} style={{ background: C.bgDeep, borderRadius: 16, padding: "14px" }}>
                  <div style={{ fontSize: 12, color: C.textSoft }}>{s.label}</div>
                  <div style={{ marginTop: 4 }}><span className="h-display" style={{ fontSize: 30, color: C.text }}>{s.value}</span> <span style={{ fontSize: 13, color: C.textMid }}>days</span></div>
                  <div style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>Log your last period to get phase-aware workouts, food and predictions.</div>
          )}
        </div>
      </Section>

      {auth.mode !== "local" && (
        <Section label="Account">
          <div className="card">
            {synced ? (
              <>
                <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>Your data syncs automatically across your devices.</div>
                <button className="btn btn-ghost btn-sm" onClick={() => { void auth.signOut(); }}>Sign out</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>Your data only lives in this browser. Create an account to back it up and sync it across devices; everything you've logged comes with you.</div>
                <button className="btn btn-primary btn-sm" onClick={auth.startSignIn}>Sign in or create account</button>
              </>
            )}
          </div>
        </Section>
      )}

      <Section label="About Formly">
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "26px 20px" }}>
          <img src="/favicon.svg" alt="Formly logo" width={76} height={76} style={{ borderRadius: 20 }} />
          <div className="h-display" style={{ fontSize: 30, color: C.text, lineHeight: 1 }}>Formly</div>
          <div style={{ fontSize: 13, color: C.accentInk, fontWeight: 600 }}>Fitness that follows your cycle</div>
          <p style={{ margin: 0, fontSize: 13.5, color: C.textMid, lineHeight: 1.7, maxWidth: "34ch" }}>
            Workouts, food and body tracking that adapt to the four phases of your cycle, and learn your rhythm the more you log.
          </p>
        </div>
      </Section>

      <Section label="What Formly does">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <Glyph emoji={f.emoji} size={17} />
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text, lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Our approach">
        <div className="card" style={{ background: C.rose, boxShadow: "none" }}>
          <p className="h-display" style={{ margin: "0 0 14px", fontSize: 22, lineHeight: 1.3, color: C.text }}>
            Your body isn't the same every week, so your plan shouldn't be either.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <span className="h-display" style={{ fontSize: 20, color: C.accentInk, lineHeight: 1.1, width: 18, flexShrink: 0 }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.55, marginTop: 1 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section label="Data and privacy">
        <div className="card" style={{ padding: 0 }}>
          {privacy.map((p, i) => (
            <div key={p.title} className="row" style={{ gap: 12, alignItems: "flex-start", padding: "14px 16px", borderTop: i ? `1px solid ${C.border}` : "none" }}>
              <Glyph emoji={p.emoji} size={15} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.title}</div>
                <div style={{ fontSize: 12.5, color: C.textSoft, lineHeight: 1.55, marginTop: 2 }}>{p.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "4px 16px 16px" }}>
            <button className="btn btn-ghost btn-sm" style={{ color: C.accentInk, borderColor: C.roseDeep }} onClick={() => {
              const msg = synced ? "Delete all your data from this device and your account? This cannot be undone." : "Clear all app data? This cannot be undone.";
              if (!window.confirm(msg)) return;
              void auth.deleteCloudData().then(() => { localStorage.clear(); window.location.reload(); }, () => showToast("Couldn't delete cloud data. Try again."));
            }}>Clear all data</button>
          </div>
        </div>
      </Section>

      <div style={{ textAlign: "center", fontSize: 12, color: C.textSoft }}>Formly · not medical advice; see a doctor for health concerns</div>
    </div>
  );
}
