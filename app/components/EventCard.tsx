"use client";

import { CATEGORY_LABELS, SOURCE_LABELS, categoryColor, type EventRow } from "@/app/types";

type EventCardProps = {
  event: EventRow;
  onClick: (event: EventRow) => void;
};

function formatTimeRange(event: EventRow): string {
  const start = new Date(event.start_datetime);
  const end = event.end_datetime ? new Date(event.end_datetime) : null;
  const format = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (!end) {
    return format.format(start);
  }
  return `${format.format(start)} - ${format.format(end)}`;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const start = new Date(event.start_datetime);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(start);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(start);
  const color = categoryColor(event.category);
  const categoryLabel = event.category ? CATEGORY_LABELS[event.category] : "Event";
  const sourceLabel = event.source ? SOURCE_LABELS[event.source] : "Source";

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="mb-2 flex w-full cursor-pointer overflow-hidden rounded-lg border-[0.5px] border-[var(--border-m)] bg-[var(--card)] text-left transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-[var(--black)] hover:shadow-[2px_2px_0_var(--black)]"
    >
      <span className="w-1 shrink-0" style={{ background: color }} aria-hidden="true" />
      <span className="flex w-[58px] shrink-0 flex-col items-center justify-center border-r-[0.5px] border-[var(--border)] py-3.5 max-[480px]:w-[52px]">
        <span className="font-mono text-[26px] font-bold leading-none text-[var(--black)]">
          {day}
        </span>
        <span className="mt-[3px] font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--muted)]">
          {month}
        </span>
      </span>
      <span className="min-w-0 flex-1 px-4 py-[13px]">
        <span className="mb-1.5 block font-sans text-sm font-bold leading-[1.35] tracking-[-0.01em] text-[var(--black)]">
          {event.title}
        </span>
        <span className="flex flex-wrap items-center gap-[7px] font-mono text-[9px] uppercase tracking-[0.05em] text-[var(--gray)]">
          <span>{formatTimeRange(event)}</span>
          {event.location ? (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-[var(--border-m)]" aria-hidden="true" />
              <span>{event.location}</span>
            </>
          ) : null}
        </span>
        <span className="mt-[7px] flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-[20px] border-[0.5px] border-dashed px-2 py-[3px] font-mono text-[8px] font-bold uppercase tracking-[0.08em]"
            style={{ borderColor: color, color }}
          >
            {sourceLabel}
          </span>
          <span
            className="rounded-sm border-[0.5px] px-[7px] py-[3px] font-mono text-[8px] font-bold uppercase tracking-[0.07em]"
            style={{ borderColor: color, color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
          >
            {categoryLabel}
          </span>
        </span>
      </span>
    </button>
  );
}
