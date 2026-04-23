# PRD 1 — Master Plan

**Project name:** Bruinboard
**Version:** 1.0 MVP
**Last updated:** April 2026

---

## What we're building

Bruinboard is a public event discovery website that aggregates UCLA campus events
and surfaces them in one place. The core problem it solves: UCLA events are
scattered across department websites, arts organisation pages, and library
calendars. Students and curious Angelenos miss things they would have attended
if they'd known about them.

Version 1 solves this for three sources: Burkle Center, CAP UCLA, and UCLA
Library. It is a read-only aggregator — no accounts, no submissions, no
personalisation. It is a tool for discovery, not administration.

---

## Who it's for

The primary user is the builder — a UCLA-adjacent person who attends lectures,
screenings, and performances but finds out about them too late or by accident.
The design assumes this person is browsing on both desktop and mobile, often on
their phone while commuting or between classes.

Secondary users: faculty, alumni, and LA locals who follow UCLA cultural
programming.

---

## How it should feel

Bruinboard should feel like a well-edited bulletin board maintained by someone
with good taste — not an official university portal. The aesthetic is
retrofuturism on light: cool off-white background, bold indigo/pink/yellow
category colours, Space Grotesk typography, Space Mono for metadata, 4-pointed
star motifs. Energetic but not chaotic. Scannable but not sterile.

The experience on open should be: "something interesting is always happening."
The user should be able to assess the next two weeks of events in under 30
seconds.

---

## Core features — V1

**Event list view** — Default view. Events grouped by Today / This week /
Coming up (30-day cap). Each card shows: coloured left stripe (category), date
column, title, time, location, free/paid/RSVP badge. Clicking a card opens a
modal.

**Event modal** — Centred overlay with greyed background. Full description, 2×2
detail grid (date+time, location, hosted by, admission), image if available.
Action buttons: Get tickets / RSVP / Add to calendar / Share / View source. On
mobile the modal expands full-width from the bottom.

**Monthly calendar view** — Toggle from the nav. Shows current month onwards.
Events appear as coloured dots on their date. Tapping a dot opens the modal. On
mobile, cell labels are hidden — dot only.

**Category filter** — Three pills: Academic (indigo), Pop-up (pink), Fun
(yellow). Filter pills scroll horizontally on mobile. Filtering is client-side.

**Add to calendar** — Dropdown with two options: Google Calendar (opens
pre-filled web link in new tab) and Download .ics (generates and triggers file
download for Apple Calendar, Outlook, etc.).

**Share** — Web Share API on mobile (triggers native share sheet). Clipboard
copy fallback on desktop with a 2-second "Link copied" toast.

**UI states** — Loading: pulsing 4-pointed star cycling brand colours +
"Fetching events…". Empty: hollow dashed star + "No events found" + clear
filters button. Error: glitch bars + "Signal lost" + retry button.

**Responsive design** — Site must work on both desktop and mobile. Mobile
breakpoint at 480px. All interactions must be touch-friendly.

---

## What this is not (V1)

- Not a submission platform — clubs and departments cannot self-submit events
- Not personalised — no user accounts, no saved preferences
- Not a ticketing platform — Bruinboard links out to ticket purchasers, never
  handles payment
- Not a social platform — no comments, likes, or follows
- Not a mobile app — responsive web only

---

## V2 features (designed for, not built)

Club general meetings via manual admin entry (database already supports
recurrence_rule, status, submitted_by columns). User accounts and bookmarks.
Interest-based filtering and recommendations. Additional sources (Luskin,
Hammer, Anderson, Economics). Off-campus events (Westwood, Santa Monica, DTLA).
Weekly calendar view.

---

## Document references

This document is the compass. Implementation details live in PRD2 (Implementation
Plan). Visual specifications live in PRD3 (Design Guidelines). User flows live in
PRD4 (User Journeys). Executable tasks live in tasks.md.
