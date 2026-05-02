"use client";

import { useEffect, useState } from "react";

const STAR_PATH = "M22 2L24.6 19.4L42 22L24.6 24.6L22 42L19.4 24.6L2 22L19.4 19.4Z";
const COLORS = ["var(--indigo)", "var(--pink)", "var(--yellow)"];

export function LoadingState() {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setColorIndex((current) => (current + 1) % COLORS.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <svg className="animate-[star-pulse_1.4s_ease-in-out_infinite]" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <path d={STAR_PATH} fill={COLORS[colorIndex]} />
      </svg>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--gray)]">
        Fetching events...
      </div>
    </div>
  );
}

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <path
          d="M20 2L22.4 17.6L38 20L22.4 22.4L20 38L17.6 22.4L2 20L17.6 17.6Z"
          stroke="var(--muted)"
          strokeWidth="1"
          strokeDasharray="3 2"
          fill="none"
        />
        <circle cx="20" cy="20" r="2.5" fill="var(--muted)" />
      </svg>
      <div className="font-sans text-sm font-bold tracking-[-0.01em] text-[var(--black)]">No events found</div>
      <button
        type="button"
        onClick={onClear}
        className="rounded border-[0.5px] border-[var(--border-m)] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--gray)] hover:border-[var(--black)] hover:text-[var(--black)]"
      >
        Clear filters
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
        <rect x="2" y="8" width="28" height="3" fill="var(--indigo)" />
        <rect x="10" y="17" width="30" height="3" fill="var(--pink)" opacity="0.8" />
        <rect x="4" y="26" width="22" height="3" fill="var(--yellow)" />
      </svg>
      <div className="font-sans text-sm font-bold tracking-[-0.01em] text-[var(--black)]">Something went wrong</div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded border-[0.5px] border-[var(--border-m)] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--gray)] hover:border-[var(--black)] hover:text-[var(--black)]"
      >
        Retry
      </button>
    </div>
  );
}
