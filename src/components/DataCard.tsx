import { useRef, useState } from "react";
import { Download, FileText, RotateCcw, Trash2 } from "lucide-react";
import { C } from "../theme";
import { load } from "../lib/storage";
import { localDateKey } from "../lib/date";
import { buildReport } from "../lib/report";
import { applySnapshot, isAppKey, isSnapshot, takeSnapshot } from "../lib/sync";
import { useAuth } from "../auth/AuthContext";
import { useAppearance } from "../hooks/useAppearance";
import type { MeasurementSnapshot, PeriodEntry, ShowToast, WorkoutLogEntry } from "../types";

const CONFIRM_WORD = "DELETE";

function readReportInput() {
  return {
    userName: load<string>("user-name", ""),
    periodHistory: load<PeriodEntry[]>("period-history", []),
    periodStart: load<string>("period-start", ""),
    cycleLengthSetting: load<number>("cycle-length", 28),
    periodLengthSetting: load<number>("period-length", 5),
    workoutLog: load<WorkoutLogEntry[]>("workout-log", []),
    measurementHistory: load<MeasurementSnapshot[]>("measurement-history", []),
  };
}

const rowBtn = { width: "100%", justifyContent: "flex-start", gap: 12, padding: "13px 16px", borderRadius: 0, background: "transparent", border: "none", color: C.text, fontSize: 14, fontWeight: 600 } as const;

/** Profile → Your data: PDF report, backup file, restore, and a delete that needs typing to confirm. */
export function DataCard({ showToast }: { showToast: ShowToast }) {
  const auth = useAuth();
  const { palette } = useAppearance();
  const [busy, setBusy] = useState<"report" | "restore" | "delete" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [restoreFile, setRestoreFile] = useState<{ name: string; data: Record<string, string> } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const synced = auth.mode === "account";
  const today = localDateKey();

  const downloadReport = async () => {
    setBusy("report");
    try {
      const { reportPdf, deliverFile } = await import("../lib/reportPdf");
      const blob = await reportPdf(buildReport(readReportInput(), today), palette);
      await deliverFile(blob, `formly-report-${today}.pdf`);
    } catch (e) {
      console.error(e);
      showToast("Couldn't make the report. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const downloadBackup = async () => {
    const { deliverFile } = await import("../lib/reportPdf");
    const body = JSON.stringify({ app: "formly", version: 1, exported: new Date().toISOString(), data: takeSnapshot(localStorage) }, null, 2);
    await deliverFile(new Blob([body], { type: "application/json" }), `formly-backup-${today}.json`);
  };

  const pickRestore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const data = parsed && typeof parsed === "object" && "data" in parsed ? (parsed as { data: unknown }).data : null;
      if (!isSnapshot(data) || !Object.keys(data).some(isAppKey)) throw new Error("not a Formly backup");
      setRestoreFile({ name: file.name, data });
    } catch {
      showToast("That file isn't a Formly backup.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const restore = async () => {
    if (!restoreFile) return;
    setBusy("restore");
    try {
      applySnapshot(localStorage, restoreFile.data);
      await auth.saveToCloud();
      window.location.reload();
    } catch (e) {
      console.error(e);
      showToast("Restored on this device, but couldn't sync it to your account yet.");
      setBusy(null);
    }
  };

  const deleteAll = async () => {
    setBusy("delete");
    try {
      await auth.deleteCloudData();
      localStorage.clear();
      window.location.reload();
    } catch {
      showToast("Couldn't delete your account data. Try again.");
      setBusy(null);
    }
  };

  const counts = (() => {
    const i = readReportInput();
    return [
      [i.periodHistory.length, "period", "periods"],
      [i.workoutLog.length, "workout", "workouts"],
      [i.measurementHistory.length, "measurement day", "measurement days"],
    ].filter(([n]) => (n as number) > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  })();

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button className="btn" style={rowBtn} onClick={() => void downloadReport()} disabled={busy === "report"}>
          <FileText size={18} color={C.accentInk} aria-hidden="true"/>
          <span style={{ flex: 1, textAlign: "left" }}>
            <span style={{ display: "block" }}>{busy === "report" ? "Making your report…" : "Download report (PDF)"}</span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.textSoft, marginTop: 2 }}>Your cycle, workouts and measurements, ready to keep or share with a doctor</span>
          </span>
        </button>
        <button className="btn" style={{ ...rowBtn, borderTop: `1px solid ${C.border}` }} onClick={() => void downloadBackup()}>
          <Download size={18} color={C.accentInk} aria-hidden="true"/>
          <span style={{ flex: 1, textAlign: "left" }}>
            <span style={{ display: "block" }}>Download backup</span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.textSoft, marginTop: 2 }}>Everything you've logged, in one file you can restore later</span>
          </span>
        </button>
        <button className="btn" style={{ ...rowBtn, borderTop: `1px solid ${C.border}` }} onClick={() => fileInput.current?.click()}>
          <RotateCcw size={18} color={C.accentInk} aria-hidden="true"/>
          <span style={{ flex: 1, textAlign: "left" }}>Restore from backup</span>
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={e => void pickRestore(e.target.files?.[0])}/>
      </div>

      <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, color: C.danger, borderColor: C.roseDeep }} onClick={() => { setTyped(""); setConfirmOpen(true); }}>
        <Trash2 size={15} aria-hidden="true"/> Delete all my data
      </button>

      {restoreFile && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && busy !== "restore" && setRestoreFile(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="restore-title">
            <div className="modal-handle"/>
            <h2 id="restore-title" className="modal-title" style={{ marginBottom: 10 }}>Restore this backup?</h2>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 18 }}>
              Everything in Formly{synced ? " on this device and in your account" : ""} will be replaced with <b style={{ color: C.text }}>{restoreFile.name}</b>. Anything you've logged since that backup will be lost.
            </p>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setRestoreFile(null)} disabled={busy === "restore"}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => void restore()} disabled={busy === "restore"}>{busy === "restore" ? "Restoring…" : "Restore"}</button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && busy !== "delete" && setConfirmOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-handle"/>
            <h2 id="delete-title" className="modal-title" style={{ marginBottom: 10 }}>Delete everything?</h2>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>
              This permanently deletes all your Formly data{synced ? " from this device and your account" : " on this device"}
              {counts.length ? `: ${counts.join(", ")}, plus your plans, recipes and settings.` : ", including your plans, recipes and settings."} You can't undo this.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => void downloadBackup()}>
              <Download size={15} aria-hidden="true"/> Download a backup first
            </button>
            <label className="label" htmlFor="delete-confirm">Type {CONFIRM_WORD} to confirm</label>
            <input id="delete-confirm" className="input" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} style={{ marginBottom: 16 }}/>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmOpen(false)} disabled={busy === "delete"}>Keep my data</button>
              <button className="btn" style={{ flex: 1, padding: "12px 16px", fontSize: 14, background: C.danger, color: C.card, opacity: typed.trim().toUpperCase() === CONFIRM_WORD ? 1 : 0.4 }}
                disabled={typed.trim().toUpperCase() !== CONFIRM_WORD || busy === "delete"} onClick={() => void deleteAll()}>
                {busy === "delete" ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
