# Bruinboard — Agent Instructions

## What this project is
Bruinboard is a public event discovery website that aggregates UCLA campus events
from three sources: Burkle Center, CAP UCLA, and UCLA Library. It is a read-only
aggregator with no user accounts in V1. Events are scraped nightly and displayed
in a list view and monthly calendar view.

## Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Database: Supabase (Postgres)
- Scrapers: Python 3.11, requests, BeautifulSoup4, supabase-py
- Deployment: Vercel (frontend), GitHub Actions (scrapers)
- Design fonts: Space Grotesk (UI), Space Mono (metadata/labels) via Google Fonts

## Required reading before any task
Read these files in full before starting any task. They are the source of truth.
Do not proceed if any of these files are missing — ask the user to provide them.

- /docs/PRD1-master-plan.md
- /docs/PRD2-implementation.md
- /docs/PRD3-design-guidelines.md
- /docs/PRD4-user-journeys.md
- /docs/tasks.md
- /design/bruinboard-final.html  ← visual reference, match this exactly for all UI

## Execution rules

### General
- Complete tasks in the order they appear in tasks.md. Do not skip ahead.
- Mark each task [x] in tasks.md immediately after completing it.
- After completing a full phase, stop and write a phase summary (see format below).
- If a task is ambiguous, state your assumption explicitly before proceeding.
- If a task cannot be completed due to a missing credential or external dependency,
  mark it [blocked], explain why, and continue to the next unblocked task.

### Code quality
- Never hardcode API keys, secrets, or credentials anywhere in the codebase.
  Always use environment variables. Reference .env.local for local dev.
- Never delete database rows. Use is_active=false to hide events from the UI.
- Always handle errors explicitly — no silent failures in scrapers or API routes.
- All scraper output must be validated before upserting (see Validation section).
- TypeScript strict mode is on. No use of `any` types.
- All components must be responsive — mobile breakpoint is 480px.

### Design fidelity
- /design/bruinboard-final.html is the canonical visual reference.
- Match colours, typography, spacing, and component behaviour exactly.
- All colour values must use CSS variables defined in globals.css — never hardcode
  hex values in component files.
- Font sizes, weights, and letter-spacing must match PRD3 exactly.
- The 4-pointed star SVG motif is used in the nav wordmark, section dividers, and
  loading state. Never substitute a rounded star or emoji.
- Event cards have a coloured left stripe (4px), a date column (58px), and a body.
  No thumbnails on the card surface itself.
- The modal top stripe colour matches the event's category colour.
- On mobile (< 480px): modal is full-width anchored to bottom. Filter pills scroll
  horizontally. Calendar pip labels are hidden — coloured dot only.

### Scraper rules
- Each scraper must import and call the shared upsert helper in scrapers/upsert.py.
- Upsert logic matches on the `url` field to prevent duplicates.
- All datetime values must be parsed into UTC timestamptz before upserting.
- Never scrape and display exhibitions or events without a specific start time.
- category field must be one of: 'academic', 'popup', 'fun' — no other values.
- source field must be one of: 'burkle', 'cap_ucla', 'library' — no other values.
- After building each scraper, also write a validation check (see Validation).

### Database rules
- Never alter the events table schema without explicit instruction from the user.
- The recurrence_rule, status, and submitted_by columns exist for V2 — do not
  populate them from scrapers. Scrapers always write status='active'.
- Row Level Security is enabled. Public reads are filtered to
  status='active' AND is_active=true. Never bypass RLS in frontend code.

## Validation requirements

After every scraper task, run a validation check that confirms:
1. At least one event was upserted successfully
2. No events have a null start_datetime
3. No events have a start_datetime in the past (warn if any exist)
4. No events have a null title
5. All events have the correct source value for that scraper

Report the output of this check in your phase summary before marking tasks complete.

After every API route task, show a sample JSON response from that endpoint.

After every frontend component task, describe:
- What the component renders
- What props it accepts
- What user interactions it handles

## Phase summary format

After completing all tasks in a phase, write a summary using this format:

---
PHASE [N] COMPLETE

Tasks completed: [list task numbers]
Tasks blocked: [list task numbers and reason, or "none"]

What was built:
[brief description of each file created or modified]

Verification checklist for user:
[list of specific things the user should manually check before approving this phase]

Ready for: Phase [N+1]
---

## Environment variables

The following environment variables are required. Never commit these to the repo.
Add to .env.local for local development. Add to Vercel dashboard for production.
Add to GitHub Actions secrets for scraper workflow.

NEXT_PUBLIC_SUPABASE_URL       — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  — Supabase anon/public key (read-only, safe for client)
SUPABASE_SERVICE_ROLE_KEY      — Supabase service role key (scrapers only, never expose to client)

## File structure

bruinboard/
├── AGENTS.md                        ← this file
├── docs/
│   ├── PRD1-master-plan.md
│   ├── PRD2-implementation.md
│   ├── PRD3-design-guidelines.md
│   ├── PRD4-user-journeys.md
│   └── tasks.md
├── design/
│   └── bruinboard-final.html        ← visual reference, do not modify
├── app/
│   ├── globals.css                  ← CSS variables, dot-grid bg, font imports
│   ├── layout.tsx
│   ├── page.tsx                     ← main list/calendar view
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx             ← event detail + OG meta tags
│   ├── api/
│   │   └── events/
│   │       ├── route.ts             ← GET /api/events
│   │       └── [id]/
│   │           └── route.ts         ← GET /api/events/[id]
│   └── components/
│       ├── Nav.tsx
│       ├── FilterPills.tsx
│       ├── EventCard.tsx
│       ├── EventModal.tsx
│       ├── CalendarView.tsx
│       ├── AddToCalendarDropdown.tsx
│       ├── ShareButton.tsx
│       └── UIStates.tsx
├── scrapers/
│   ├── requirements.txt
│   ├── upsert.py                    ← shared upsert helper
│   ├── burkle.py
│   ├── cap.py
│   ├── library.py
│   └── validate.py                  ← post-scrape validation checker
├── public/
│   └── og-default.png               ← fallback OG image
└── .github/
    └── workflows/
        └── scrape.yml               ← daily cron, runs all scrapers

## What NOT to build in V1

Do not build any of the following — they are explicitly deferred to V2:
- User authentication or accounts of any kind
- Bookmark or save functionality
- Club meeting submission form
- Interest-based personalisation or recommendations
- Off-campus events (Westwood, Santa Monica, DTLA)
- Additional event sources beyond the three specified
- Admin UI (use Supabase table editor directly for V1)
- Weekly calendar view (monthly only in V1)
- Any payment or ticketing functionality (link out only)

If the user requests any of the above during a session, acknowledge the request,
note it is a V2 feature, and do not build it unless the user explicitly says to
override this instruction.

## Prompt to start each session

If starting a new Codex session, begin with:
"Read AGENTS.md and the four PRDs in /docs. Then read tasks.md and identify the
first incomplete task. State which task you are starting and what you plan to do
before writing any code."

## Environment
This agent runs in Codex desktop app on Windows with full 
local network access. npm, pip, and git push all work 
without restriction. Do not mark tasks blocked due to 
network issues — execute them directly.