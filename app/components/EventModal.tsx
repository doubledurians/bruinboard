"use client";

import AddToCalendarDropdown from "@/app/components/AddToCalendarDropdown";
import ShareButton from "@/app/components/ShareButton";
import { SOURCE_LABELS, categoryColor, type EventRow } from "@/app/types";

type EventModalProps = {
  event: EventRow | null;
  onClose: () => void;
};

function formatDateTime(event: EventRow): string {
  const start = new Date(event.start_datetime);
  const end = event.end_datetime ? new Date(event.end_datetime) : null;
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(start);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return end ? `${day} · ${time.format(start)} - ${time.format(end)}` : `${day} · ${time.format(start)}`;
}

function admission(event: EventRow): string {
  if (event.price) {
    return event.price;
  }
  return event.ticket_url ? "RSVP required" : "Free";
}

export default function EventModal({ event, onClose }: EventModalProps) {
  if (!event) {
    return null;
  }

  const color = categoryColor(event.category);
  const source = event.source ? SOURCE_LABELS[event.source] : "UCLA";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 max-[480px]:items-end max-[480px]:p-0"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-[540px] overflow-hidden rounded-[10px] border-[0.5px] border-[var(--border-m)] bg-[var(--card)] shadow-[4px_4px_0_rgba(10,10,18,0.12)] max-[480px]:flex max-[480px]:h-[85vh] max-[480px]:max-w-none max-[480px]:animate-[modal-rise_0.18s_ease-out] max-[480px]:flex-col max-[480px]:rounded-b-none">
        <header className="max-[480px]:shrink-0">
          <div className="h-1.5 w-full" style={{ background: color }} />
          <div className="flex items-start justify-between gap-3.5 px-[22px] pt-5 max-[480px]:pb-4">
            <h2 className="font-sans text-[19px] font-bold leading-[1.3] tracking-[-0.02em] text-[var(--black)]">
              {event.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border-[0.5px] border-[var(--border-m)] bg-transparent font-mono text-[11px] text-[var(--gray)] hover:border-[var(--black)] hover:bg-[var(--black)] hover:text-white"
              aria-label="Close event"
            >
              ×
            </button>
          </div>
        </header>
        <div className="max-[480px]:min-h-0 max-[480px]:flex-1 max-[480px]:overflow-y-auto">
          {event.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image_url}
              alt=""
              className="mt-4 h-[170px] w-full border-y-[0.5px] border-[var(--border)] object-cover max-[480px]:mt-0"
            />
          ) : null}
          <div className="mt-4 grid grid-cols-2 border-y-[0.5px] border-[var(--border)] max-[480px]:mt-0 max-[480px]:grid-cols-1">
            {[
              ["Date & time", formatDateTime(event)],
              ["Location", event.location ?? "TBA"],
              ["Hosted by", source],
              ["Admission", admission(event)],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={[
                  "border-[var(--border)] px-[22px] py-3",
                  index % 2 === 0 ? "border-r-[0.5px] max-[480px]:border-r-0" : "",
                  index < 2 ? "border-b-[0.5px]" : "",
                ].join(" ")}
              >
                <div className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {label}
                </div>
                <div className="font-sans text-[13px] font-medium leading-[1.4] text-[var(--black)]">{value}</div>
              </div>
            ))}
          </div>
          <div className="max-h-[28vh] overflow-y-auto border-b-[0.5px] border-[var(--border)] px-[22px] py-4 font-sans text-[13px] leading-[1.75] text-[var(--gray)] max-[480px]:max-h-none max-[480px]:overflow-visible">
            {event.description ?? "No description provided."}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-[22px] py-4 max-[480px]:shrink-0 max-[480px]:border-t-[0.5px] max-[480px]:border-[var(--border)]">
          {event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[var(--black)] px-[18px] py-[9px] font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-white transition-colors hover:bg-[var(--indigo)]"
            >
              RSVP ↗
            </a>
          ) : (
            <AddToCalendarDropdown event={event} />
          )}
          {event.ticket_url ? <AddToCalendarDropdown event={event} /> : null}
          <ShareButton event={event} />
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border-[0.5px] border-[var(--border-m)] bg-transparent px-3.5 py-[9px] font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--gray)] transition-colors hover:border-[var(--black)] hover:text-[var(--black)]"
            >
              View source ↗
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
