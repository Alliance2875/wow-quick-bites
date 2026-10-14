"use client";

import { useRef, useState } from "react";
import { fill } from "@/lib/format";

/**
 * Six one-digit boxes separated by dashes (design "Verify Your Account").
 * Typing moves forward, Backspace moves back, pasting a full code fills every box.
 * The joined value is submitted as `name`.
 */
export default function CodeInput({ name, label, digitLabel }: { name: string; label: string; digitLabel: string }) {
  const [digits, setDigits] = useState<string[]>(() => Array(6).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number) => boxes.current[Math.max(0, Math.min(5, index))]?.focus();

  const fillFrom = (index: number, value: string) => {
    const incoming = value.replace(/\D/g, "").slice(0, 6 - index).split("");
    if (!incoming.length) return;
    setDigits((current) => current.map((digit, i) => (i >= index && i < index + incoming.length ? incoming[i - index] : digit)));
    focus(index + incoming.length);
  };

  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <input type="hidden" name={name} value={digits.join("")} />
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {digits.map((digit, i) => (
          <span key={i} className="contents">
            {i > 0 && (
              <span aria-hidden="true" className="text-foreground">
                -
              </span>
            )}
            <input
              ref={(el) => {
                boxes.current[i] = el;
              }}
              value={digit}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={fill(digitLabel, { n: i + 1 })}
              autoFocus={i === 0}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                // Autofill / typing over a filled box can bring several digits at once
                if (value.length > 1) return fillFrom(i, value);
                setDigits((current) => current.map((d, j) => (j === i ? value : d)));
                if (value) focus(i + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit) focus(i - 1);
                if (e.key === "ArrowLeft") focus(i - 1);
                if (e.key === "ArrowRight") focus(i + 1);
              }}
              onPaste={(e) => {
                e.preventDefault();
                fillFrom(i, e.clipboardData.getData("text"));
              }}
              onFocus={(e) => e.target.select()}
              className="h-14 w-10 rounded-lg border border-primary/60 bg-transparent text-center text-xl font-bold tabular-nums outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 sm:h-16 sm:w-11"
            />
          </span>
        ))}
      </div>
    </fieldset>
  );
}
