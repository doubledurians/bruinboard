# PRD 3 — Design Guidelines

**Reference file:** `/design/bruinboard-final.html` — Codex reads this file
before building any frontend component. Match it exactly.

---

## Colours

All colours must be defined as CSS variables in `app/globals.css`. Never
hardcode hex values in component files.

```css
:root {
  --bg:       #ECECEA;   /* page background */
  --card:     #FFFFFF;   /* card and modal surfaces */
  --indigo:   #1800FF;   /* academic category, primary interactive */
  --pink:     #FF1A6B;   /* pop-up category */
  --yellow:   #FFE100;   /* fun category */
  --black:    #0A0A12;   /* primary text, borders */
  --gray:     #52526A;   /* secondary text */
  --muted:    #8A8A9E;   /* labels, metadata */
  --border:   rgba(10,10,18,0.12);   /* light borders */
  --border-m: rgba(10,10,18,0.24);   /* medium borders */
}
```

Badge colours — do not deviate:
- Free: color #005C38, border #00A060, background rgba(0,160,96,0.06)
- Paid: color #5A4800, border #CCA800, background rgba(204,168,0,0.08)
- RSVP: color #8A0040, border #FF1A6B, background rgba(255,26,107,0.06)

Category stripe colours:
- Academic: var(--indigo) #1800FF
- Pop-up: var(--pink) #FF1A6B
- Fun: var(--yellow) #FFE100

Modal top stripe colour matches the event's category colour.

---

## Typography

**Space Grotesk** — all UI text, titles, headings, card titles, modal titles,
nav wordmark. Import from Google Fonts.

**Space Mono** — all metadata, labels, badges, filter pills, button text,
section divider text, hero eyebrow, hero meta. Import from Google Fonts.

Never substitute system fonts in production.

Font size scale:
- Wordmark: 17px / weight 700 / Space Grotesk / letter-spacing -0.02em
- Hero title: 28px / weight 700 / Space Grotesk / letter-spacing -0.03em
- Card title: 14px / weight 500 / Space Grotesk / letter-spacing -0.01em
- Modal title: 17px / weight 700 / Space Grotesk / letter-spacing -0.02em
- Body / description: 13px / weight 400 / Space Grotesk / line-height 1.75
- Metadata / times / locations: 9px / Space Mono / uppercase / letter-spacing
  0.05–0.14em
- Badges: 8px / weight 700 / Space Mono / uppercase / letter-spacing 0.07em
- Buttons: 10px / weight 700 / Space Mono / uppercase / letter-spacing 0.07em
- Section dividers: 9px / weight 700 / Space Mono / uppercase /
  letter-spacing 0.14em
- Hero eyebrow: 9px / Space Mono / uppercase / letter-spacing 0.14em

---

## Background

Page background: #ECECEA with dot grid overlay.

```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(circle, rgba(10,10,18,0.15) 1px, transparent 1px);
  background-size: 22px 22px;
}
```

---

## Spacing and layout

Max content width: 720px, centred, padding 24px 28px on desktop, 16px on
mobile.

Card internal padding: 13px 16px (body), 14px 0 (date column).
Modal internal padding: 20px 22px (header), 12px 22px (grid cells), 16px 22px
(description and actions).
Date group margin-bottom: 30px.
Card margin-bottom: 8px.
Filter row margin-bottom: 28px.

---

## Border radius

- Cards: 8px
- Buttons: 6px
- Badges: 2px
- Modal: 10px
- Source stamps (dashed pills): 20px
- Calendar today date square: 2px

---

## Components

### Nav
Sticky top. `border-bottom: 0.5px solid var(--border-m)`. Background var(--bg).
Wordmark left: 4-pointed star SVG (14px, indigo fill) + "bruinboard" text in
Space Grotesk 700 17px. No dot after the wordmark. View toggle right: List /
Calendar buttons in Space Mono 10px uppercase.

### 4-pointed star motif
SVG with 4 sharp points. Used in:
- Nav wordmark: 14×14px, fill var(--indigo)
- Section dividers: 9×9px, fill matches date group colour
- Loading state: 44×44px, animated, fill cycles brand colours via JS

Never use a rounded star, 5-pointed star, or emoji star anywhere.

Star SVG path for 14×14:
`M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8Z`

### Event card
`border: 0.5px solid var(--border-m)`, `border-radius: 8px`,
`background: var(--card)`.
On hover: `transform: translateY(-1px)`, `border-color: var(--black)`,
`box-shadow: 2px 2px 0 var(--black)`.
Left stripe: 4px wide, colour matches category.
Date column: 58px wide, `border-right: 0.5px solid var(--border)`.
No thumbnail images on the card surface.
Badge row shows free/paid/RSVP badges only — no source attribution tags.

### Event modal
`border: 0.5px solid var(--border-m)`, `border-radius: 10px`,
`box-shadow: 4px 4px 0 rgba(10,10,18,0.12)`.
Top stripe: 5px height, colour matches event category.
Overlay: `background: rgba(10,10,18,0.55)`.
On desktop: centred overlay.
On mobile (< 480px): full-width, anchored to bottom, border-radius 10px top
only, slides up.
Closes on ✕ click or overlay background click.

### Section dividers
Dashed line: `repeating-linear-gradient(90deg, var(--border-m) 0,
var(--border-m) 4px, transparent 4px, transparent 8px)`.
4-pointed star left of label text.
Star colour matches date group: indigo=Today, pink=This week, yellow=Coming up.

### Filter pills
Space Mono 9px uppercase. Border 0.5px, border-radius 3px.
Dashed border when inactive. Solid border when active.
Academic: indigo colour scheme. Pop-up: pink. Fun: yellow.
On mobile: scroll horizontally, no wrapping.

### Calendar
Black header (`background: var(--black)`). Month label Space Grotesk 700 16px
white. Prev/next nav buttons in Space Mono 10px.
Day headers: Space Mono 8px uppercase, colour var(--muted).
Today's date: indigo filled square, border-radius 2px, white text.
Event pips: 5×5px coloured squares, border-radius 1px.
On desktop: pip label text visible (Space Mono 8px, max-width 70px truncated).
On mobile: pip labels hidden, coloured dot only.

### Buttons
Primary: `background: var(--black)`, white text, border none, border-radius 6px,
hover `background: var(--indigo)`.
Secondary: transparent background, `border: 0.5px solid var(--border-m)`,
colour var(--gray), border-radius 6px, hover `border-color: var(--black)`,
hover colour var(--black).
All button text: Space Mono 10px weight 700 uppercase letter-spacing 0.07em.

### Loading state
44×44px 4-pointed star SVG. CSS animation: scale 0.85→1.1, opacity 0.22→1,
duration 1.4s ease-in-out infinite. JS cycles fill colour indigo→pink→yellow
every 1400ms in sync with the animation loop.
Text below: "Fetching events" Space Grotesk 700 14px. Blinking dots via
staggered CSS animation (3 spans, 0.4s offset each).

### Empty state
Hollow dashed 4-pointed star (stroke only, no fill, stroke-dasharray 3 2).
Small filled circle at centre. "No events found" heading. Subtext: "nothing
matches your current filters". "Clear filters" secondary button.

### Error state
Staggered horizontal rect bars in var(--pink) with varying opacity — glitch
effect. "Signal lost" heading. Subtext: "unable to retrieve events — try again".
"Retry ↺" secondary button.

---

## Responsive breakpoints

Desktop (> 768px): Full layout. Modal centred with overlay.
Tablet (480–768px): Same as desktop. Modal centred.
Mobile (< 480px):
- Nav padding: 12px 16px
- Hero padding: 16px
- Main padding: 16px
- Filter pills: horizontal scroll, overflow-x auto, no flex-wrap
- Event card date column: 52px wide
- Modal: full-width, bottom-anchored, border-radius 10px top only
- Calendar cell min-height: 60px, pip labels hidden

---

## OG / social preview

Every event at `/events/[id]` must render Open Graph meta tags server-side:
- og:title — event title
- og:description — first 160 characters of event description
- og:image — event image_url if present, otherwise /public/og-default.png
- og:url — full canonical URL of the event page

og-default.png: indigo (#1800FF) background, white 4-pointed star centred,
"bruinboard" wordmark in white Space Grotesk below. Save as 1200×630px.

This is non-negotiable. The share feature depends on OG previews working.

---

## Attribution

Every event modal must show "View source ↗" as a secondary button linking to
the original source URL. This is required on every event regardless of type. It
must never be omitted.
