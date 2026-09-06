# CMS design v2 — content, media, and data layer (self-hosted)

## AGENT BRIEF — read this block only; stop at the line unless you need the reasoning

- **STATUS: PROPOSED v2.1 (2026-09-06), NOT APPROVED. Do not implement.**
  v2 supersedes the Supabase design (v1, 2026-08-31). v2.1 narrows scope per the owner.
- **Scope = content, media, data layer, admin access.** Out of scope, by decision 2026-09-06:
  - payments, donations, currency, who receives money → `business-feat-design.md` (parked)
  - which server / VPS / region → a **deployment** concern; this design is host-agnostic
    (any Linux box that can run one binary behind a reverse proxy)
  - CSS design system and the custom admin UI's styling → later
  - how artwork is presented (crop, colour, overlays, Glaze) → `art-direction.md` (the rule
    there governs the media pipeline below)
- **Stack:** SvelteKit on Netlify (unchanged) + **PocketBase** (open-source Go binary: SQLite +
  auth + file storage + REST API + built-in admin dashboard) self-hosted behind Caddy
  (auto-HTTPS) + **Cloudflare free** in front (Gandi stays registrar; nameservers → Cloudflare:
  CDN caching, AI-crawler blocking, hides the origin IP).
- **Database: SQLite** (embedded). Postgres only if multi-artist scale arrives. Backup = nightly
  cron copying the DB file + uploads off-box, plus a tested restore.
- **Why not the alternatives:** Sveltia (git-based) — business data is impossible (webhooks can't
  write commits), every save = 2–4 min rebuild, its GitHub token = repo WRITE access. Supabase
  (v1) — managed service hides the ops/security work the owner wants in-house; free tier pauses
  after 7 idle days; 5 GB egress cap.
- **Day-1 CMS:** PocketBase's built-in admin dashboard — the artist can edit/upload immediately,
  zero code. The custom bilingual `/admin` route in SvelteKit is a later phase.
- **Media pipeline (obeys `art-direction.md`):** originals stored **untouched** in a private
  collection, never publicly served. The public derivative is the same image **resized only**
  (~1600px long edge, aspect kept), EXIF stripped (phone photos carry studio GPS), sRGB.
  Thumbnails via PocketBase `?thumb=WxH` (fit, not crop). **No Glaze/Nightshade by default** —
  per-image opt-in only, the artist's decision.
- **Protection layers:** (1) full resolution never published; (2) Cloudflare AI-bot blocking +
  hotlink protection; (3) robots.txt AI blocks + noai meta + Content Signals (legal groundwork
  under EU/UK TDM rules); (4) C2PA Content Credentials later. Nothing prevents copying a
  displayed image — these limit what can be taken and make it provable.
- **SEO rule:** all runtime fetches happen **server-side** (`+page.server.ts` load) so crawlers
  get full HTML; plus sitemap.xml, robots.txt, per-page `<svelte:head>`, JSON-LD `VisualArtwork`,
  og:image. A cached content snapshot ships with each deploy so a down backend degrades the site
  instead of breaking it.
- **Content blocks:** all page prose is hardcoded in `.svelte` files (inventoried 2026-09-03:
  hero, ticker, statement + 中文 quote duplicated on `/` and `/about`, placeholder contact info,
  orphaned essay `src/routes/contact/article.js`). Becomes a `content_blocks` collection keyed
  by slug with `text_zh` / `text_en`. ⚠️ The contact form is fake (`handleSubmit` only flips a
  flag) — wire or remove.
- **Editorial requirements (added 2026-09-06):** mobile-first upload — the artist photographs on
  a phone; `status` draft/published + soft-delete trash (PocketBase has no undo/history);
  roles admin / artist / editor enforced by collection API rules, not by hiding buttons;
  an SMTP provider for password resets (order emails → business-feat).
- **Migration blockers:** triage the 68 loose files in `src/lib/assets/` (works vs page imagery —
  needs the owner's eyes), then a one-time script: 224 images → PocketBase (originals private +
  web-res public) + seeded metadata rows.
- **Open questions:** none blocking approval.
- **Next step:** owner approves v2.1 → full spec (collections schema, admin flow, migration
  script plan, backup/restore cron) → then code. Server hardening lives with deployment.

---

*Everything below is the reasoning. Skip unless revisiting the decision.*

## 1. What changed since v1

v1 (2026-08-31) chose Supabase. The owner's review (2026-09-01→03) changed four things:

1. **Learning is a first-class constraint** — self-hosting teaches the Linux/TLS/auth/backup
   skills a managed platform hides.
2. **Idle VPS capacity already exists** — self-hosting has zero marginal cost.
3. **Media ≠ business data** — opposite serving needs; the private/public split and the
   Cloudflare edge do the media-serving work.
4. **v1 omitted Supabase's 7-day free-tier auto-pause** — a quiet week would have taken the
   site's data down.

## 2. The three candidates

| | Sveltia (git-based) | Supabase (managed BaaS) | PocketBase self-hosted (chosen) |
|---|---|---|---|
| Core idea | repo IS the database; saves are commits | rent Postgres+storage+auth; vendor runs it | one Go binary you run; SQLite; everything yours |
| Business data later | ❌ impossible | ✅ | ✅ |
| Edit→live | 2–4 min rebuild | instant | instant |
| Cost | £0 | £0 with pause + egress caps, then $25/mo | £0 marginal |
| Learning value | low | medium | high — the point |
| Uptime owner | Netlify | vendor | the site owner — accepted trade |
| Exit path | files already in repo | `pg_dump` | copy one SQLite file + uploads dir |
| Day-1 admin UI | ✅ | ❌ must build | ✅ built-in |
| Credential blast radius | GitHub token = **code write** | data only | data only |

Sveltia is disqualified by business data alone. Supabase suits someone who never wants to see
a server — the opposite of this owner.

## 3. Known risks (accepted, mitigated)

- **You are the uptime.** Backend down = API down until fixed. Mitigation: Netlify frontend
  stays up; deploy-time content snapshot; Cloudflare caches public images.
- **PocketBase is pre-1.0** — pin the version, back up before upgrades, read changelogs.
- **SQLite single-writer ceiling** — irrelevant at one-artist scale; outgrow-path is Postgres.
- **Server compromise** — hardening checklist (SSH keys only, ufw, fail2ban, unattended
  upgrades, Cloudflare-only ingress) is part of deployment, not overhead.

## 4. Protection stack — market note

Market check 2026-09-02: no vendor sells the whole protection stack for a self-owned site —
Cara / Kin.art bundle it only on their own platforms. Composed here from parts. (Logged in GTD
as a possible startup idea.)
