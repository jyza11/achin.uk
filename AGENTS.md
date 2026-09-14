# Achin.uk — artist website (SvelteKit)

Website for **Achin**, a New Taipei painter. Traditional Chinese (zh-TW) first, English second;
more languages (JP, FR) later. **This is the only doc for the app:**
Part 1 orients you, Part 2 holds every design decision. `CLAUDE.md` just points here. Verified against the repo: **2026-09-14**.

This folder is its own git repo (remote `git@github.com:jyza11/achin.uk.git`, branch
**`deploy`**, not main; renamed from `Achin-profolio` 2026-09-06). Refer to it as "this repo" or
"the app", never by folder name. Deploys to Netlify. The parent folder `../` is a separate repo of frozen design reference — read
`../AGENTS.md` only if you need it.

**Contents**
Part 1 — Orientation: Project rules · Stack · Commands · Folder map · Conventions · State · Next actions · Doc rules
Part 2 — Design decisions, by category: [Guideline] Art direction · [Guideline] Languages · [Platform] CMS design · [Platform] Deployment · [Later] Business features

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
│   ├── styles/admin.css     /admin only — minimal, built on the same tokens
│   ├── components/          WorksGrid, Lightbox, DonationCard (orphaned — unbuilt donation feature, spec ../SUPPORT-README.md)
│   ├── data/works.ts        Vite glob of bundled assets → galleryWorks / sketchWorks — now the FALLBACK when the CMS is down
│   ├── server/              pb.ts (client, 3s timeout) · works.ts loadWorks() · content.ts loadBlocks() — server-only
│   ├── text.ts              paragraphs() helper shared by server + components
│   ├── pb-browser.ts        browser PocketBase client for /admin (localStorage auth) — never import from server code
│   ├── admin/               labels.ts (繁體中文 strings + pbErrorToZh) · WorkForm.svelte (create/edit/delete)
│   ├── stores/lightbox.ts   factory store with method API
│   └── assets/              triaged 2026-09-08: gallery/ 69 · sketch/ 81 (both migrated to the CMS, kept as fallback) ·
│                            profile/ 6 (Achin's portrait page — LATER, own spec, not in the CMS) · pro.jpg (current portrait)
└── routes/                  / gallery sketch about contact events — all have +page.server.ts (CMS loads with fallback)
    └── admin/               client-only (ssr=false) 繁體中文 admin: / list · works/new · works/[id] · text
pocketbase/                  pb_migrations/ = schema · pb_hooks/ = media pipeline (both committed) · binary, pb_data/, .env.dev = local only (ignored)
deploy/                      cloud-init.yaml (the whole server, one file) + README.md (runbook: launch, DNS, backups, move)
_redirects                   Netlify redirect rules (adapter-netlify forbids them in netlify.toml)
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
message (export as JPEG). The public URL can no longer serve full resolution. A record only
counts as processed once the `image` filename carries the `_web` marker **and** `original` is
non-empty (hardened 2026-09-08 — the marker alone let an artist upload named e.g.
`sunset_web.jpg` skip the pipeline); if the derivative step fails, the row is set back to
`draft` and the failure logged, so a full-resolution file is never left public.

**`/admin` built (2026-09-08):** 繁體中文 admin at `/admin` — client-only, login with a `users`
account. 作品: list with 全部/油畫/素描 filters, drafts muted; 新增/編輯/刪除 form (image upload
with the pipeline's 中文 error messages, all fields, status, sold, sort). 頁面文字: every
`content_blocks` row grouped by page, per-block save, unsaved-changes warning. Verified in the
browser against the local PocketBase (list, edit, text save); upload-through-the-form and delete
are covered by the same SDK calls but still need the owner's click-through. A test editor
account exists locally (credentials in `pocketbase/.env.dev`). **Phone/tablet pass done
(2026-09-08):** the artist edits on iPhone/iPad — 16 px controls (no Safari zoom), 44 px
targets, card list below 760 px, sticky save bar with safe-area padding, growing textareas
(`field-sizing: content`), hover only under `any-hover`. Verified at 375 / 768 / desktop widths
in the browser pane; not yet on a real iPhone. No roles UI; no `original` download.

**Known gaps:** contact details are placeholders (owner to
supply real ones in the dashboard) and **the contact form is fake**; no `users` accounts exist
yet (only the dev superuser); `contact/article.js` orphaned 中文 essay; `DonationCard` orphaned;
2 test rows in `works` (測試作品, test image) to delete before launch; frame mat colour
(`oklch(0.965 0.012 80)`) awaits the owner's call.

## Next actions (in order) — 2026-09-14; order after step 2 is provisional

1. **Prerender + rebuild trigger — built 2026-09-14** (see Deployment › Open). Left: the server
   env vars and the Netlify build hook, which belong to step 2.
2. **Deploy** — owner with the VPS session: server, `netlify.toml` from `master`, Cloudflare,
   launch-day DNS. Static site can go live before the backend.
3. Achin's `users` account; his first edit on his iPhone is the CMS acceptance test.
4. **Contact:** owner supplies real details; form → Netlify Forms (messages vanish today).
5. **Styling approach decision** (options researched 2026-09-12: plain CSS + scoped styles +
   layers recommended; Bits UI only where a widget needs it), then
6. **Vite 8 upgrade with Tailwind + PurgeCSS + safelist removal** — one slice; fixes 7 of the 8
   `npm audit` findings (the last, `cookie` low, has no upstream fix).
7. Component-scoped CSS refactor, one component at a time as touched (Lightbox pilot).
8. Scroll-snap phone gallery from the design session — adopt/park; its CSS sits uncommitted in
   `portfolio.css` since 2026-09-12 and must be branched or stashed before any merge.
9. Retire the Vite-glob fallback data once the CMS is deployed and backed up.
10. Later: profile page for Achin (own spec; `assets/profile/`); more languages; Business features.

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

## [Guideline] Languages — zh-TW first, English second

**Status:** decided by the owner 2026-09-14.

### Decisions

- **Primary language is Traditional Chinese as used in Taiwan; tag `zh-TW`** everywhere: `<html lang="zh-TW">`, later `hreflang` and route names. Set in the prerender slice.
- **English stays as the second text on the same page** (many visitors are bilingual): `title_en`, `description_en`, `text_en`; English spans carry `lang="en"`.
- **Later:** a pure-English version and more languages (JP, FR) through CSS + templates and per-language routes. Not designed; the current `_zh` / `_en` columns will need a per-language scheme then.

### Open / to-do

- CJK typography pass: 繁體 font stack (PingFang TC · Microsoft JhengHei · Noto Sans TC), line-height, mixed CJK/Latin spacing (`text-autospace` is Chrome-only as of 2026-09).

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
  code. The dashboard is English-only, so the custom 繁體中文 `/admin` started 2026-09-08 (client-only
  route, `users` login via the SDK, no UI library): works list, work form (upload/edit/delete),
  text-block editor — all built 2026-09-08. Root layout renders no site chrome under `/admin`. Schema v1.3: logged-in `users` can also read drafts (public rule unchanged).
- **Media pipeline (built 2026-09-08, obeys Art direction):** `pb_hooks/works_images.pb.js` —
  the uploaded file is kept **untouched** in the protected `original` field (token-only
  access); the public `image` becomes the same picture **resized only** to fit 2400×2400
  (long edge 2400 px — retina-sharp, the owner's "a human can't tell" bar), aspect kept,
  never cropped, never upscaled, EXIF stripped (phone photos carry studio GPS). The grid
  requests `?thumb=1600x0`, the lightbox the full web copy. HEIC is refused at upload with
  a clear message (the resizer can't decode it). sRGB conversion is not done — noted, not
  needed so far. Storage must stay on local disk (the hook reads from `pb_data/`).
  **Hardened 2026-09-08:** "processed" requires the `_web` marker **and** a non-empty
  `original` (the marker alone let a same-named artist upload skip the pipeline); a failed
  derivative sets the row to `draft` and logs the failure, so full resolution is never public.
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

**`/admin` (2026-09-08):** no unsaved-changes guard on the work form (text blocks have one);
image `<input>` lacks a `<label for>`; roles are not checked anywhere (every `users` row can
edit everything) — fine for one artist + one helper, revisit if the team grows. Real-device
check on the owner's iPhone/iPad still owed (keyboard vs sticky bar, HEIC auto-conversion:
keep `image/heic` out of the file input's `accept` so iOS converts to JPEG itself).
2026-09-12: `field-sizing: content` (growing textareas in /admin) is Chrome-only — Safari ignores
it, so on iPhone textareas keep the fixed `min-height`. Harmless; add a JS fallback only if the
artist complains.

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

**Status:** server chosen **2026-09-08** — AWS EC2 `t4g.micro` in Tokyo on Free-plan credits for
six months, planned exit to Vultr. Nothing provisioned yet; roadmap under Open. Launch does
**not** wait for the CMS: the static build can go live first and PocketBase joins when ready.

### Decisions

- **Frontend:** Netlify, `adapter-netlify` (`edge:false`, `split:false`), deploys from branch
  `deploy`. Env var `PUBLIC_PB_URL` points the site at the backend. **Function region stays
  US-East** (region choice is a Pro-plan feature): every SSR page pays one US→Tokyo round trip
  (~180 ms) — only `/admin` now: the public routes are prerendered (built 2026-09-14) and served
  from the CDN with no function call.
- **Backend host (2026-09-08):** AWS EC2 **`t4g.micro`** (2 vCPU Graviton ARM, 1 GB), region
  `ap-northeast-1` Tokyo, Ubuntu 24.04 arm64, 20 GB gp3, Elastic IP, **CPU credit mode
  `standard`** (never `unlimited` — load is upload bursts then idle; standard caps the bill).
  ~$14/month all-in (~$8 instance + $3.65 IPv4 + ~$2 disk) ≈ $84 for six months, paid from the
  $100–200 Free-plan credits. PocketBase **`linux_arm64` v0.40.3, pinned**, as a systemd service
  behind **Caddy from its official apt repo** (native systemd, not Docker — fewer moving parts on
  a 1 GB box; Docker is installed only for later services) on `api.achin.uk`.
  **Hard deadline:** the Free plan closes the account six months after creation or at $0
  credits, with a 90-day retention grace. **Month-5 checkpoint:** migrate to Vultr Tokyo
  `vhp-1c-2gb-amd` ($12; ~1 h: copy `pb_data/`, switch DNS) or "Upgrade Plan" to Paid (credits
  still apply). Why AWS over an idle VPS: credits are use-or-lose, it keeps $72 in the owner's
  pocket, and EC2/IAM/VPC/Bedrock is the CV platform; the migration is cheap by design.
  Rejected: Contabo (24-month lock-in), Oracle Always Free (reclaims idle instances — exactly
  this box's profile), GCP/Azure (IPv4 + egress ≈ 2× the price).
- **Provisioning is code:** `deploy/cloud-init.yaml` (committed) creates the admin user with the
  owner's key, disables password SSH, adds a 2 GB swapfile, installs ufw + fail2ban +
  unattended-upgrades + Docker, and installs the PocketBase unit + Caddy compose. A reclaimed or
  replaced box is rebuilt from that file.
- **Firewall = AWS Security Group** (primary): 22 from the owner's IP only; 80/443 from
  Cloudflare IP ranges only — possible because this box serves nothing outside Cloudflare. ufw
  default-deny stays as defence in depth.
- **DNS:** Gandi stays registrar; nameservers → **Cloudflare free**, proxy on: CDN cache,
  AI-crawler blocking, origin IP hidden. Switch DNS on launch day; until then the Netlify preview
  URL is the test site.
- **Backups:** PocketBase's built-in scheduled backup → **Cloudflare R2** (free: 10 GB, no
  egress) — **off-AWS on purpose**: an in-AWS bucket dies with the account. Daily, keep 14,
  **one restore drill before launch**.
- **Cost guard:** AWS Budgets alarm at $150 credits consumed. The five credit tasks are done in
  week 1; the RDS instance is terminated the moment its task is complete.
- **Monitoring:** launch with a free external ping on `/api/health` to the owner's email;
  self-hosted Uptime Kuma later.
- **Secrets:** never in the repo — PocketBase admin + SMTP + R2 credentials live in the server
  environment; site-side values in Netlify env.

### Open / to-do

**Server roadmap — (O) owner, (A) agent, in order. Nothing started as of 2026-09-08.**

1. (O) AWS account on the Free plan, region Tokyo; MFA on root; an IAM user for daily work. Do
   the five credit tasks (terminate RDS straight after); set the $150 Budgets alarm. Confirm
   Bedrock is usable on the plan — if not, upgrade to Paid on day one.
2. (O) Cloudflare account; add `achin.uk`; nameservers at Gandi → Cloudflare (DNS-only until
   launch). Create the R2 bucket + an API token for backups.
3. (A) **Done 2026-09-08:** `deploy/cloud-init.yaml` + `deploy/README.md` (launch parameters,
   SG rules with Cloudflare ranges, EIP, first-login checks). Schema-validated; **not yet booted
   on real hardware** — the first launch (step 4) is the test.
4. (O) Launch the instance from the console with that user-data; attach the EIP; send the IP.
5. (A) Push `pb_migrations/` + `pb_hooks/` + local `pb_data/` (182 MB); start the service;
   Caddy site for `api.achin.uk`; Cloudflare A record (proxied); prove `/api/health` over HTTPS.
6. (A) Schedule backups to R2. (A+O) Restore drill: pull one backup, run it locally, open the
   dashboard.
7. (A) Netlify: `PUBLIC_PB_URL=https://api.achin.uk` in the site env; redeploy; `curl` all six
   routes. (`netlify.toml` **done 2026-09-14** — see below.)
8. (O) Create Achin's `users` account. His first real edit is the acceptance test.
9. (O+A) Launch day: `achin.uk` → Netlify in Cloudflare DNS; external uptime ping on; **put the
   month-5 date in the calendar.**
10. (O) Netlify › Build hooks → create "PocketBase content change" on `deploy`; (A) install its
    URL in `/etc/pocketbase/env` on the box (`deploy/README.md` §5.4 — plumbing **done
    2026-09-14**, value empty until the hook exists). Uptime Kuma after launch.

**Exit path:** Vultr Tokyo (account exists). The current Vultr box is a client's staging and is
not shared; its verified state (2026-09-08) is in git history.

**Site, before launch (found 2026-09-07):**
- **Prerender — BUILT 2026-09-14.** `src/routes/+layout.ts` sets `prerender = true`; the six
  public routes are static HTML at build time, `/admin` stays client-only (its own layout opts
  out). **Build fails loudly** if PocketBase is unreachable or `works` is empty during the build
  (`guardBuildFallback` in `src/lib/server/pb.ts`); `ALLOW_FALLBACK_BUILD=1` builds from the
  bundled fallback instead (first deploy before the backend is public; never leave it set).
  **Rebuild trigger — BUILT 2026-09-14, live-tested:** `pb_hooks/rebuild.pb.js` marks a state
  file dirty on any `works`/`content_blocks` write; a cron every minute POSTs to
  `$NETLIFY_BUILD_HOOK` once the content has been quiet for `REBUILD_QUIET_SECONDS` (default
  120), keeps the flag on failure and retries, never drops an edit that lands mid-request.
  Edit → live ≈ quiet period + build (about 3–5 min). Server-side setup owed by the VPS session:
  set `NETLIFY_BUILD_HOOK` (secret, from Netlify › Build hooks) and optionally
  `REBUILD_QUIET_SECONDS` in PocketBase's environment; `PUBLIC_PB_URL` on Netlify = the public
  API URL; make sure the Netlify build machine can reach it. Images stay on the API host behind
  Cloudflare (decided 2026-09-14; revisit only if first views are slow).
- **`netlify.toml` — DONE 2026-09-14** (VPS session): master's file taken, nothing else from
  `master`; CSP `connect-src` includes `api.achin.uk` + Google Fonts origins; `X-Robots-Tag:
  noindex` on `/admin` and `/admin/*`; HTML `max-age=0, must-revalidate`, `/_app/immutable/*`
  immutable; `NODE_VERSION` 22 (20 is EOL). **Found by the build:** adapter-netlify rejects
  `[[redirects]]` in `netlify.toml` — master's file would have failed every deploy; the rules
  live in `_redirects` at the repo root. `ALLOW_FALLBACK_BUILD` is set in the Netlify UI for
  the first deploy only, never in the file.
- **Homepage has no `<title>`** (only route without `<svelte:head>`); no `<meta description>`
  or OG/Twitter tags anywhere — a shared link shows a blank card on LINE/Instagram/WhatsApp.
- **`static/favicon.png`** is the SvelteKit default.
- ~~`/admin` `noindex` header~~ — done 2026-09-14 in `netlify.toml`.

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
