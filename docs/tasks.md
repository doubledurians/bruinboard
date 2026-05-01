# Bruinboard — Task List

Agent reads this file before every prompt.
Read PRD1 (Master Plan), PRD2 (Implementation), PRD3 (Design), PRD4 (Journeys)
first. Complete tasks in order. Do not skip ahead.
Mark tasks [x] when complete. Mark tasks [blocked] with reason if stuck.

---

## PHASE 0 — Setup

- [x] 0.1  Initialise Next.js 14 project with App Router:
           `npx create-next-app@latest bruinboard --typescript --tailwind --app`
- [x] 0.2  Install dependencies:
           `npm install @supabase/supabase-js @supabase/ssr date-fns`
- [x] 0.3  Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL and
           NEXT_PUBLIC_SUPABASE_ANON_KEY (values provided by user)
- [x] 0.4  Confirm AGENTS.md exists in repo root and is unmodified
- [x] 0.5  Push to GitHub, connect to Vercel, confirm empty deploy succeeds

---

## PHASE 1 — Database

- [x] 1.0  Install Supabase CLI as a dev dependency and initialise local project:
           `npm install supabase --save-dev`
           `npx supabase init`
           This creates a `supabase/` folder in the repo with config files.
           Confirm `supabase/config.toml` exists after running.
- [x] 1.1  Create first migration file for the events table:
           `npx supabase migration new create_events_table`
           This creates a timestamped file in `supabase/migrations/`.
           Paste the full events table SQL from PRD2 Phase 1 into that file.
           Include the table definition, all check constraints, and all three
           indexes (start_datetime, source, category).
- [x] 1.2  Link local project to remote Supabase instance:
           `npx supabase link --project-ref ypclatwgyccbtcjjyjit`
           Enter the database password when prompted (found in Supabase
           dashboard → Settings → Database → Database password).
- [x] 1.3  Apply migration to remote Supabase project:
           `npx supabase db push`
           Confirm output shows migration applied successfully.
           Verify in Supabase dashboard → Table Editor that events table
           exists with all columns.
- [x] 1.4  Create second migration file for RLS and public read policy:
           `npx supabase migration new enable_rls_and_policies`
           Add SQL to enable RLS on events table and create public read
           policy: SELECT allowed where status='active' AND is_active=true.
           Apply with `npx supabase db push`.
           Confirm policy appears in Supabase dashboard → Authentication →
           Policies.
- [x] 1.5  Insert one test row directly in Supabase dashboard SQL editor
           and query it via anon key to confirm RLS policy works correctly.
           Show row count in phase summary.
- [x] 1.6  Commit all migration files and supabase config to GitHub:
           `git add supabase/ && git commit -m "Add database schema migrations"`
           The supabase/migrations/ folder must be committed — it is the
           source of truth for the database schema.

---

## PHASE 2 — Scrapers

- [x] 2.1  Create `/scrapers` directory with `requirements.txt`:
           requests, beautifulsoup4, supabase, python-dateutil
- [x] 2.2  Build `scrapers/upsert.py` — shared helper that accepts list of event
           dicts and upserts to Supabase on url field using service role key
- [x] 2.3  Build `scrapers/validate.py` — post-scrape validation script that
           checks: row count > 0, no null start_datetime, no null title, correct
           source value, warns on past-dated events
- [x] 2.4  Build `scrapers/burkle.py` — scrape Burkle events page, extract all
           fields, fetch detail pages for descriptions, call upsert helper
- [x] 2.5  Run validate.py after Burkle scraper — show output in summary
- [x] 2.6  Build `scrapers/cap.py` — scrape CAP UCLA calendar, extract all
           fields including ticket_url and price, call upsert helper
- [x] 2.7  Run validate.py after CAP scraper — show output in summary
- [x] 2.8  Build `scrapers/library.py` — scrape UCLA Library events, skip
           exhibitions without times, map event types to categories,
           call upsert helper
- [x] 2.9  Run validate.py after Library scraper — show output in summary
- [x] 2.10 Create `.github/workflows/scrape.yml` — daily cron at 6am UTC,
           runs all three scrapers in sequence, runs validate.py after each
- [x] 2.11 Add healthchecks.io ping at end of workflow using HEALTHCHECKS_URL
           GitHub Actions secret
- [ ] 2.12 Manually trigger workflow in GitHub Actions, confirm it runs
           end to end — show final log output in summary

---

## PHASE 3 — API

- [ ] 3.1  Create `app/api/events/route.ts` — GET handler, fetches upcoming
           active events from Supabase, accepts category and source query
           params, groups into today/this-week/coming-up buckets server-side,
           caps coming-up at 30 days, returns JSON ordered by start_datetime
- [ ] 3.2  Create `app/api/events/[id]/route.ts` — GET handler, fetches single
           event by id
- [ ] 3.3  Test both endpoints — show sample JSON response in phase summary

---

## PHASE 4 — Frontend components

- [ ] 4.1  Set up `app/globals.css` — all CSS variables from PRD3, dot-grid
           background, Google Fonts import for Space Grotesk and Space Mono
- [ ] 4.2  Build `app/components/Nav.tsx` — 4-pointed star SVG + wordmark left,
           List/Calendar toggle right, sticky, border-bottom
- [ ] 4.3  Build `app/components/FilterPills.tsx` — three category pills,
           dashed/solid border toggle on click, horizontal scroll on mobile
- [ ] 4.4  Build `app/components/EventCard.tsx` — coloured stripe, date column,
           title, monospace metadata, badge row (free/paid/RSVP only, no source
           tags). Accepts event object as prop. onClick fires openModal callback
- [ ] 4.5  Build `app/components/UIStates.tsx` — three exported states:
           LoadingState (animated star cycling brand colours), EmptyState
           (dashed star + clear button), ErrorState (glitch bars + retry button)
- [ ] 4.6  Build `app/components/AddToCalendarDropdown.tsx` — button that opens
           two-option dropdown: Google Calendar (pre-filled URL, new tab) and
           Download .ics (generates file per PRD4 Journey 5 spec and triggers
           download)
- [ ] 4.7  Build `app/components/ShareButton.tsx` — uses navigator.share() if
           available (mobile), falls back to navigator.clipboard.writeText()
           (desktop), shows 2-second "Link copied" toast on clipboard copy
- [ ] 4.8  Build `app/components/EventModal.tsx` — centred overlay with greyed
           background, coloured top stripe, title, 2×2 detail grid, optional
           image, full description, action buttons. Full-width bottom-anchored
           on mobile (< 480px). Closes on ✕ or overlay click
- [ ] 4.9  Build `app/components/CalendarView.tsx` — monthly grid, black header
           with month name and prev/next nav, day headers, coloured event dots
           per category, today highlighted with indigo square. Dot click opens
           modal. Mobile: pip labels hidden, dots only
- [ ] 4.10 Build `app/page.tsx` — fetches events from /api/events, manages view
           state (list/calendar), filter state, modal open/close state. Renders
           Nav, hero strip, FilterPills, date-grouped EventCards or CalendarView,
           UIStates, EventModal
- [ ] 4.11 Add Plausible analytics to `app/layout.tsx` — add the Plausible
           script tag with data-domain set to the production domain. Add custom
           event tracking for: modal open (event name + source), filter pill
           click (category), get tickets click, share button click, add to
           calendar click, view source click. Use plausible() function calls
           at each interaction point in the relevant components.

---

## PHASE 5 — Event detail page and OG tags

- [ ] 5.1  Create `app/events/[id]/page.tsx` — server component, fetches event
           by id from /api/events/[id], renders modal content as a full page,
           outputs og:title, og:description, og:image, og:url meta tags
- [ ] 5.2  Create fallback OG image — 1200×630px, indigo background, white
           4-pointed star centred, "bruinboard" wordmark in white below.
           Save as `public/og-default.png`
- [ ] 5.3  Test OG preview by checking a shared event URL at opengraph.xyz —
           show screenshot or description of result in phase summary

---

## PHASE 6 — QA and launch

- [ ] 6.1  Set all environment variables in Vercel dashboard:
           NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] 6.2  Set GitHub Actions secrets:
           SUPABASE_SERVICE_ROLE_KEY, HEALTHCHECKS_URL
- [ ] 6.3  Test full user journey on desktop: load → filter → open modal →
           add to calendar (both options) → share → close
- [ ] 6.4  Test full user journey on mobile Safari: load → tap card → modal
           slide-up → share sheet → close
- [ ] 6.5  Test calendar view on desktop and mobile
- [ ] 6.6  Test all three UI states: force loading, empty (clear all filters),
           error (temporarily break API URL)
- [ ] 6.7  Verify "View source ↗" is present and links correctly on every
           event type from all three sources
- [ ] 6.8  Verify OG previews work for shared event links
- [ ] 6.9  Confirm scraper runs on schedule and new events appear within 24
           hours of the 6am UTC cron run
- [ ] 6.10 Ship to production — confirm live URL is accessible
