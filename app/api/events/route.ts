import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "./supabase";

const VALID_CATEGORIES = ["academic", "popup", "fun", "workshops"] as const;
const VALID_SOURCES = ["burkle", "cap_ucla", "library"] as const;
const DEFAULT_WINDOW_DAYS = 60;
const MAX_WINDOW_DAYS = 90;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseWindow(value: string | null): number | Response {
  if (!value) {
    return DEFAULT_WINDOW_DAYS;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return jsonError("window must be a positive integer", 400);
  }

  return Math.min(parsed, MAX_WINDOW_DAYS);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const windowDays = parseWindow(searchParams.get("window"));

  if (windowDays instanceof Response) {
    return windowDays;
  }

  if (category && !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return jsonError("invalid category", 400);
  }

  if (source && !VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number])) {
    return jsonError("invalid source", 400);
  }

  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .eq("is_active", true)
      .gte("start_datetime", now.toISOString())
      .lte("start_datetime", windowEnd.toISOString())
      .order("start_datetime", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error } = await query;

    if (error) {
      return jsonError(error.message, 500);
    }

    const events = data ?? [];
    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to fetch events";
    return jsonError(message, 500);
  }
}
