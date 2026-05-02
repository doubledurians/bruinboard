"use client";

import { useState } from "react";

import type { EventRow } from "@/app/types";

type ShareButtonProps = {
  event: EventRow;
};

export default function ShareButton({ event }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: event.description ?? event.title,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={share}
        className="rounded-md border-[0.5px] border-[var(--border-m)] bg-transparent px-3.5 py-[9px] font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--gray)] transition-colors hover:border-[var(--black)] hover:text-[var(--black)]"
      >
        Share ↑
      </button>
      <span
        className={[
          "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded border-[0.5px] border-[var(--border-m)] bg-[var(--black)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.07em] text-white transition-opacity",
          copied ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        Link copied
      </span>
    </span>
  );
}
