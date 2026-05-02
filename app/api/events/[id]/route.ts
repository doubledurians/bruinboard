import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../supabase";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError("not found", 404);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 500);
    }

    if (!data) {
      return jsonError("not found", 404);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to fetch event";
    return jsonError(message, 500);
  }
}
