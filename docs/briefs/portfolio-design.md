# Portfolio Design Brief — for Claude Design Agent
> Self-contained brief. You should NOT need to read other files except those linked at the bottom.

## 1. Quick Context
- **Site:** Achin's artist portfolio at https://achin.uk
- **Stack:** SvelteKit 2 · Svelte 4 · Skeleton UI v2 · Tailwind v3 · Netlify (CLI deploy)
- **Aesthetic locked:** Minimal gallery — lots of whitespace, monochrome, art-first
- **Target users:** Include older/low-end mobile devices (Chrome 70 era)
- **Goal of this brief:** Build a flexible portfolio system where the artist can rename, add, or remove categories without touching code beyond a single config file.

## 2. What Already Exists in This Repo

### Routes (already built, do NOT break)
```
src/routes/
├── +page.svelte         ← home (Achin profile + DonationCard, keep untouched for now)
├── sketch/+page.svelte  ← random-image viewer for $lib/assets/sketch/
└── art/+page.svelte     ← random-image viewer for $lib/assets/gallery/
```

### Assets (already populated by artist)
```
src/lib/assets/
├── pro.jpg              ← profile photo
├── sketch/              ← sketch artworks (image files)
└── gallery/             ← canvas paintings (image files)
```

### Existing pattern (worth understanding before changing)
Both `sketch/+page.svelte` and `art/+page.svelte` use `import.meta.glob` to auto-import all images from their folder, then display **one random image at a time** with a cycle button. It's an interesting low-overwhelm browsing mode — preserve it as an *option*.

## 3. What to Build

### A. Category config file — `src/lib/config/categories.ts`
Single source of truth. Adding a category = one new line.
```ts
export type CategorySlug = string;

export interface ArtworkCategory {
  slug: CategorySlug;     // URL path segment, e.g. "sketch"
  label: string;          // Display name, e.g. "Sketches"
  folder: string;         // Folder under src/lib/assets/, e.g. "sketch"
  description?: string;   // Optional 1-line description shown on category page
}

export const categories: ArtworkCategory[] = [
  { slug: 'sketch', label: 'Sketches',         folder: 'sketch',  description: 'Pencil and ink studies.' },
  { slug: 'canvas', label: 'Canvas Paintings', folder: 'gallery', description: 'Oil and acrylic works.' },
];
```

### B. Portfolio overview — `src/routes/portfolio/+page.svelte`
A grid landing page. For each category:
- Show category label
- Show 3-4 thumbnail preview images (first N from the folder)
- Click anywhere → navigate to `/portfolio/[slug]`

Layout:
- Heading "Portfolio" — large, lots of whitespace
- One section per category, stacked vertically
- Each section: label on left or top, thumbnails on right or below
- Mobile: stack everything
- Desktop: comfortable 1100–1200px max width, centered

### C. Category page — `src/routes/portfolio/[category]/+page.svelte`
Dynamic route. Reads `params.category`, finds matching entry in `categories.ts`.
- If category not found → SvelteKit 404
- Show category label as page heading
- Below: a toggle for view mode:
  - **Grid view (default)** — all images in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - **Random view** — preserves the existing single-image-at-a-time pattern with cycle button
- Each grid image clickable to open a lightbox modal showing the image larger

### D. Lightbox / image viewer — `src/lib/components/Lightbox.svelte`
Reusable modal component:
- Fullscreen darkened backdrop
- Image centered, max 90vh / 90vw
- Close on Escape key, backdrop click, or X button
- Next/Prev arrows to navigate within the current category
- On mobile: swipe gestures optional, but tap-to-close is essential

### E. (Optional but recommended) Artwork data overlay — `src/lib/data/artworks.ts`
If the artist wants per-image metadata (title, year, medium, dimensions):
```ts
// Filename-keyed map. If no entry, fall back to derived alt text from filename.
export const artworkMeta: Record<string, { title?: string; year?: number; medium?: string; dimensions?: string }> = {
  'IMG_3811': { title: 'Study in Green', year: 2025, medium: 'Oil on canvas', dimensions: '60×80cm' },
  // …
};
```

## 4. Design Direction

### Aesthetic: Minimal Gallery
Think: museum website, art-book pages, Kinfolk magazine layout.

- **Typography**: System fonts only for now (old mobile target). Display heading = serif if Skeleton supports it, else system-ui bold large.
- **Color**: Use the existing OKLCH tokens in `custom-theme.css`. Primary palette is blue-violet, but for portfolio prefer surface neutrals (`bg-surface-50`, `text-surface-900`) — art should pop, UI should disappear.
- **Spacing**: Generous. Multiply Skeleton's defaults. Whitespace is the design.
- **Animations**: Subtle only. Image hover = slight darken or lift. No bouncing, no parallax.
- **Borders**: None preferred. Use whitespace and alignment to define structure.

### Reference vibes (in priority order)
1. A museum collection page — neutral chrome, art is the hero
2. Substack reader mode — typography-first, calm
3. Old print catalog — generous margins, dignity

### What to AVOID
- Glossy gradients, neon accents, bold drop shadows
- Card UI with rounded corners + shadows everywhere
- Loading spinners that imply slowness (use skeleton placeholders only if needed)
- Hamburger menus on desktop
- Anything that screams "AI-generated portfolio template"

## 5. Hard Constraints (from CLAUDE.md)
- ✋ Use Skeleton UI design tokens (`bg-surface-*`, `text-primary-*`) — never hex codes
- ✋ All `<img>` tags need explicit `width`, `height`, and `loading="lazy"`
- ✋ No new npm dependencies without asking
- ✋ No `alert()` — use Skeleton Toast or inline error states
- ✋ Bundle budget: < 100KB JS on first load
- ✋ Must work on Chrome 70-era mobile (no CSS Grid without fallback flexbox if used)
- ✋ Do NOT modify: `src/routes/+page.svelte`, `src/lib/components/DonationCard.svelte`, `netlify.toml`
- ✋ Do NOT add a git remote or run deploy commands

## 6. User Flow
```
Visitor lands on /                  → home (Achin + DonationCard)
Clicks "Portfolio" in nav           → /portfolio (overview, all categories)
Clicks "Canvas Paintings"           → /portfolio/canvas (grid of all canvas works)
Clicks an artwork                   → lightbox opens, viewer can browse next/prev
Closes lightbox                     → back at the category grid
Toggles to Random view              → single-image cycle mode
```

## 7. Acceptance Criteria
A reviewer should be able to:
- [ ] Visit `/portfolio` and see categories with thumbnail previews
- [ ] Click into a category, see all images from that folder
- [ ] Open any image in a lightbox
- [ ] Use keyboard (← → Esc) to navigate the lightbox
- [ ] Toggle between Grid and Random view
- [ ] Add a new category by adding one entry to `categories.ts` + a folder — no other code changes needed
- [ ] Page works on iPhone SE (375px) and Chrome 70 simulation
- [ ] Lighthouse mobile performance score ≥ 85

## 8. Out of Scope (Do NOT Build)
- Image upload UI / admin panel — artist still drops files manually
- Per-image purchase buttons — that's Phase 4
- Comments / likes / social features
- Multi-language switching
- Search bar
- Filtering by year/medium beyond category — keep it simple

## 9. Existing Files to Read for Context
- `CLAUDE.md` — full constraints and stack rules
- `PLAN.md` — current phase + decision log
- `src/routes/sketch/+page.svelte` — the existing `import.meta.glob` pattern (reuse this logic)
- `src/routes/art/+page.svelte` — same pattern, different folder
- `src/custom-theme.css` — the OKLCH design token system

## 10. Handoff Prompt (paste into your terminal Claude CLI)

```
/design

Read docs/briefs/portfolio-design.md and build everything specified in section 3 (A through E).

Before writing any code:
1. Confirm you understand the categories config pattern in §3.A
2. Confirm you understand the existing import.meta.glob pattern by skimming src/routes/sketch/+page.svelte
3. List the files you plan to create

Then build them. Use Skeleton UI design tokens only — never hex codes. All images need width/height/loading="lazy". Bundle budget < 100KB JS first load.

Do NOT modify: src/routes/+page.svelte, src/lib/components/DonationCard.svelte, netlify.toml.
Do NOT run git or netlify commands.

When done, summarize what you built and any decisions you made.
```

---

## Brief Author Notes (for owner)
- This brief assumes adding a `/portfolio` route on top of existing `/sketch` and `/art` routes. Those can be kept as-is for now (the new `/portfolio/[category]` covers the same ground but more cleanly) and decommissioned later if desired.
- The "canvas painting" folder is actually named `gallery/` in the repo today. The brief preserves the folder name and uses `slug: 'canvas'` for the URL — so URL is clean, folder name is unchanged.
- If the artist wants per-image metadata (title, year), that's optional section §3.E — easy to add later.
