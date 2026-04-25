# PRD 2 — Implementation Plan

**Stack:** Next.js 14 · Supabase · Vercel · GitHub · OpenAI Codex
**Agent guidance:** AGENTS.md in repo root references this document

---

## Phase 0 — Repository and environment setup

Create a GitHub repository named `bruinboard`. Initialise with Next.js 14 (App
Router). Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`,
`date-fns`, `tailwindcss`. Create `.env.local` with
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Create
`AGENTS.md` in repo root pointing Codex to the four PRDs and tasks.md. Deploy
empty project to Vercel and confirm CI pipeline runs on push to main.

---

## Phase 1 — Database

Use Supabase CLI with local migrations. Every schema change gets a versioned
migration file committed to the repo. This gives you a reproducible,
version-controlled database setup.

**Setup:**
```bash
npm install supabase --save-dev
npx supabase init
npx supabase link --project-ref ypclatwgyccbtcjjyjit
```

**Migration 1 — Events table** (`create_events_table`):
```sql
create table events (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  start_datetime    timestamptz not null,
  end_datetime      timestamptz,
  location          text,
  url               text,
  ticket_url        text,
  price             text,
  category          text check (category in ('academic','popup','fun')),
  source            text check (source in ('burkle','cap_ucla','library')),
  image_url         text,
  is_active         boolean default true,
  scraped_at        timestamptz default now(),
  recurrence_rule   text,
  status            text default 'active' check (status in ('active','pending','rejected')),
  submitted_by      text
);

create index on events (start_datetime);
create index on events (source);
create index on events (category);
```

**Migration 2 — RLS and policies** (`enable_rls_and_policies`):
```sql
alter table events enable row level security;

create policy "Public read access"
  on events
  for select
  to anon
  using (status = 'active' and is_active = true);
```

Apply migrations with `npx supabase db push`.
All migration files live in `supabase/migrations/` and must be committed to
the repo. They are the source of truth for the database schema.

**File structure after Phase 1:**
```
bruinboard/
└── supabase/
    ├── config.toml
    └── migrations/
        ├── [timestamp]_create_events_table.sql
        └── [timestamp]_enable_rls_and_policies.sql
```

---

## Phase 2 — Scrapers

Each scraper is a standalone Python script in `/scrapers`. All scrapers share a
common output format — a list of event dicts — and a shared `upsert.py` helper
that writes to Supabase using the service role key. Upsert logic matches on
`url` to avoid duplicates.

**Burkle scraper** (`scrapers/burkle.py`): Fetch
`https://www.international.ucla.edu/burkle/events/` with requests. Parse HTML
with BeautifulSoup. Extract each event block: title (anchor text), url (href),
date string, time string, location. Parse date/time into UTC timestamptz. Set
`category='academic'`, `source='burkle'`. Fetch each event detail page to
extract full description.

**CAP UCLA scraper** (`scrapers/cap.py`): Fetch `https://cap.ucla.edu/calendar`
with requests. Parse HTML with BeautifulSoup. Extract title, url, date, time,
location, image_url. Follow each event detail page to extract description,
ticket_url, and price. Set `category='popup'`, `source='cap_ucla'`.

**UCLA Library scraper** (`scrapers/library.py`): Fetch
`https://www.library.ucla.edu/visit/events-exhibitions/` with requests. Parse
HTML with BeautifulSoup. Skip any item without a specific start time
(exhibitions). Extract title, url, date, time, location, image_url, event type
tag. Map event type to category: Screening/Performance/Workshop → `fun`,
Presentation/Research → `academic`. Fetch detail page for full description. Set
`source='library'`.

**Shared upsert helper** (`scrapers/upsert.py`): Accepts list of event dicts.
Connects to Supabase via supabase-py using service role key. Upserts on `url`
column. Logs success/failure count.

**Validation script** (`scrapers/validate.py`): Runs after each scraper.
Checks: at least one event upserted, no null start_datetime, no null title, all
events have correct source value, warns if any events have start_datetime in the
past. Logs output to console.

**GitHub Actions workflow** (`.github/workflows/scrape.yml`): Runs on schedule
`cron: '0 6 * * *'` (6am UTC daily). Installs Python dependencies. Runs all
three scrapers in sequence. Runs validate.py after each scraper. On failure,
pings healthchecks.io URL stored as GitHub Actions secret to send alert email.

---

## Phase 3 — API layer

Create Next.js Route Handlers in `/app/api/`:

`GET /api/events` — Fetches events from Supabase where
`start_datetime > now()` and `status = 'active'` and `is_active = true`.
Accepts query params: `category` (comma-separated), `source`
(comma-separated). Returns JSON array ordered by `start_datetime` ascending.
Results are grouped into date buckets (today / this-week / coming-up)
server-side. Coming-up is capped at 30 days from today.

`GET /api/events/[id]` — Fetches single event by id. Used when sharing a
direct link to an event.

---

## Phase 4 — Frontend

All frontend work in `/app`. Use Tailwind CSS for layout and spacing. Custom
CSS variables for brand colours defined in globals.css. No UI component library
— all components hand-built per PRD3 Design Guidelines.

**Page structure:**
- `app/page.tsx` — Main list/calendar view
- `app/events/[id]/page.tsx` — Event detail page for OG/share link resolution
- `app/components/Nav.tsx`
- `app/components/EventCard.tsx`
- `app/components/EventModal.tsx`
- `app/components/CalendarView.tsx`
- `app/components/FilterPills.tsx`
- `app/components/AddToCalendarDropdown.tsx`
- `app/components/ShareButton.tsx`
- `app/components/UIStates.tsx` — Loading, empty, error states

**Data fetching:** Use fetch in Server Components for initial load. Client-side
filter state managed with useState. No SWR or React Query in V1.

**OG meta tags:** Each event page at `/events/[id]` must output og:title,
og:description, og:image (event image_url if available, fallback to
/public/og-default.png), og:url. This ensures share links preview correctly in
iMessage, WhatsApp, and other apps.

---

## Phase 5 — Deployment and QA

Deploy to Vercel. Connect GitHub repo for automatic deploys on push to main. Set
all environment variables in Vercel dashboard:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Set GitHub Actions secrets:
- SUPABASE_SERVICE_ROLE_KEY (for scrapers)
- HEALTHCHECKS_URL (for failure alerting)

Confirm scraper runs and events appear in production. Confirm OG previews work
by testing a share link in iMessage or using opengraph.xyz.
