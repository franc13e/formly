import type { Report } from "./report";
import { reportDate } from "./report";
import { themeTokens, type PaletteId } from "./appearance";

// ─── Draws the report as an A4 PDF (jsPDF is loaded only when someone asks for it) ──

/** The built-in PDF font only covers Latin-1, so drop emoji and other characters it can't draw. */
export function pdfText(s: string): string {
  return s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2014/g, "-")
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2022]/g, "").replace(/\s{2,}/g, " ").trim();
}

const hexRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export async function reportPdf(r: Report, palette: PaletteId): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const t = themeTokens(palette, false);
  const ACCENT = hexRgb(t.accentInk), SOFT = hexRgb(t.petal), INK = hexRgb(t.text), MID = hexRgb(t.textSoft), LINE = hexRgb(t.border);
  const W = 210, H = 297, M = 18, CW = W - M * 2;
  let y = 0;

  const color = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (size: number, style: "normal" | "bold" = "normal") => { doc.setFont("helvetica", style); doc.setFontSize(size); };
  const ensure = (h: number) => { if (y + h > H - 20) { doc.addPage(); y = M; } };

  const heading = (text: string) => {
    ensure(16);
    y += 4;
    font(13, "bold"); color(ACCENT); doc.text(text, M, y);
    y += 2.5;
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4); doc.line(M, y, W - M, y);
    y += 6;
  };

  const note = (text: string) => {
    font(9.5); color(MID);
    const lines = doc.splitTextToSize(pdfText(text), CW) as string[];
    ensure(lines.length * 4.6);
    doc.text(lines, M, y);
    y += lines.length * 4.6 + 1.5;
  };

  /** A row of stat boxes: big number, small label. */
  const stats = (items: { value: string; label: string }[]) => {
    ensure(22);
    const gap = 4, w = (CW - gap * (items.length - 1)) / items.length;
    items.forEach((s, i) => {
      const x = M + i * (w + gap);
      doc.setFillColor(...SOFT); doc.roundedRect(x, y, w, 18, 3, 3, "F");
      font(15, "bold"); color(INK); doc.text(pdfText(s.value), x + 4, y + 8.5);
      font(8.5); color(MID); doc.text(doc.splitTextToSize(pdfText(s.label), w - 8) as string[], x + 4, y + 13.5);
    });
    y += 23;
  };

  /** A simple table; widths are fractions of the content width. */
  const table = (head: string[], rows: string[][], widths: number[]) => {
    let left = M;
    const xs = widths.map(w => { const x = left; left += w * CW; return x; });
    const drawHead = () => {
      doc.setFillColor(...SOFT); doc.rect(M, y - 4.2, CW, 6.4, "F");
      font(8.5, "bold"); color(INK);
      head.forEach((h, i) => doc.text(h, xs[i] + 1.5, y));
      y += 6;
    };
    ensure(14); drawHead();
    font(9);
    rows.forEach((row, ri) => {
      const cells = row.map((c, i) => doc.splitTextToSize(pdfText(c) || "-", widths[i] * CW - 3) as string[]);
      const h = Math.max(...cells.map(c => c.length)) * 4.2 + 1.8;
      if (y + h > H - 20) { doc.addPage(); y = M + 4; drawHead(); font(9); }
      if (ri % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(M, y - 3.6, CW, h, "F"); }
      color(INK);
      cells.forEach((c, i) => doc.text(c, xs[i] + 1.5, y));
      y += h;
    });
    y += 3;
  };

  // ── Cover band ──
  doc.setFillColor(...SOFT); doc.rect(0, 0, W, 38, "F");
  font(24, "bold"); color(ACCENT); doc.text("Formly", M, 17);
  font(12); color(INK); doc.text(pdfText(r.name ? `Health report for ${r.name}` : "Your health report"), M, 25);
  font(9); color(MID); doc.text(`Created ${reportDate(r.generated)}`, M, 31);
  y = 48;

  // ── Cycle ──
  heading("Your cycle");
  if (!r.cycle.tracked) {
    note("No periods logged yet. Log your period in Formly to see your cycle here.");
  } else {
    stats([
      { value: `${r.cycle.averageCycle} days`, label: r.cycle.cyclesLogged ? `average cycle (last ${r.cycle.cyclesLogged})` : "cycle length (your setting)" },
      { value: `${r.cycle.averagePeriod} days`, label: r.cycle.periodsLogged ? "average period" : "period length (your setting)" },
      { value: r.cycle.shortest !== null ? `${r.cycle.shortest}-${r.cycle.longest}` : "-", label: "shortest to longest cycle (days)" },
      { value: r.cycle.nextPeriod ? reportDate(r.cycle.nextPeriod).replace(/ \d{4}$/, "") : "-", label: "next period expected" },
    ]);
    table(["Period started", "Ended", "Period length", "Cycle length"],
      r.cycle.periods.map(p => [reportDate(p.start), p.end ? reportDate(p.end) : "-", p.days ? `${p.days} days` : "-", p.cycleDays ? `${p.cycleDays} days` : "current"]),
      [0.3, 0.3, 0.2, 0.2]);
  }

  // ── Workouts ──
  heading("Workouts");
  if (!r.workouts.total) {
    note("No workouts logged yet.");
  } else {
    stats([
      { value: String(r.workouts.last30), label: "workouts in the last 30 days" },
      { value: String(r.workouts.activeDays30), label: "active days in the last 30 days" },
      { value: String(r.workouts.perWeek90), label: "workouts a week (90-day average)" },
      { value: String(r.workouts.total), label: "workouts logged in total" },
    ]);
    const k = r.workouts.kinds;
    note(`Last 90 days: ${k.strength} strength, ${k.cardio} cardio, ${k.recovery} yoga, stretching and recovery.`
      + (r.workouts.groups.length ? ` Muscle groups: ${r.workouts.groups.map(g => `${g.group} ${g.count}`).join(", ")}.` : ""));
    y += 2;
    table(["Date", "Workout", "Details"], r.workouts.recent.map(e => [reportDate(e.date), e.name, e.detail]), [0.22, 0.38, 0.4]);
  }

  // ── Body ──
  heading("Body measurements");
  if (!r.body.length) {
    note("No measurements logged yet.");
  } else {
    table(["Measurement", "First", "Latest", "Change", "Since"],
      r.body.map(b => [b.label, `${b.first} ${b.unit}`, `${b.latest} ${b.unit}`, `${b.change > 0 ? "+" : ""}${b.change} ${b.unit}`, `${reportDate(b.since)} (${b.entries} logged)`]),
      [0.2, 0.17, 0.17, 0.16, 0.3]);
  }

  ensure(14);
  y += 2;
  note("Made with Formly from the data you logged in the app. Predictions are estimates, and this report is not medical advice. Share it with a doctor if you have any concerns about your cycle or health.");

  // ── Footer on every page ──
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    font(8); color(MID);
    doc.text("Formly report", M, H - 10);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 10, { align: "right" });
  }
  return doc.output("blob");
}

/** Offers a file to the user: the share sheet on phones that support it, else a download. */
export async function deliverFile(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type });
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // the user closed the sheet
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
