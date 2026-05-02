import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  url: string | null;
  ticket_url: string | null;
  price: string | null;
  category: "academic" | "popup" | "arts" | "workshops" | null;
  source: "burkle" | "cap_ucla" | "library" | null;
  image_url: string | null;
  is_active: boolean | null;
  scraped_at: string | null;
  recurrence_rule: string | null;
  status: "active" | "pending" | "rejected" | null;
  submitted_by: string | null;
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRow;
      };
    };
  };
};

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
