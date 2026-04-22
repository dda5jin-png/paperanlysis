"use client";
import { useState } from "react";

export function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-5 flex items-start justify-between gap-6 text-left"
      >
        <span className="text-[16px] sm:text-lg font-medium text-ink-900">{q}</span>
        <span className={`mt-1 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="pb-5 text-ink-700 leading-7">{a}</div>}
    </div>
  );
}
