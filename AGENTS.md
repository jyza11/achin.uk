# my-skeleton-app — Achin portfolio (SvelteKit)

Bilingual (中/EN) portfolio for **Achin**, a Taipei painter. **This file is the only orientation
for the app** — `CLAUDE.md` just points here. Verified against the repo: **2026-09-06**.

Own git repo: `git@github.com:jyza11/Achin-profolio.git`, branch **`deploy`** (not main).
Deploys to Netlify. The parent folder `../` is a separate repo holding frozen design reference —
see `../AGENTS.md` only if you need that.

## Project rules

- **No new dependency, adapter, or framework without the owner's OK.**
- **Bilingual UX is sacred:** never drop or silently translate 中文/English. Ask before
  changing the language balance.
- This repo is **public**. No personal notes, credentials, or owner preferences in any file here.

## Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | SvelteKit 2 + **Svelte 5** (runes) | Migrated 2026-09-06. `$state/$derived/$effect/$props`, `onclick`, `{@render children()}`. No `svelte/legacy` shims — don't add any. |
| Language | TypeScript 5, Vite 5 | `<script lang="ts">` everywhere |
| Styling | Hand-written `src/lib/styles/portfolio.css` (1,535 lines) | **Tailwind 3.4 is installed but unused** (utilities only in the orphaned `DonationCard`). **Skeleton UI 2.11 installed, never activated** — its tokens resolve to nothing; don't use them. Removal pending (see Open decisions). |
| Deploy | `@sveltejs/adapter-netlify`, `edge:false`, `split:false` | Don't change without OK |
| Lint | ESLint 9 + Prettier 3 | `npm run lint` currently fails — pre-existing, see Commands |

## Commands

```bash
npm install          # first time
npm run dev          # Vite dev server :5173
npm run check        # svelte-check — expect 0 errors (4 a11y warnings in orphaned DonationCard are known)
npm run build        # adapter-netlify build — must pass before commit
npm run lint         # FAILS, pre-existing: Prettier flags 21 files, ESLint lints .netlify/ output. Fix = its own commit.
```

**After `npx sv migrate …` or any major dependency bump:**
`rm -rf node_modules package-lock.json && npm install`. The migrate tool edits `package.json`
but leaves the old lockfile; stale pins (`vite-plugin-svelte@3` vs Svelte 5) cause `ERESOLVE`
and phantom `npm run check` errors. Found 2026-09-06.

## Folder map

```
src/
├── app.html                 shell: Google Fonts (Cormorant Garamond, Inter Tight, JetBrains Mono)
├── app.postcss              THE global CSS entry (there is no app.css) → imports portfolio.css + custom-theme.css + tailwind
├── lib/
│   ├── styles/portfolio.css design tokens (:root ~line 16) + all site CSS, sections split by ═══ dividers
│   ├── components/          WorksGrid, Lightbox, DonationCard (orphaned — unbuilt donation feature, spec ../SUPPORT-README.md)
│   ├── data/works.ts        Vite glob of assets → galleryWorks / sketchWorks (+ optional .jpg.json sidecars, 0 exist)
│   ├── stores/lightbox.ts   factory store with method API
│   └── assets/              224 images, 65 MB, in git: gallery/ 75 · sketch/ 81 · 68 loose untriaged (pro.jpg = portrait)
└── routes/                  / gallery sketch about contact events (+layout = sidebar/mobile drawer/nav source, +error)
art-direction.md             HOW THE WORK IS SHOWN — no crops/edits/overlays. Read before any CSS, image, or grid change
CMS-design.md                PROPOSED v2.1 — content/media/data layer. Read its AGENT BRIEF before touching data/images/text
business-feat-design.md      PARKED — payments/orders; out of CMS scope
NOTES.md                     dated small observations
```

## Conventions — keep these

- **CSS tokens** `--paper --paper-2 --paper-3 --ink --ink-2 --ink-3 --rule --rule-soft --oxblood --oxblood-ink --serif --sans --mono` in `portfolio.css`. Keep the names. **White canvas**: never cream/beige, no cold greys, no darkening/multiply overlays, `--oxblood` is the only accent. Fonts: serif = voice, sans = UI, mono = annotation.
- **Add CSS to `portfolio.css`** in a labelled section, not to `app.postcss`, not a new `app.css`.
- **Grid variants use `data-shape="1..7"`**, never `.w-N` classes (Tailwind collision). `.work .frame { min-height:280px }` stays.
- **Exactly one `<Lightbox />`, in `+layout.svelte`.** Open it via `lightboxStore.open(works, i)`. Its bookkeeping vars (`prevOpen`, `previouslyFocused`, `savedOverflow`) are plain `let`s on purpose — as `$state` the effect's own writes broke the close transition.
- **Escape stacking:** Lightbox listens in capture phase + `stopImmediatePropagation`, so one Escape closes one layer (lightbox before mobile menu).
- **Mobile ≤768px:** works grid is a CSS scroll-snap swipe gallery; lightbox is suppressed (`matchMedia` gate in `WorksGrid`). `/gallery` and `/sketch` add `body.minimal-canvas` (chrome-less, no pull hint — artist's choice).
- **`works.ts`:** keep the defensive URL/metadata parsing and the `console.warn` when a glob yields zero works.
- **Bilingual markup:** `<span>中文</span> <span class="romaji">English</span>`; `navItems` in `+layout.svelte` is the route source of truth.
- **Before commit:** `npm run check && npm run build`. Commit here, on `deploy`.

## State — 2026-09-06

**Built and verified in browser:** all 6 routes, sidebar + mobile drawer, WorksGrid + Lightbox
(open/arrows/Escape/focus/scroll-lock), minimal-canvas mode, white palette, Svelte 5.

**Known gaps:** images in git with iPhone UUID names and no thumbnails; 68 loose files untriaged;
**all page text is hardcoded in `.svelte` files** (inventory in `CMS-design.md`); contact info is
placeholder and **the contact form is fake** (`handleSubmit` only flips a flag); `contact/article.js`
is an orphaned 中文 essay; `DonationCard` orphaned; **desktop works grid crops paintings**
(`object-fit: cover`) — violates `art-direction.md`, not fixed.

## Open decisions / next actions (in order)

1. **Approve `CMS-design.md` v2.1** (self-hosted PocketBase + Cloudflare; host-agnostic). No
   blocking questions left → then the full spec (schema, admin flow, migration plan, backups).
2. **Fix the desktop grid crop** per `art-direction.md` (`object-fit: contain` on desktop).
3. **Deployment:** pick the server (owner has idle Vultr + DigitalOcean VPSes) — a deploy
   decision, not a CMS one. Hardening checklist goes with it.
4. Triage the 68 loose images → migration script → data layer → `/admin` → SEO pass.
5. Later, in this order: CSS design system + admin UI styling (Skeleton/Tailwind removal decided
   then); `business-feat-design.md`; lint config fix + format pass (own commit).

## Doc rules — every agent, every edit

- **One source of truth per topic.** This file = orientation. `CMS-design.md` = architecture
  (AGENT BRIEF block first, reasoning below the line). `NOTES.md` = dated small observations.
  Never duplicate content across them — link instead.
- **Brief first.** Stack, state, and next step must be readable in the first 60 lines.
- **Update in place, date every state claim, delete stale lines.** No appended history, no
  "previously we…" narrative — git holds history.
- **Verify before you write.** Every factual claim (counts, versions, what's used) is checked
  against the repo; bump the "verified" date at the top when you do.
- **Least tokens that still prevent a mistake.** If a line wouldn't change what an agent does,
  cut it.
