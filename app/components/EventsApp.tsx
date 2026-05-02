"use client";

import CalendarView from "@/app/components/CalendarView";
import EventCard from "@/app/components/EventCard";
import EventModal from "@/app/components/EventModal";
import FilterPills from "@/app/components/FilterPills";
import Nav from "@/app/components/Nav";
import { EmptyState, ErrorState, LoadingState } from "@/app/components/UIStates";
import { type Category, type EventRow, type ViewMode } from "@/app/types";
import { useMemo, useState } from "react";

type EventsAppProps = {
  initialEvents: EventRow[];
  initialError: string | null;
};

type EventGroup = {
  label: string;
  color: string;
  events: EventRow[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date): number {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.round(ms / 86400000);
}

function groupEvents(events: EventRow[]): EventGroup[] {
  const now = new Date();
  const groups: EventGroup[] = [
    { label: "Today", color: "var(--indigo)", events: [] },
    { label: "This week", color: "var(--pink)", events: [] },
    { label: "Coming up", color: "var(--yellow)", events: [] },
  ];

  events.forEach((event) => {
    const delta = daysBetween(now, new Date(event.start_datetime));
    if (delta === 0) {
      groups[0].events.push(event);
    } else if (delta <= 7) {
      groups[1].events.push(event);
    } else {
      groups[2].events.push(event);
    }
  });

  return groups.filter((group) => group.events.length > 0);
}

function Divider({ label, color }: { label: string; color: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
        <path d="M4.5 0L5.4 3.6L9 4.5L5.4 5.4L4.5 9L3.6 5.4L0 4.5L3.6 3.6Z" fill={color} />
      </svg>
      <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--gray)]">{label}</span>
      <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--border-m)_0,var(--border-m)_4px,transparent_4px,transparent_8px)]" />
    </div>
  );
}

export default function EventsApp({ initialEvents, initialError }: EventsAppProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(initialEvents);

  const filteredEvents = useMemo(
    () => (activeCategory ? events.filter((event) => event.category === activeCategory) : events),
    [activeCategory, events],
  );
  const groups = useMemo(() => groupEvents(filteredEvents), [filteredEvents]);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("unable to retrieve events");
      }
      const data = (await response.json()) as { events: EventRow[] };
      setEvents(data.events);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "unable to retrieve events");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav view={view} onViewChange={setView} />
      <main className="mx-auto max-w-[720px] px-7 py-6 pb-16 max-[480px]:px-4">
        <FilterPills activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        {loading ? <LoadingState /> : null}
        {!loading && error ? <ErrorState onRetry={retry} /> : null}
        {!loading && !error && filteredEvents.length === 0 ? <EmptyState onClear={() => setActiveCategory(null)} /> : null}
        {!loading && !error && filteredEvents.length > 0 && view === "calendar" ? (
          <CalendarView events={filteredEvents} onEventClick={setSelectedEvent} />
        ) : null}
        {!loading && !error && filteredEvents.length > 0 && view === "list" ? (
          <div>
            {groups.map((group) => (
              <section key={group.label} className="mb-[30px]">
                <Divider label={group.label} color={group.color} />
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
                ))}
              </section>
            ))}
          </div>
        ) : null}
      </main>
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
