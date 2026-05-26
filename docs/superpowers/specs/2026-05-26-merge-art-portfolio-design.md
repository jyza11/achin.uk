# Merge "art Profolio" design into Achin SvelteKit site

**Date:** 2026-05-26
**Source:** `/Users/jyza11/Documents/Claude/Projects/art Profolio/` (static HTML/CSS portfolio designed for "Eloise Marchand")
**Destination:** `/Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/` (SvelteKit site for "Achin")

## Goal

Apply the static portfolio's **visual design** to the existing Svelte site while preserving the existing site's **identity, routes, and content** ("Achin", Chinese labels: 油畫/素描/關於/合作/展覽). This is an aesthetic re-skin, not a content port.

## Non-goals

- Porting Eloise Marchand's name, biography, copy, languages, or locations
- Rewriting the static site's bespoke CSS into Tailwind utility classes
- Removing Skeleton UI as a dependency (it stays installed for popups / highlight.js wiring; just stops being a styling source)
- Adding new routes beyond what exists

## Approach

**Layout-first re-skin.** Swap the layout shell from the current left-sidebar pattern to the static design's top-header + horizontal nav. Import the static design's `styles.css` wholesale (pruned of resets that conflict with Tailwind base). Restyle each existing route using the static design's section patterns (hero, works grid, statement band, visit card, lightbox). Extract only the components that repeat (`WorksGrid`, `Lightbox`); keep section-level markup inline in pages.

## Architecture

### Layout shell (`src/routes/+layout.svelte`)

Replace the existing sidebar + mobile drawer with the static design's topbar pattern:

```
header.topbar (sticky, paper background, backdrop-blur)
  div.topbar-inner [meta-left | wordmark | meta-right | menu-btn]
    meta-left: status dot + "Open today · 10—18h" (or equivalent for Achin)
    wordmark: "Achin" — serif, center
    meta-right: language toggle + tagline
  nav.nav (toggles .open on mobile)
    nav-inner: 油畫 · 素描 · 關於 · 合作 · 展覽 (each gets .zh modifier for tighter letter-spacing)
main (slot)
footer (dark band — shared across all pages)
```

Chinese-character `nav a` items use a `.zh` modifier class to reduce `letter-spacing` from the design's `0.18em` (intended for uppercase Latin) to something more visually balanced (~`0.05em`). `text-transform: uppercase` is a no-op on CJK characters; safe to leave.

Mobile: menu-btn toggles `menuOpen` Svelte state → adds `.open` class to `.nav` → CSS handles the dropdown.

Skeleton UI's `storePopup` and `storeHighlightJs` wiring stays in the layout's `<script>` block — these are infrastructure, not styling.

### Route mapping

| Route | Existing content | Applied design pattern |
|---|---|---|
| `/` | Pro pic + DonationCard + Chinese tagline | Hero (`.hero` with short distinctive `<h1>` phrase — placeholder needed from user, `<em>` accent on key word) → ticker band ("油畫 ✦ 素描 ✦ 展覽…") → exhibition teaser (`.exhibition`, hidden if no current show) → `<WorksGrid>` preview (3-4 items) → statement teaser (short `.pq` excerpt linking to `/about` for full version) |
| `/gallery` (油畫) | Random-image button picker | `<WorksGrid works={gallery} />` + `<Lightbox />`. Data from `$lib/assets/gallery/` via `import.meta.glob` |
| `/sketch` (素描) | Random-image button picker | Same as `/gallery`, different data source (`$lib/assets/sketch/`) |
| `/about` (關於) | Single Chinese tagline | `.statement-band` (dark): portrait left, `.pq` quote (the café/Ferragamo line) + body paragraphs right, `.statement-meta` 3-col footer (born/based/medium) |
| `/contact` (合作) | Skeleton debug/test code | `.visit-band`: `.visit-card` (address, hours, phone, email) + `.news-form`-styled contact form |
| `/events` (展覽) | "coming soon" heading | `.exhibition` section pattern when data exists; styled `.section-head` "coming soon" placeholder otherwise |

### Component boundaries

Extracted (repetition justifies abstraction):

- **`$lib/components/WorksGrid.svelte`**
  - Props: `works: Work[]`, `limit?: number` (for home preview)
  - Renders the 12-col asymmetric grid; assigns `.w-1` … `.w-7` span classes by index modulo pattern
  - Emits `select` event with the clicked `Work` (consumed by `Lightbox`)
  - Each cell: `.work > .frame > <img>` + `.label` (italic title + mono year) + `.meta` (medium, size, optional `.sold` badge)

- **`$lib/components/Lightbox.svelte`**
  - Subscribes to a Svelte writable store `lightboxStore` (open state + current work index + work list)
  - Renders `.lightbox.open` overlay; ESC to close; prev/next keys + buttons
  - Includes `.lb-art` (mat-framed image), `.lb-meta` (kicker, title, blurb, spec dl, counter, nav)

Not extracted (single usage; inline in page):

- Hero, Ticker, Exhibition section, Statement band, Visit card, Footer
- If a second instance of any of these appears later, refactor at that point

### Data model

`src/lib/data/works.ts`:

```ts
export type Work = {
  src: string;
  title: string;
  year: number | string;
  medium: string;
  size: string;       // e.g. "120 × 90 cm"
  sold?: boolean;
};

// Eagerly imported via Vite's import.meta.glob, then mapped to Work objects.
// Title/year/medium/size live in a sidecar JSON or are extracted from filename
// conventions until the user provides metadata.
```

Provisional: until real metadata is provided, use the filename as title and leave medium/size/year empty. The site renders the grid even without metadata — degradation is graceful (italic title + empty meta line).

### CSS strategy

- Copy `art Profolio/assets/styles.css` to `src/lib/styles/portfolio.css`
- Prune duplicate resets that conflict with Tailwind base:
  - `*, *::before, *::after { box-sizing: border-box; }`
  - `html, body { margin: 0; padding: 0; }`
  - `html { -webkit-text-size-adjust: 100%; }`
- Keep everything else, including:
  - `:root` design tokens (paper/ink/oxblood, serif/sans/mono families)
  - `body` base typography and font-feature-settings
  - `body::before` paper-grain SVG noise overlay
  - All component classes (`.topbar`, `.hero`, `.works`, `.statement-band`, `.lightbox`, `.visit-card`, `.foot-*`, `.room-grid`, etc.)
- Add at the bottom: `.nav a.zh { letter-spacing: 0.05em; }` for Chinese nav labels
- Import the file from `src/app.postcss` after the Tailwind directives:
  ```postcss
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import '$lib/styles/portfolio.css';
  ```

### Fonts

Move the Google Fonts `<link>` from each static HTML page into `src/app.html`'s `<head>` so it loads once globally:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400&display=swap" />
```

### Skipped / dropped

- **`<image-slot>` web component** (`art Profolio/assets/image-slot.js`): the static design used it as a drag-drop placeholder for empty mats. Achin has real images. Use plain `<img>` inside `.frame` — the mat shadow and aspect ratio come from `.frame`, not from the custom element.
- **`works.js` vanilla lightbox**: replaced by `Lightbox.svelte`.
- **`site.js` mobile nav + smooth scroll**: replaced by Svelte state. Smooth scroll for in-page anchors can use the browser default (`scroll-behavior: smooth` on `html`).
- **Skeleton UI tokens** (`bg-surface-*-token`, `card preset-filled-*`, `variant-filled`, etc.) throughout existing pages — replaced by the new design classes.
- **`DonationCard` on `/`**: stays in `$lib/components/` but is not imported by the home redesign. Can be re-added as its own route or footer slot later.

## File change inventory

### New
- `src/lib/styles/portfolio.css`
- `src/lib/components/WorksGrid.svelte`
- `src/lib/components/Lightbox.svelte`
- `src/lib/data/works.ts`

### Edited
- `src/app.html` — add Google Fonts link, drop `data-theme="custom-theme"` attribute
- `src/app.postcss` — append `@import '$lib/styles/portfolio.css';`
- `src/routes/+layout.svelte` — replace sidebar shell with topbar + nav + footer
- `src/routes/+page.svelte` — hero + ticker + preview grid + statement teaser
- `src/routes/gallery/+page.svelte` — WorksGrid + Lightbox
- `src/routes/sketch/+page.svelte` — WorksGrid + Lightbox
- `src/routes/about/+page.svelte` — statement band
- `src/routes/contact/+page.svelte` — visit card + contact form (drop debug code)
- `src/routes/events/+page.svelte` — exhibition section pattern or styled placeholder

### Unchanged
- `svelte.config.js`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `package.json`
- All other `$lib/components/*` files (including `DonationCard.svelte`)
- Asset folders (`$lib/assets/gallery/`, `$lib/assets/sketch/`, etc.)

## Error handling and edge cases

- **Missing works metadata**: WorksGrid renders with filename-as-title and empty meta line — no broken UI.
- **Empty exhibition data on `/events`**: render styled `.section-head` "coming soon" placeholder instead of the full `.exhibition` block.
- **Mobile nav with Chinese labels**: letter-spacing on `.nav a.zh` is reduced; verify visually after first render.
- **Tailwind base reset vs portfolio.css resets**: pruning is conservative — only the three rules listed above are removed. If a visual regression appears (e.g. button reset behavior), restore from the source CSS selectively.
- **Skeleton UI globals**: `storePopup` and `storeHighlightJs` stay wired in `+layout.svelte`. They don't affect visuals; removing them would break any popup or code-block usage downstream.

## Testing

Manual verification (Bash tool is unavailable this session; user runs commands):

1. `npm run dev` — site loads at `localhost:5173` without console errors
2. Visual check each route in turn: `/`, `/gallery`, `/sketch`, `/about`, `/contact`, `/events`
3. Mobile viewport (`< 760px`): topbar shows hamburger, nav collapses to dropdown, layouts switch to single-column
4. `/gallery` → click any work → lightbox opens; ESC closes; prev/next keys navigate
5. `npm run check` — no svelte-check / TypeScript errors
6. `npm run build` — production build succeeds

No automated tests are added in this pass.

## Open items for the implementation plan

- Whether to provide a sidecar JSON for works metadata (title, year, medium, size) or rely on filename-as-title initially
- Whether `/` keeps the donation flow (separate route? footer modal? out of scope for this merge?)
- Exact Chinese copy for `meta-left`, `meta-right`, ticker phrases, footer, and the home page hero `<h1>` (the static design uses French/Latin flourishes — Achin needs equivalents)
- Whether to preserve "Achin" as the wordmark or use a longer/multilingual form

These are content decisions, not architectural — defer to implementation.
