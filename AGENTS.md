# Achin.uk — artist website (SvelteKit)

Bilingual (中/EN) website for **Achin**, a Taipei painter. **This is the only doc for the app:**
Part 1 orients you, Part 2 holds every design decision. `CLAUDE.md` just points here; `NOTES.md`
holds dated small observations. Verified against the repo: **2026-09-06**.

This folder is its own git repo (remote `git@github.com:jyza11/achin.uk.git`, branch
**`deploy`**, not main; renamed from `Achin-profolio` 2026-09-06). Refer to it as "this repo" or
"the app", never by folder name. Deploys to Netlify. The parent folder `../` is a separate repo of frozen design reference — read
`../AGENTS.md` only if you need it.

**Contents**
Part 1 — Orientation: Project rules · Stack · Commands · Folder map · Conventions · State · Next actions · Doc rules
Part 2 — Design decisions, by category: [Guideline] Art direction · [Platform] CMS design · [Later] Business features

---

# Part 1 — Orientation

## Project rules

- **No new dependency, adapter, or framework without the owner's OK.**
- **Bilingual UX is sacred:** never drop or silently translate 中文/English. Ask before changing
  the language balance.
- This repo is **public**. No personal notes, credentials, or owner preferences in any file.
- Any change that touches how a painting looks on screen obeys **Part 2 › Art direction**.

## Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | SvelteKit 2 + **Svelte 5** (runes) | Migrated 2026-09-06. `$state/$derived/$effect/$props`, `onclick`, `{@render children()}`. No `svelte/legacy` shims — don't add any. |
| Language | TypeScript 5, Vite 5 | `<script lang="ts">` everywhere |
| Styling | Hand-written `src/lib/styles/portfolio.css` (1,535 lines) | **Tailwind 3.4 installed but unused** (utilities only in the orphaned `DonationCard`). **Skeleton UI 2.11 installed, never activated** — its tokens resolve to nothing; don't use them. Removal decided later (see Next actions). |
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
AGENTS.md                    this file — orientation + all design decisions
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
**all page text is hardcoded in `.svelte` files** (inventory in Part 2 › CMS design); contact
info is placeholder and **the contact form is fake** (`handleSubmit` only flips a flag);
`contact/article.js` is an orphaned 中文 essay; `DonationCard` orphaned; **desktop works grid
crops paintings** (`object-fit: cover`) — violates Art direction, not fixed.

## Next actions (in order)

1. **Approve CMS design v2.1** (Part 2) → then the full spec (schema, admin flow, migration
   plan, backups).
2. **Fix the desktop grid crop** per Art direction (`object-fit: contain` on desktop).
3. **Deployment:** pick the server (owner has idle Vultr + DigitalOcean VPSes) — a deploy
   decision, not a CMS one. Hardening checklist goes with it. → becomes a Part 2 section.
4. Triage the 68 loose images → migration script → data layer → `/admin` → SEO pass.
5. Later, in this order: CSS design system + admin UI styling (Skeleton/Tailwind removal decided
   then); Business features; lint config fix + format pass (own commit).

## Doc rules — every agent, every edit

- **One file.** Orientation in Part 1, every design decision in Part 2. Never create a separate
  design file; dated small observations go to `NOTES.md` and are deleted once folded in here.
- **Part 2 template, always:** `## [Category] <Title> — <subtitle>` → **Status** line →
  `### Decisions` → `### Open / to-do` → `### Reasoning` (skip unless revisiting). Sections are
  **grouped by category, in dependency order:** `[Guideline]` (rules every other section obeys)
  → `[Platform]` (what is being built) → `[Later]` (parked, depends on Platform). A new context
  (Deployment, SEO, Admin UI…) goes into its category with the same template — update the
  Contents line at the top.
- **Brief first.** Stack, state, next step readable in the first 60 lines; each Part 2 section's
  Decisions readable without its Reasoning.
- **Update in place, date every state claim, delete stale lines.** No appended history — git
  holds it.
- **Verify before you write.** Every factual claim is checked against the repo; bump the
  "verified" date at the top when you do.
- **Least tokens that still prevent a mistake.** If a line wouldn't change what an agent does,
  cut it.

---

# Part 2 — Design decisions

Grouped by category, in dependency order: **[Guideline]** → **[Platform]** → **[Later]**. Read
the **Status** and **Decisions** of a section before touching its area; **Reasoning** only when
revisiting the decision.

## [Guideline] Art direction — how the work is shown

**Status:** confirmed by the owner 2026-09-06. Governs every CSS, image-pipeline, and grid change.

### Decisions

- **The rule: show each painting as it is.** No crops, no edits, no filters, no overlays, nothing
  that tints or alters the artwork. The site is a white wall; the work is the only colour.
- **White canvas** (2026-08-30): `--paper: #ffffff`, warm near-whites for bands; never cream or
  beige, never cold grey, no darkening/multiply overlay, no paper grain.
- **One accent** — `--oxblood`. Everything else neutral.
- **Minimal chrome on art routes** — `/gallery` and `/sketch` use `body.minimal-canvas`: no
  sidebar/topbar borders, no footer, no frame mat, no pull-hint pill on mobile (artist's choice —
  discoverability traded for stillness).
- **Image pipeline may only:** resize keeping aspect, strip metadata, convert to sRGB. Never
  crop, sharpen, filter, or watermark visibly.
- **No Glaze / Nightshade by default** — they perturb the image. Per-image opt-in only; only the
  artist decides.
- **Bilingual 中/EN** labels everywhere, Chinese first. **Three font roles:** serif = voice,
  sans = interface, mono = annotation.

### Open / to-do

- **Violation:** the desktop works grid crops paintings — `.work .frame img { object-fit: cover }`
  (`portfolio.css` ≈ line 860) inside fixed `aspect-ratio` shapes per `data-shape`. Mobile is
  correct (`object-fit: contain`, ≈ line 1070). Fix: desktop also `contain` (or derive each
  cell's aspect from the image); the editorial "shape" pattern yields to the painting. Not started.
- **Missing:** text in Achin's own words on the style and mood he wants (references, dislikes,
  how the work should sit on the page). Needs a short interview. Until then, the rules above
  are the guideline.

### Reasoning

Anything applied to the image — a crop, a tint, a texture, an adversarial perturbation — is a
change to the artwork the artist didn't make. Protection tools are therefore opt-in, and the
pipeline only ever produces a smaller faithful copy.

## [Platform] CMS design — content, media, data layer

**Status:** PROPOSED v2.1 (2026-09-06), **NOT APPROVED. Do not implement.** v2 replaced the
Supabase design (v1, 2026-08-31); v2.1 narrowed scope.

### Scope

Content, media, data layer, admin access. **Out:** payments → Business features; which server /
VPS / region → deployment (this design is host-agnostic: any Linux box running one binary behind
a reverse proxy); CSS design system and admin styling → later; how artwork is presented → Art
direction (its rule governs the media pipeline below).

### Decisions

- **Stack:** SvelteKit on Netlify (unchanged) + **PocketBase** (open-source Go binary: SQLite +
  auth + file storage + REST API + built-in admin dashboard) self-hosted behind Caddy
  (auto-HTTPS) + **Cloudflare free** in front (Gandi stays registrar; nameservers → Cloudflare:
  CDN caching, AI-crawler blocking, hides the origin IP).
- **Database: SQLite** (embedded). Postgres only if multi-artist scale arrives. Backup = nightly
  cron copying the DB file + uploads off-box, plus a tested restore.
- **Day-1 CMS:** PocketBase's built-in dashboard — the artist edits/uploads immediately, zero
  code. The custom bilingual `/admin` route in SvelteKit is a later phase.
- **Media pipeline (obeys Art direction):** originals stored **untouched** in a private
  collection, never publicly served. Public derivative = same image **resized only** (~1600px
  long edge, aspect kept), EXIF stripped (phone photos carry studio GPS), sRGB. Thumbnails via
  PocketBase `?thumb=WxH` (fit, not crop).
- **Protection layers:** (1) full resolution never published; (2) Cloudflare AI-bot blocking +
  hotlink protection; (3) robots.txt AI blocks + noai meta + Content Signals (legal groundwork
  under EU/UK TDM rules); (4) C2PA Content Credentials later. Nothing prevents copying a
  displayed image — these limit what can be taken and make ownership provable.
- **SEO rule:** all runtime fetches **server-side** (`+page.server.ts` load) so crawlers get full
  HTML; plus sitemap.xml, robots.txt, per-page `<svelte:head>`, JSON-LD `VisualArtwork`,
  og:image. A cached content snapshot ships with each deploy so a down backend degrades the
  site instead of breaking it.
- **Content blocks:** all page prose is hardcoded in `.svelte` files (inventoried 2026-09-03:
  hero, ticker, statement + 中文 quote duplicated on `/` and `/about`, placeholder contact info,
  orphaned essay `src/routes/contact/article.js`). Becomes a `content_blocks` collection keyed
  by slug with `text_zh` / `text_en`. The fake contact form gets wired or removed.
- **Editorial requirements:** mobile-first upload (the artist photographs on a phone); `status`
  draft/published + soft-delete trash (PocketBase has no undo); roles admin / artist / editor
  enforced by collection API rules, not by hiding buttons; an SMTP provider for password resets.

### Open / to-do

- Migration blockers: triage the 68 loose files in `src/lib/assets/` (works vs page imagery —
  needs the owner's eyes), then a one-time script: 224 images → PocketBase (originals private +
  web-res public) + seeded metadata rows.
- No question blocks approval. **Next:** owner approves v2.1 → full spec (collections schema,
  admin flow, migration script plan, backup/restore cron) → code. Server hardening lives with
  deployment.

### Reasoning

**What changed since v1 (Supabase):** the owner's review (2026-09-01→03) made learning a
first-class constraint (self-hosting teaches the Linux/TLS/auth/backup skills a managed platform
hides); idle VPS capacity already exists (zero marginal cost); media ≠ business data (opposite
serving needs — the private/public split and Cloudflare edge do the media work); and v1 had
omitted Supabase's 7-day free-tier auto-pause, which would have taken the data down in a quiet
week.

| | Sveltia (git-based) | Supabase (managed BaaS) | PocketBase self-hosted (chosen) |
|---|---|---|---|
| Core idea | repo IS the database; saves are commits | rent Postgres+storage+auth | one Go binary you run; SQLite |
| Business data later | ❌ impossible (webhooks can't write commits) | ✅ | ✅ |
| Edit→live | 2–4 min rebuild | instant | instant |
| Cost | £0 | £0 with pause + egress caps, then $25/mo | £0 marginal |
| Learning value | low | medium | high — the point |
| Uptime owner | Netlify | vendor | the site owner — accepted trade |
| Exit path | files already in repo | `pg_dump` | copy one SQLite file + uploads dir |
| Day-1 admin UI | ✅ | ❌ must build | ✅ built-in |
| Credential blast radius | GitHub token = **code write** | data only | data only |

**Known risks, accepted:** you are the uptime (mitigated by the Netlify frontend staying up +
content snapshot + Cloudflare cache); PocketBase is pre-1.0 (pin, back up before upgrades, read
changelogs); SQLite single-writer ceiling (irrelevant at one-artist scale; outgrow-path is
Postgres); server compromise (hardening checklist is part of deployment).

**Market note** (2026-09-02): no vendor sells the whole protection stack for a self-owned site —
Cara / Kin.art bundle it only on their own platforms. Composed here from parts.

## [Later] Business features — donations, sales, currency

**Status:** PARKED 2026-09-06, not started. Out of CMS scope by the owner's decision. Do not
design or build until the CMS data layer exists.

### Decisions (carried forward)

- **Never handle card data.** Processor only (PayPal / Stripe Checkout). The database stores
  order rows + the processor's transaction ID, updated by webhook. Multi-currency comes from the
  processor.
- Input already on disk: donation spec `../SUPPORT-README.md` + mockups
  `../support-mockup-*.html`; `DonationCard.svelte` is the waiting stub.
- Depends on the `orders` collection defined under CMS design.

### Open / to-do (answer before designing)

1. Merchant of record: the owner (UK) or the artist (Taiwan)? Tax/legal before code.
2. Processor: Stripe is limited in Taiwan; PayPal works. Follows from (1).
3. Terms of sale, privacy policy, GDPR for UK/EU buyers.
4. Transactional email provider (shared with CMS password resets).
