"use client";

import { useState } from "react";

import type { EventRow } from "@/app/types";

type AddToCalendarDropdownProps = {
  event: EventRow;
};

function eventEnd(event: EventRow): Date {
  if (event.end_datetime) {
    return new Date(event.end_datetime);
  }
  const fallback = new Date(event.start_datetime);
  fallback.setHours(fallback.getHours() + 1);
  return fallback;
}

function calendarDate(value: Date): string {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string | null): string {
  return (value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fileSafeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

export default function AddToCalendarDropdown({ event }: AddToCalendarDropdownProps) {
  const [open, setOpen] = useState(false);

  const start = new Date(event.start_datetime);
  const end = eventEnd(event);

  function openGoogleCalendar() {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${calendarDate(start)}/${calendarDate(end)}`,
      details: event.description ?? "",
      location: event.location ?? "",
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function downloadIcs() {
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${calendarDate(start)}`,
      `DTEND:${calendarDate(end)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `DESCRIPTION:${escapeIcs(event.description)}`,
      `LOCATION:${escapeIcs(event.location)}`,
      `URL:${escapeIcs(event.url)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${fileSafeTitle(event.title)}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    setOpen(false);
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-md bg-[var(--black)] px-[18px] py-[9px] font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-white transition-colors hover:bg-[var(--indigo)]"
      >
        Add to calendar
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 z-30 mb-2 min-w-44 overflow-hidden rounded-md border-[0.5px] border-[var(--border-m)] bg-[var(--card)] shadow-[2px_2px_0_var(--black)]">
          <button
            type="button"
            onClick={openGoogleCalendar}
            className="block w-full px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--black)] hover:bg-[var(--bg)]"
          >
            Google Calendar
          </button>
          <button
            type="button"
            onClick={downloadIcs}
            className="block w-full border-t-[0.5px] border-[var(--border)] px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--black)] hover:bg-[var(--bg)]"
          >
            Download .ics
          </button>
        </div>
      ) : null}
    </div>
  );
}
