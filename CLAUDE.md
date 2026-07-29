# my-skeleton-app — SvelteKit App Guidance

> **Scope:** conventions and patterns inside this SvelteKit app. For the outer folder relationship (why the vanilla HTML files at the parent level exist and how to use them), see [../CLAUDE.md](../CLAUDE.md) first.

---

## Stack — read once, then apply

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | SvelteKit | ^2.0 | File-based routing under `src/routes/` |
| Language | Svelte 4 | ^4.2 | Not Svelte 5 — no runes. `$: reactive` syntax. `on:click`, `bind:this`, `export let` props. |
| Types | TypeScript | ^5.0 | `<script lang="ts">` on every component |
| UI kit | Skeleton | ^2.11 | Design system + Tailwind plugin. Themes configured in `tailwind.config.ts` |
| Styling | Tailwind CSS | ^3.4 | plus `@tailwindcss/forms`, `@tailwindcss/typography` |
| Build | Vite | ^5.0 | `import.meta.glob` for eager asset imports |
| Deploy | Netlify | via `@sveltejs/adapter-netlify` | `edge: false`, `split: false` (single Node function) |
| Lint | ESLint 9 + Prettier 3 | — | `npm run lint`, `npm run format` |

**Don't add new deps without user approval.** Existing extras: `@floating-ui/dom` (tooltips/popups), `highlight.js` (code blocks).

---

## Directory conventions

| Path | Purpose | Pattern |
|---|---|---|
| `src/app.html` | HTML shell (Google Fonts, favicon, `%sveltekit.head/body%`) | Don't touch unless changing global head |
| `src/app.postcss` | Tailwind entry + imports `lib/styles/portfolio.css` | Add global CSS via `portfolio.css`, not here |
| `src/lib/styles/portfolio.css` | **All design-token + component CSS.** Section-headers with `═══` dividers. | New global styles go in labeled sections here |
| `src/routes/+layout.svelte` | Sidebar + mobile topbar + Skeleton runtime setup + global Lightbox mount | Nav lives here; add routes by adding to `navItems` array |
| `src/routes/<name>/+page.svelte` | A page | Follow existing pattern (imports from `$lib`, uses design-token classes) |
| `src/lib/components/*.svelte` | Reusable UI | Kebab-cased CSS classes; typed props via `export let` |
| `src/lib/data/*.ts` | Data as TS modules | Typed exports; use `import.meta.glob` for asset-driven data |
| `src/lib/stores/*.ts` | Svelte stores | Factory function pattern (see `lightbox.ts`) |
| `src/lib/assets/gallery/` | Painting images (galleryWorks) | Vite globs these; add `.jpg.json` sidecar for metadata |
| `src/lib/assets/sketch/` | Sketch images (sketchWorks) | Same pattern as gallery/ |
| `static/` | Public assets served at origin root | Favicon, robots.txt, etc. Not hashed by Vite |

---

## Routes

**Actual routes (from `+layout.svelte` nav):**

| Path | Label (中/EN) | Backing data | Status |
|---|---|---|---|
| `/` | Home (homepage) | `galleryWorks` (limit 4) | ✅ built |
| `/gallery` | 油畫 · Paintings | `galleryWorks` (all) | Route may not exist yet — check `src/routes/gallery/` |
| `/sketch` | 素描 · Sketches | `sketchWorks` (all) | Route may not exist yet — check `src/routes/sketch/` |
| `/about` | 關於 · About | — | Static content |
| `/contact` | 合作 · Contact | — | Static content |
| `/events` | 展覽 · Exhibitions | — | Data source TBD |

**When adding a new route:**
1. Create `src/routes/<name>/+page.svelte`
2. Import from `$lib/…` (data, components, stores)
3. Wrap sections in `<section class="band">` for consistent chrome
4. Use `<header class="section-head">` for the numbered section header pattern
5. If the route is user-facing, add it to `navItems` in `+layout.svelte`

---

## Design tokens — the same as the reference

Full palette + font stack lives in `src/lib/styles/portfolio.css:1–21`. Preserve these names exactly — components reference them by name.

```css
--paper, --paper-2, --paper-3         /* backgrounds, cream tones */
--ink, --ink-2, --ink-3               /* text, dark sections */
--rule                                /* hairline borders */
--oxblood, --oxblood-ink              /* single accent */
--serif, --sans, --mono               /* three-role font stack */
```

**Font-role rule (from the design reference):**
- `--serif` (Cormorant Garamond) = voice (headlines, quotes, body prose)
- `--sans` (Inter Tight) = interface (buttons, nav, controls)
- `--mono` (JetBrains Mono) = annotation (metadata, dates, section numbers)

Fonts load in `src/app.html` via Google Fonts. Don't move that import — Skeleton and Tailwind reset CSS depend on it landing early.

---

## Component patterns already established

### `<WorksGrid>` — [src/lib/components/WorksGrid.svelte](src/lib/components/WorksGrid.svelte)

Editorial asymmetric grid; each cell picks a shape via `data-shape={(i % 7) + 1}`. CSS lives in `portfolio.css` under `WORKS GRID`.

**Why `data-shape` and not `class="w-1"`:** Tailwind's `.w-1` width utility loads after `portfolio.css` and would override `grid-column: span N`. Attribute selectors sidestep this. **Never use `.w-1`–`.w-7` class names in new components** — always `data-shape="1"`.

**Frame min-height fallback:** `min-height: 280px` on `.work .frame` guarantees the cell can't collapse to zero if aspect-ratio fails to resolve — a bug we hit before. Keep it.

**Limit prop:** the component defensively handles `null`, `NaN`, negative, `Infinity` — see the reactive `visible` computation. Preserve this pattern in similar list components.

### `<Lightbox>` — [src/lib/components/Lightbox.svelte](src/lib/components/Lightbox.svelte)

Global lightbox mounted once in `+layout.svelte`. Opened via `lightboxStore.open(works, index)`. Features:
- Focus management: `previouslyFocused` restored on close
- Body-scroll lock: `savedOverflow` restored (not hardcoded to `''`)
- `stopImmediatePropagation` on Escape / Arrow keys so mobile-menu Escape doesn't also fire — single keypress = one layer closed
- `beforeNavigate` closes the lightbox on route change
- Image error state with retry
- The reactive block uses `prevOpen` to fire side effects only on the open↔closed edge, not on every next/prev

**Never mount a second lightbox.** Trigger the global one via the store.

### `lightboxStore` — [src/lib/stores/lightbox.ts](src/lib/stores/lightbox.ts)

Factory function pattern (writable + exposed method API). Guards against empty arrays (no modulo-by-zero) and out-of-range index (clamps to `[0, length-1]`).

**When making a new store, follow this shape.** Method API > exposing raw `set/update` for anything with invariants.

---

## Data patterns

### The Vite glob + sidecar JSON pipeline — [src/lib/data/works.ts](src/lib/data/works.ts)

Adds images by dropping files into `src/lib/assets/gallery/` or `src/lib/assets/sketch/`. Vite globs them at build time; `.jpg.json` siblings provide optional metadata (title, year, medium, size, sold). Filename → title fallback handles both Latin and CJK correctly.

**Add a new image collection by:**
1. Create the folder: `src/lib/assets/<collection>/`
2. In `works.ts`, mirror `galleryModules` / `sketchModules` with the new path
3. `buildWorks()` handles the rest
4. Export `<collection>Works` alongside `galleryWorks` / `sketchWorks`

**Defensive parsing rules (preserve these):**
- `extractUrl()` handles Vite returning either a string or `{ default: string }` — protects against future Vite version changes
- `extractMetadata()` validates each field type before assigning — bad JSON doesn't crash the app
- The `console.warn` when glob matched files but produced zero works is a diagnostic ripcord — do not remove

---

## CSS conventions

- **All portfolio-specific CSS goes in `src/lib/styles/portfolio.css`.** Not in Svelte component `<style>` blocks unless the styles are truly component-private and small.
- **`pf-` prefix** = portfolio framework, used for the layout shell (sidebar, topbar, main, footer). Reserved for shell.
- **`data-shape` attribute pattern** for grid variants. Never `.w-N` class names.
- **CSS variables** (`var(--paper)` etc.) for anything the design system defines.
- **Tailwind utilities** where they don't collide (see the Tailwind collision note above). Prefer utilities for spacing, flex, grid gap. Prefer CSS tokens for colors and typography.
- **Sections are separated with `═══` ASCII dividers** and `─────` sub-dividers. Match this style when adding new sections.

---

## Layout shell (from `+layout.svelte`)

- **Desktop:** fixed 220px sidebar on the left, main content offset via `margin-left: 220px`.
- **Mobile (`≤768px`):** sidebar slides in from the left as a drawer; topbar (`.pf-topbar-mobile`) appears at top with hamburger button; backdrop (`.pf-sidebar-backdrop`) dims the main content.
- **Escape closes the mobile menu.** Lightbox's Escape handler uses `stopImmediatePropagation` in the capture phase so a single Escape closes one layer, not both.
- **Global Lightbox mount** is at the end of the layout — outside `.pf-content` so it's not clipped by the sidebar offset.

---

## Bilingual (中/EN) UX rules

The site is Chinese-first-with-English-companion. Preserve this in any content change.

- **Nav pattern:** `<span>{label 中文}</span> <span class="romaji">{English}</span>` — the sidebar `.pf-sidebar-nav a .romaji` styles the English half as small monospace.
- **Ticker phrases** in `+page.svelte` follow the same pattern: `油畫 · Paintings`, `素描 · Sketches`.
- **Homepage quote** is in Traditional Chinese with an English follow-up paragraph. Don't silently drop either.
- **When you generate a new label**, provide both languages. If only one, ask the user.

---

## Commands

```bash
npm install                # first time
npm run dev                # dev server (Vite, HMR)
npm run dev -- --open      # dev server + open browser
npm run build              # production build via adapter-netlify
npm run preview            # preview the build locally

npm run check              # svelte-check + svelte-kit sync (types + validation)
npm run check:watch        # continuous check while editing

npm run lint               # prettier --check + eslint (CI-grade)
npm run format             # prettier --write (auto-fix)
```

**Before committing:** `npm run check && npm run lint`. Both should pass.

**Before deploying:** `npm run build && npm run preview` — validates the production bundle works with `adapter-netlify`.

---

## Deploy

Netlify. `svelte.config.js` uses `@sveltejs/adapter-netlify` with:
- `edge: false` — standard Node functions, not Edge Functions
- `split: false` — one function for the whole app (not per-route)

If you switch to Edge or per-route split, document why. Don't change deploy adapter without user approval.

---

## Non-obvious gotchas discovered by the code comments

These are things the code already handles correctly; don't undo them:

1. **Tailwind `.w-N` vs data-shape collision** — see `WorksGrid.svelte:36`. Attribute selectors avoid the fight.
2. **Frame min-height fallback** — `WorksGrid.svelte:38–39`, `portfolio.css:708`. Guarantees a non-zero cell height when aspect-ratio doesn't resolve.
3. **Escape stacking** — `Lightbox.svelte:49–52`. `stopImmediatePropagation` on Escape prevents the layout-level handler from also closing the mobile menu when the user meant to close the lightbox.
4. **Body-scroll restoration** — `Lightbox.svelte:16, 30–31, 36`. Saves the previous `overflow` value; does not hardcode `''` on close.
5. **Vite glob URL shape** — `works.ts:65–72`. Defensively unwraps both `string` and `{ default: string }` return shapes. Don't remove.
6. **CJK filename → title preservation** — `works.ts:44–57`. Regex only capitalizes ASCII lowercase; CJK passes through untouched.
7. **Loud console.warn on glob-mismatch** — `works.ts:130–139`. If images exist but URL extraction fails, log loudly. Don't silence.
8. **Reactive block open-edge guard** — `Lightbox.svelte:14`. `prevOpen` tracking prevents body-scroll toggle firing on every next/prev.

---

## Testing this app manually

Until an automated test suite exists, verify manually before committing:

- [ ] `npm run dev` starts without errors
- [ ] Homepage loads with hero, ticker, works grid, statement
- [ ] Clicking a work opens the lightbox (desktop) or does NOT open the lightbox (mobile) — see mobile RWD notes
- [ ] Escape closes the lightbox (and returns focus)
- [ ] ← / → arrow keys navigate paintings in the lightbox
- [ ] Mobile menu opens/closes; Escape closes it
- [ ] Sidebar highlights the active route
- [ ] Chinese + English render correctly (fonts loaded)
- [ ] Adding a `.jpg` to `src/lib/assets/gallery/` and reloading shows it in the works grid

---

## Mobile RWD: horizontal-swipe gallery pattern

The works grid uses a **horizontal-swipe pattern on mobile** (custom design decision, not standard Skeleton):
- Swipe left/right = next/previous painting (each painting = 100vw wide, `scroll-snap-type: x mandatory`)
- Swipe up within a painting = reveal its details panel (each `.work` is a `scroll-snap-type: y mandatory` container with two child screens: `.frame` and `.mobile-details`)
- Swipe down = hide details, return to image
- The desktop lightbox is disabled on mobile — the swipe view IS the detail view
- Pure CSS scroll-snap; no JS gesture code

**Files involved:**
- `src/lib/components/WorksGrid.svelte` — renders a `.mobile-details` div per work (hidden on desktop via CSS)
- `src/lib/styles/portfolio.css` — the mobile media query around `.works` implements the 2-axis snap
- The click handler on `.work` is gated by `window.matchMedia('(max-width: 768px)').matches` — no lightbox on mobile

**If you break this pattern later**, update this section AND the outer `../CLAUDE.md`.

### Minimal-canvas mode (art-viewing routes)

`/gallery` and `/sketch` add `body.minimal-canvas` in `onMount` (removed on destroy). The `MINIMAL CANVAS MODE` section in `portfolio.css` overrides everything to pure white, chrome-less: no paper grain, no sidebar/topbar borders, no footer, no frame mat, and — deliberate artist choice — **no pull-hint pill on mobile**, trading swipe discoverability for minimalism. The mobile `.work` card background must also be overridden to white (it carries its own `var(--paper)`), not just `.frame`.

Known accepted limitations:
- Hard loads of these routes flash cream chrome before hydration (class is client-side only).
- With the pull hint gone, `.mobile-details` (title/year/sold) is only reachable if the user guesses the swipe-up gesture.

---

## Where the vanilla HTML reference lives

`../index.html`, `../assets/styles.css`, `../assets/site.js`, `../assets/works.js`, `../assets/image-slot.js` at the parent folder. Read `../CLAUDE.md` for how to use them (they are design reference — do not modify).
