export type Category = "academic" | "popup" | "fun";
export type Source = "burkle" | "cap_ucla" | "library";
export type ViewMode = "list" | "calendar";

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
  category: Category | null;
  source: Source | null;
  image_url: string | null;
  is_active: boolean | null;
  scraped_at: string | null;
  recurrence_rule: string | null;
  status: "active" | "pending" | "rejected" | null;
  submitted_by: string | null;
};

export type EventsResponse = {
  events: EventRow[];
  count: number;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  academic: "Academic",
  popup: "Pop-up",
  fun: "Fun",
};

export const SOURCE_LABELS: Record<Source, string> = {
  burkle: "Burkle",
  cap_ucla: "CAP UCLA",
  library: "UCLA Library",
};

export function categoryColor(category: Category | null): string {
  if (category === "academic") {
    return "var(--indigo)";
  }
  if (category === "popup") {
    return "var(--pink)";
  }
  return "var(--yellow)";
}
