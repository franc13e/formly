import { useState } from "react";
import { MAX_CYCLE_LENGTH, MIN_CYCLE_LENGTH, clampCycleLength } from "../lib/cycle";

interface CycleLengthInputProps {
  value: number;
  onChange: (days: number) => void;
}

/**
 * Number field for the average cycle length. Keeps the raw text while typing (so it can be
 * cleared), commits valid values immediately, and snaps to the supported range on blur.
 */
export function CycleLengthInput({ value, onChange }: CycleLengthInputProps) {
  const [text, setText] = useState(String(value || 28));

  return (
    <input
      className="input"
      type="number"
      inputMode="numeric"
      min={MIN_CYCLE_LENGTH}
      max={MAX_CYCLE_LENGTH}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number.parseInt(e.target.value, 10);
        if (n >= MIN_CYCLE_LENGTH && n <= MAX_CYCLE_LENGTH) onChange(n);
      }}
      onBlur={() => {
        const n = clampCycleLength(Number.parseInt(text, 10));
        setText(String(n));
        onChange(n);
      }}
    />
  );
}
