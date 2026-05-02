import { headers } from "next/headers";

import EventsApp from "@/app/components/EventsApp";
import type { EventsResponse } from "@/app/types";

async function getEvents(): Promise<{ events: EventsResponse["events"]; error: string | null }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    const baseUrl = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });

    if (!response.ok) {
      return { events: [], error: "unable to retrieve events" };
    }

    const data = (await response.json()) as EventsResponse;
    return { events: data.events, error: null };
  } catch {
    return { events: [], error: "unable to retrieve events" };
  }
}

export default async function Home() {
  const { events, error } = await getEvents();
  return <EventsApp initialEvents={events} initialError={error} />;
}
