"use client";

import type { ViewMode } from "@/app/types";

type NavProps = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
};

export default function Nav({ view, onViewChange }: NavProps) {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between border-b-[0.5px] border-[var(--border-m)] bg-[var(--bg)] px-7 py-3.5 max-[480px]:px-4 max-[480px]:py-3">
      <div className="flex items-center gap-2 font-sans text-[17px] font-bold tracking-[-0.02em] text-[var(--black)]">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8Z" fill="var(--indigo)" />
        </svg>
        bruinboard
      </div>
      <div className="flex gap-1.5">
        {(["list", "calendar"] as const).map((mode) => {
          const active = view === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              className={[
                "rounded-[3px] border-[0.5px] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                active
                  ? "border-[var(--black)] bg-[var(--black)] text-white"
                  : "border-dashed border-[var(--border-m)] bg-transparent text-[var(--muted)] hover:border-[var(--black)] hover:text-[var(--black)]",
              ].join(" ")}
              aria-pressed={active}
            >
              {mode === "list" ? "List" : "Calendar"}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
