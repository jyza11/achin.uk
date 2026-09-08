# Achin.uk — artist website (SvelteKit)

Bilingual (中/EN) website for **Achin**, a Taipei painter. **This is the only doc for the app:**
Part 1 orients you, Part 2 holds every design decision. `CLAUDE.md` just points here. Verified against the repo: **2026-09-08**.

This folder is its own git repo (remote `git@github.com:jyza11/achin.uk.git`, branch
**`deploy`**, not main; renamed from `Achin-profolio` 2026-09-06). Refer to it as "this repo" or
"the app", never by folder name. Deploys to Netlify. The parent folder `../` is a separate repo of frozen design reference — read
`../AGENTS.md` only if you need it.

**Contents**
Part 1 — Orientation: Project rules · Stack · Commands · Folder map · Conventions · State · Next actions · Doc rules
Part 2 — Design decisions, by category: [Guideline] Art direction · [Platform] CMS design · [Platform] Deployment · [Later] Business features

---

# Part 1 — Orientation

## Project rules

- **No new dependency, adapter, or framework without the owner's OK.**
- **Bilingual UX is sacred:** never drop or silently translate 中文/English. Ask before changing
  the language balance.
- This repo is **public**. No personal notes, credentials, or owner preferences in any file.
- Any change that touches how a painting looks on screen obeys **Part 2 › Art direction**.

## Stack

| Layer     | Choice                                                    | Note                                                                                                                                                                                                                              |
| --------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework | SvelteKit 2 + **Svelte 5** (runes)                        | Migrated 2026-09-06. `$state/$derived/$effect/$props`, `onclick`, `{@render children()}`. No `svelte/legacy` shims — don't add any.                                                                                               |
| Language  | TypeScript 5, Vite 5                                      | `<script lang="ts">` everywhere                                                                                                                                                                                                   |
| Styling   | Hand-written `src/lib/styles/portfolio.css` (1,535 lines) | **Tailwind 3.4 installed but unused** (utilities only in the orphaned `DonationCard`); keep/remove decided with the admin UI. Skeleton UI was removed 2026-09-06 — never activated. |
| Deploy    | `@sveltejs/adapter-netlify`, `edge:false`, `split:false`  | Don't change without OK. See Part 2 › Deployment. |
| Lint      | ESLint 9 + Prettier 3                                     | `npm run lint` passes. `*.md` is excluded from Prettier (table padding doubled doc size). |

## Commands

```bash
npm install          # first time
npm run dev          # Vite dev server :5173
npm run check        # svelte-check — expect 0 errors (4 a11y warnings in orphaned DonationCard are known)
npm run build        # adapter-netlify build — must pass before commit
npm run lint         # prettier --check + eslint — must pass before commit (npm run format fixes style)
node scripts/seed-dev.mjs   # dev only: one painting + /about text into a running local PocketBase
```

**CMS backend (local dev):** the PocketBase binary lives at `pocketbase/pocketbase` (git-ignored;
download the darwin_arm64 release matching `pocketbase/pb_migrations/` — v0.40.3 as of 2026-09-06 —
and verify its sha256 against the release `checksums.txt`). Run it via the `pocketbase` entry in
`.claude/launch.json` (= `./pocketbase/pocketbase serve --http=127.0.0.1:8090 --dir=./pocketbase/pb_data
--migrationsDir=./pocketbase/pb_migrations --hooksDir=./pocketbase/pb_hooks`). Dashboard:
`http://127.0.0.1:8090/_/`. Migrations in `pb_migrations/` apply on start and **are the schema of
record — commit them; never edit collections only in the dashboard.** Hooks in `pb_hooks/`
(media pipeline) hot-reload on change; each handler runs in its own VM, so shared code lives in
`pb_hooks/lib/*.js` and is `require()`d inside the handler. Dev superuser credentials: `pocketbase/.env.dev` (git-ignored;
create with `./pocketbase/pocketbase superuser upsert <email> <password> --dir=./pocketbase/pb_data`).
The site reads `PUBLIC_PB_URL` from `.env` (copy `.env.example`).

**After `npx sv migrate …` or any major dependency bump:**
`rm -rf node_modules package-lock.json && npm install`. The migrate tool edits `package.json`
but leaves the old lockfile; stale pins (`vite-plugin-svelte@3` vs Svelte 5) cause `ERESOLVE`
and phantom `npm run check` errors. Found 2026-09-06.

## Folder map

```
src/
├── app.html                 shell: Google Fonts (Cormorant Garamond, Inter Tight, JetBrains Mono)
├── app.postcss              THE global CSS entry (there is no app.css) → imports portfolio.css + tailwind base/components/utilities
├── lib/
│   ├── styles/portfolio.css design tokens (:root ~line 16) + all site CSS, sections split by ═══ dividers
│   ├── components/          WorksGrid, Lightbox, DonationCard (orphaned — unbuilt donation feature, spec ../SUPPORT-README.md)
│   ├── data/works.ts        Vite glob of bundled assets → galleryWorks / sketchWorks — now the FALLBACK when the CMS is down
│   ├── server/              pb.ts (client, 3s timeout) · works.ts loadWorks() · content.ts loadBlocks() — server-only
│   ├── text.ts              paragraphs() helper shared by server + components
│   ├── stores/lightbox.ts   factory store with method API
│   └── assets/              triaged 2026-09-08: gallery/ 69 · sketch/ 81 (both migrated to the CMS, kept as fallback) ·
│                            profile/ 6 (Achin's portrait page — LATER, own spec, not in the CMS) · pro.jpg (current portrait)
└── routes/                  / gallery sketch about contact events — all have +page.server.ts (CMS loads with fallback)
pocketbase/                  pb_migrations/ = schema · pb_hooks/ = media pipeline (both committed) · binary, pb_data/, .env.dev = local only (ignored)
scripts/                     migrate-images.mjs (bundled images → works, idempotent) · reprocess-images.mjs (run the pipeline over old rows) · seed-dev.mjs (content blocks + 1 test painting)
AGENTS.md                    this file — orientation + all design decisions (source of truth)
README.md                    the short human on-ramp: what it is, run it, edit content. Never holds anything this file doesn't
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
(open/arrows/Escape/focus/scroll-lock), minimal-canvas mode, white palette, Svelte 5, Skeleton
removed, desktop grid no longer crops (`object-fit: contain`), `check` + `lint` + `build` clean.
**CMS is the content source (2026-09-08):** all six routes load server-side from a local
PocketBase. `works` holds the full collection — 150 migrated images (gallery 69, sketch 81,
placeholder titles 未命名/素描 + number for the artist to rename) plus 2 test rows; 14
`content_blocks` cover the hero, /about, gallery note, contact copy/hours/details, events
empty state. Any route with the backend down falls back to the bundled images / hardcoded
text. The owner created a record through the dashboard 2026-09-07 (worked; the two-field
bilingual title layout was not obvious — input for `/admin`). **Test site** — not yet public;
launch window 7–9 Sep 2026.

**Media pipeline live (2026-09-08):** every upload keeps the untouched original in the
protected `original` field and stores a ≤2400px, EXIF-stripped copy as the public `image`
(`pb_hooks/works_images.pb.js`); all 153 rows reprocessed. HEIC uploads are refused with a
message (export as JPEG). The public URL can no longer serve full resolution.

**Known gaps:** contact details are placeholders (owner to
supply real ones in the dashboard) and **the contact form is fake**; no `users` accounts exist
yet (only the dev superuser); `contact/article.js` orphaned 中文 essay; `DonationCard` orphaned;
2 test rows in `works` (測試作品, test image) to delete before launch; frame mat colour
(`oklch(0.965 0.012 80)`) awaits the owner's call.

## Next actions (in order)

1. **Contact form** → Netlify Forms (messages vanish today). Explained to the owner 2026-09-08;
   awaiting go. Can only be tested once deployed on Netlify.
2. `users` accounts for Achin + team (dashboard → users → New; set `role`); stop using the dev
   superuser for content.
3. **Deployment** (Part 2): pick the VPS, DNS → Cloudflare, ship the test site in the 7–9 Sep
   window. The static site can launch before the CMS backend is live. Work through
   Deployment › Open / to-do first — it holds the launch blockers found in review.
4. SEO pass: homepage `<title>`, meta description, OG tags, `lang` attribute, sitemap, favicon
   (details in Deployment › Open / to-do).
5. Retire the Vite-glob fallback data once the CMS is deployed and backed up.
6. Later: custom bilingual `/admin`; profile page for Achin (own spec; `assets/profile/`);
   CSS design system + admin styling; Business features.

## Doc rules — every agent, every edit

- **One file.** Orientation in Part 1, every design decision in Part 2. Never create a separate
  design or notes file. An out-of-scope finding goes as one dated line into the matching
  section's Open / to-do; git history holds the rest.
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

- **Fixed 2026-09-06:** the desktop grid used `object-fit: cover` (cropped every painting); now
  `contain` — the cell keeps its editorial `aspect-ratio`, the painting sits whole inside it,
  letterboxed by the frame mat. Mobile was already `contain`.
- **To confirm with the owner:** the desktop frame mat (`.work .frame`, `portfolio.css` ≈ line
  834) is a warm near-white `oklch(0.965 0.012 80)` with a warm inset border. Not white. Keep as
  "mat" or flatten to `--paper`?
- **Missing:** text in Achin's own words on the style and mood he wants (references, dislikes,
  how the work should sit on the page). Needs a short interview. Until then, the rules above
  are the guideline.

### Reasoning

Anything applied to the image — a crop, a tint, a texture, an adversarial perturbation — is a
change to the artwork the artist didn't make. Protection tools are therefore opt-in, and the
pipeline only ever produces a smaller faithful copy.

## [Platform] CMS design — content, media, data layer

**Status:** v2.1 **APPROVED 2026-09-06; the local slice is built and verified** (schema v1 in
`pocketbase/pb_migrations/`, server-side loads with fallback, seed script). Next: artist trial,
then migration of the 224 images. v2 replaced the Supabase design (v1, 2026-08-31).

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
- **Media pipeline (built 2026-09-08, obeys Art direction):** `pb_hooks/works_images.pb.js` —
  the uploaded file is kept **untouched** in the protected `original` field (token-only
  access); the public `image` becomes the same picture **resized only** to fit 2400×2400
  (long edge 2400 px — retina-sharp, the owner's "a human can't tell" bar), aspect kept,
  never cropped, never upscaled, EXIF stripped (phone photos carry studio GPS). The grid
  requests `?thumb=1600x0`, the lightbox the full web copy. HEIC is refused at upload with
  a clear message (the resizer can't decode it). sRGB conversion is not done — noted, not
  needed so far. Storage must stay on local disk (the hook reads from `pb_data/`).
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
  by slug with `text_zh` / `text_en`. **Achin edits his own intro** (homepage statement + `/about`
  text) through the admin — these blocks are part of the first slice. The fake contact form gets
  wired or removed.
- **Editorial requirements:** mobile-first upload (the artist photographs on a phone); `status`
  draft/published + soft-delete trash (PocketBase has no undo); roles admin / artist / editor
  enforced by collection API rules, not by hiding buttons; an SMTP provider for password resets.

### Open / to-do

- Migration blockers: triage the 68 loose files in `src/lib/assets/` (works vs page imagery —
  needs the owner's eyes), then a one-time script: 224 images → PocketBase (originals private +
  web-res public) + seeded metadata rows.
- **Schema v1.1 (built):** `works` — title_zh/en, description_zh/en, year, medium, size, sold,
  collection (gallery|sketch), sort, status (draft|published), `image` (public, thumbs
  `400x0`/`1600x0` = width-fit, never crop), `original` (protected file), `source_file`
  (bundled filename the row was migrated from; unique). `content_blocks` — slug (unique),
  text_zh, text_en, note. `users` — no self-registration (superuser creates accounts), `role`
  admin|artist|editor. Rules: read published/public rows without auth; write requires a
  `users` login (`@request.auth.collectionName = "users"`). Superusers bypass rules.
- **Still to build:** server-side resize hook so the raw `image` URL never exposes full
  resolution; `users` accounts for Achin + team (roles); the custom `/admin`; backup/restore cron
  (Deployment).

### Reasoning

**What changed since v1 (Supabase):** the owner's review (2026-09-01→03) made learning a
first-class constraint (self-hosting teaches the Linux/TLS/auth/backup skills a managed platform
hides); idle VPS capacity already exists (zero marginal cost); media ≠ business data (opposite
serving needs — the private/public split and Cloudflare edge do the media work); and v1 had
omitted Supabase's 7-day free-tier auto-pause, which would have taken the data down in a quiet
week.

|                         | Sveltia (git-based)                          | Supabase (managed BaaS)                  | PocketBase self-hosted (chosen)    |
| ----------------------- | -------------------------------------------- | ---------------------------------------- | ---------------------------------- |
| Core idea               | repo IS the database; saves are commits      | rent Postgres+storage+auth               | one Go binary you run; SQLite      |
| Business data later     | ❌ impossible (webhooks can't write commits) | ✅                                       | ✅                                 |
| Edit→live               | 2–4 min rebuild                              | instant                                  | instant                            |
| Cost                    | £0                                           | £0 with pause + egress caps, then $25/mo | £0 marginal                        |
| Learning value          | low                                          | medium                                   | high — the point                   |
| Uptime owner            | Netlify                                      | vendor                                   | the site owner — accepted trade    |
| Exit path               | files already in repo                        | `pg_dump`                                | copy one SQLite file + uploads dir |
| Day-1 admin UI          | ✅                                           | ❌ must build                            | ✅ built-in                        |
| Credential blast radius | GitHub token = **code write**                | data only                                | data only                          |

**Known risks, accepted:** you are the uptime (mitigated by the Netlify frontend staying up +
content snapshot + Cloudflare cache); PocketBase is pre-1.0 (pin, back up before upgrades, read
changelogs); SQLite single-writer ceiling (irrelevant at one-artist scale; outgrow-path is
Postgres); server compromise (hardening checklist is part of deployment).

**Market note** (2026-09-02): no vendor sells the whole protection stack for a self-owned site —
Cara / Kin.art bundle it only on their own platforms. Composed here from parts.

## [Platform] Deployment — where things run

**Status:** PLANNED 2026-09-06; launch blockers from the 2026-09-07 review listed under Open.
Test site today; **launch window 7–9 Sep 2026.** Server not yet chosen. The launch does **not** wait for the CMS: the current static build can go live first and
PocketBase joins when it's ready.

### Decisions

- **Frontend:** Netlify, `adapter-netlify` (`edge:false`, `split:false`), deploys from branch
  `deploy`. Env var `PUBLIC_PB_URL` points the site at the backend.
- **Backend:** PocketBase on **one** self-hosted Linux VPS (owner has idle Vultr + DigitalOcean —
  pick the one with more RAM and a current OS; region near Taipei visitors if possible). Runs as
  a systemd service, pinned version, behind **Caddy** (auto-HTTPS) on a subdomain such as
  `api.achin.uk`.
- **DNS:** Gandi stays registrar; nameservers → **Cloudflare free**, proxy on: CDN cache,
  AI-crawler blocking, origin IP hidden. Switch DNS on launch day; until then the Netlify preview
  URL is the test site.
- **Hardening before the backend is public:** non-root user, SSH keys only (password auth off),
  `ufw` default-deny (22 from the owner's IPs; 80/443 from Cloudflare ranges only), `fail2ban`,
  `unattended-upgrades`. This checklist is deliberate learning, not overhead.
- **Backups:** nightly cron copies `pb_data/` (SQLite + uploads) off-box (the other VPS or B2),
  14-day retention, **one restore drill before launch**.
- **Monitoring:** free uptime ping on PocketBase `/api/health`, alert to the owner's email.
- **Secrets:** never in the repo — PocketBase admin + SMTP credentials live in the server
  environment; site-side values in Netlify env.

### Open / to-do

**Server:** 1. Pick the VPS (specs, region). 2. Move the local binary + `pb_data/` to it.
3. Cloudflare account + nameserver move at Gandi. 4. Restore drill. 5. Launch-day DNS switch.

**Site, before launch (found 2026-09-07):**
- **Nothing is prerendered.** No `prerender` export in `src/`; every route runs through the
  Netlify function on each request. Full prerendering (`export const prerender = true` in a root
  `+layout.ts`) is faster, cheaper and survives the backend being down — but it conflicts with
  the CMS rule that pages load from PocketBase at request time. Decide: prerender + rebuild on
  content change (PocketBase hook → Netlify build hook), or keep server-side loads. Not decided.
- **`netlify.toml` is generator boilerplate:** `functions = "netlify/functions"` points at a
  missing dir, no `NODE_VERSION` pin, no headers. GitHub `master` carries a better one
  (security + cache headers) — take it in the `deploy`→`master` merge, then add a CSP entry for
  the PocketBase host.
- **Homepage has no `<title>`** (only route without `<svelte:head>`); no `<meta description>`
  or OG/Twitter tags anywhere — a shared link shows a blank card on LINE/Instagram/WhatsApp.
- **`<html lang="en">`** on a Chinese-first site; likely `zh-Hant`. Owner's call (search +
  screen readers).
- **`static/favicon.png`** is the SvelteKit default.

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
