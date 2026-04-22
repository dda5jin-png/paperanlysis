import { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-brand-700">
      <span className="h-px w-6 bg-brand-700" />
      {children}
    </div>
  );
}
