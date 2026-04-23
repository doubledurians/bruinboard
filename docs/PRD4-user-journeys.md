# PRD 4 — User Journeys

---

## Journey 1 — Discovery on desktop

**Entry:** User navigates to bruinboard.la directly or via a shared link.

**Step 1 — Page load**
Nav appears immediately (static). Event list begins loading. Loading state shows
pulsing 4-pointed star cycling indigo→pink→yellow + "Fetching events…" in the
content area.

**Step 2 — Events load**
Events appear grouped under Today / This week / Coming up. User sees coloured
left stripes and scans titles and times.

**Step 3 — Filter (optional)**
User clicks a category pill to filter. List updates client-side instantly. Pill
border changes from dashed to solid to indicate active state. If no events
match: empty state appears with hollow dashed star, "No events found", and
"Clear filters" button.

**Step 4 — Card click**
User clicks an event card. Modal appears over greyed background. User reads
full description, checks 2×2 detail grid (date/time, location, hosted by,
admission).

**Step 5a — Free event, no registration**
Primary button: "Add to calendar". Clicks it. Dropdown appears with two
options: "Google Calendar" (opens new tab to pre-filled event) and "Download
.ics" (triggers file download). Secondary buttons: "Share ↑" and
"View source ↗".

**Step 5b — Free event, RSVP required**
Primary button: "RSVP ↗". Clicks it. Opens RSVP page in new tab. Secondary
buttons: "Add to calendar", "Share ↑", "View source ↗".

**Step 5c — Ticketed event**
Primary button: "Get tickets ↗". Clicks it. Opens ticket page in new tab.
Secondary buttons: "Add to calendar", "Share ↑", "View source ↗".

**Step 6 — Share**
User clicks "Share ↑". On desktop: link copies to clipboard silently. Toast
appears bottom of modal: "Link copied" for 2 seconds then fades. On mobile:
native share sheet appears (Web Share API).

**Step 7 — Close modal**
User clicks ✕ button or clicks outside modal on greyed overlay. Returns to
list exactly where they left it. Scroll position is preserved.

---

## Journey 2 — Calendar browsing

**Entry:** User is on the main page, clicks "Calendar" in the nav.

**Step 1**
Monthly calendar view appears for current month. Today's date is highlighted
with a filled indigo square on the date number.

**Step 2**
User sees coloured dots on dates with events. Each dot is 5×5px and colour
matches the event's category.

**Step 3**
User clicks a dot. Modal opens with full event detail — same modal as list view.
Modal closes with ✕ or overlay click.

**Step 4**
User clicks prev/next nav arrows in calendar header to go to previous or next
month. Calendar re-renders with that month's events from the API.

**Step 5**
User clicks "List" in nav to return to list view.

---

## Journey 3 — Discovery on mobile via shared link

**Entry:** Friend shares a Bruinboard event link via iMessage. Link preview
shows event title, description excerpt, and event image (or brand fallback).
User taps link.

**Step 1**
Link opens in mobile Safari. User lands on `/events/[id]` — the event detail
page for that specific event.

**Step 2**
Full event modal content is displayed in a mobile-optimised layout. Primary
action button is prominent. "View source ↗" is present.

**Step 3**
User taps "Add to calendar". Dropdown appears. User taps "Download .ics". File
downloads and iOS prompts to add to Apple Calendar.

**Step 4**
User taps the Bruinboard wordmark in the nav. Navigates to main event list.
Browses other events.

**Step 5**
User taps an event card. Modal slides up full-width from the bottom of the
screen. User reads description.

**Step 6**
User taps "Share ↑". iOS native share sheet appears. User selects iMessage,
picks a contact, sends the link.

---

## Journey 4 — Error and recovery

**Step 1**
Scraper failed last night. Supabase has no new events from one source.

**Step 2**
User loads Bruinboard. If events exist from other sources: they display
normally. Missing source events are simply absent with no error shown to user.

**Step 3**
If the API call itself fails completely (Supabase unreachable): error state
displays in content area. "Signal lost" heading, pink glitch bars, "Retry ↺"
button.

**Step 4**
User clicks Retry. Page re-fetches from the API. If recovered: events load
normally. If still failing: error state persists. User can try again later.

**Admin parallel**
GitHub Actions scraper failure sends a ping to healthchecks.io which emails
the admin. Admin checks the Supabase table and the affected source website to
determine whether the scraper broke or the source changed its HTML structure.
Admin fixes the scraper, pushes to main, manually triggers the workflow, and
confirms events populate correctly before the next scheduled run.

---

## Journey 5 — Add to calendar (both options)

**Google Calendar path**
User clicks "Add to calendar" → "Google Calendar". New tab opens to:
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=[title]&dates=[start]/[end]&details=[description]&location=[location]`
All values URL-encoded. User is logged into Google Calendar and sees the
pre-filled event form. They click "Save."

**iCal / Apple Calendar path**
User clicks "Add to calendar" → "Download .ics". Browser downloads a file
named `[event-title].ics`. File contents:
```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:[start in YYYYMMDDTHHmmssZ format]
DTEND:[end in YYYYMMDDTHHmmssZ format]
SUMMARY:[title]
DESCRIPTION:[description]
LOCATION:[location]
URL:[event url]
END:VEVENT
END:VCALENDAR
```
On iOS: file opens and prompts "Add to Calendar?". On macOS: opens in Calendar
app and prompts to add. On Windows: opens in Outlook or default calendar app.
