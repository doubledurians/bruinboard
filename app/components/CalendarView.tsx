"use client";

import { useMemo, useState } from "react";

import { categoryColor, type EventRow } from "@/app/types";

type CalendarViewProps = {
  events: EventRow[];
  onEventClick: (event: EventRow) => void;
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const firstEvent = events[0] ? new Date(events[0].start_datetime) : new Date();
    return new Date(firstEvent.getFullYear(), firstEvent.getMonth(), 1);
  });

  const today = new Date();
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(visibleMonth);
  const monthEvents = useMemo(
    () => events.filter((event) => monthKey(new Date(event.start_datetime)) === monthKey(visibleMonth)),
    [events, visibleMonth],
  );

  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const leadingEmpty = (firstDay.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingEmpty }, (_, index) => ({ type: "empty" as const, key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      type: "day" as const,
      key: `day-${index + 1}`,
      date: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1),
    })),
  ];

  function moveMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div className="overflow-hidden rounded-lg border-[0.5px] border-[var(--border-m)] bg-[var(--card)]">
      <div className="flex items-center justify-between bg-[var(--black)] px-[18px] py-3.5">
        <button type="button" onClick={() => moveMonth(-1)} className="font-mono text-[10px] uppercase tracking-[0.06em] text-white/70 hover:text-white" aria-label="Previous month">
          ‹
        </button>
        <div className="font-sans text-base font-bold tracking-[-0.01em] text-white">{monthLabel}</div>
        <button type="button" onClick={() => moveMonth(1)} className="font-mono text-[10px] uppercase tracking-[0.06em] text-white/70 hover:text-white" aria-label="Next month">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 border-b-[0.5px] border-[var(--border)] bg-[var(--bg)]">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="px-1 py-2 text-center font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          if (cell.type === "empty") {
            return <div key={cell.key} className="min-h-[82px] border-b-[0.5px] border-r-[0.5px] border-[var(--border)] bg-black/[0.015] max-[480px]:min-h-[60px]" />;
          }
          const eventsForDay = monthEvents.filter((event) => sameDay(new Date(event.start_datetime), cell.date));
          const isToday = sameDay(today, cell.date);
          return (
            <div
              key={cell.key}
              className={[
                "min-h-[82px] border-b-[0.5px] border-[var(--border)] p-2 max-[480px]:min-h-[60px]",
                (index + 1) % 7 === 0 ? "" : "border-r-[0.5px]",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-[5px] flex h-5 w-5 items-center justify-center rounded-sm font-mono text-[10px] font-bold",
                  isToday ? "bg-[var(--indigo)] text-white" : "text-[var(--gray)]",
                ].join(" ")}
              >
                {cell.date.getDate()}
              </div>
              <div className="space-y-[3px]">
                {eventsForDay.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event)}
                    className="flex max-w-full items-center gap-1 text-left"
                    title={event.title}
                  >
                    <span className="h-[5px] w-[5px] shrink-0 rounded-[1px]" style={{ background: categoryColor(event.category) }} />
                    <span className="truncate font-mono text-[8px] text-[var(--black)] max-[480px]:hidden">{event.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
