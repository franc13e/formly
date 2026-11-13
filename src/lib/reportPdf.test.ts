import { describe, expect, it } from "vitest";
import { pdfText } from "./reportPdf";

describe("pdfText", () => {
  it("keeps Latin text and drops what the PDF font can't draw", () => {
    expect(pdfText("Hip Thrust 💪 · 3 sets × 10")).toBe("Hip Thrust · 3 sets × 10");
    expect(pdfText("Zoë’s “easy” run — 5 km")).toBe(`Zoë's "easy" run - 5 km`);
    expect(pdfText("🧘")).toBe("");
  });
});
