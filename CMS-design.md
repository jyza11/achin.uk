# CMS design v2 — content, media, and business data (self-hosted)

## AGENT BRIEF — read this block only; stop at the line unless you need the reasoning

- **STATUS: PROPOSED v2 (2026-09-03), NOT APPROVED. Do not implement.**
  v2 **supersedes the Supabase design (v1, 2026-08-31)** after the owner's review: he
  prefers self-hosted / open-source / personally-researched stacks so the project doubles
  as dev + cybersecurity learning, and he already pays for two idle VPSes (Vultr, DigitalOcean).
- **Stack:**
  - **Frontend:** SvelteKit on Netlify — unchanged.
  - **Backend:** **PocketBase** (open-source Go binary: SQLite + auth + file storage +
    REST API + built-in admin dashboard) on ONE existing VPS (**Vultr vs DO: TBD**),
    behind Caddy (auto-HTTPS).
  - **Edge:** Cloudflare free in front (Gandi stays registrar; nameservers → Cloudflare):
    CDN caching, AI-crawler blocking, hides the VPS origin IP.
  - **Payments:** processor-only (PayPal per `../SUPPORT-README.md`; Stripe TBD — see
    open questions). **Never handle card data; DB stores order rows + processor txn IDs
    updated by webhook.**
- **Database: SQLite** (embedded in PocketBase). Postgres only if/when multi-artist
  scale arrives. Backup = nightly cron copying the DB file + uploads off-box.
- **Why not the alternatives:** Sveltia (git-based) — orders are impossible (webhooks
  can't write commits), every save = 2–4 min rebuild, and its GitHub token = repo WRITE
  access (content creds become code creds — bad blast radius). Supabase (v1 pick) —
  managed service hides the ops/security work the owner wants in-house, free tier pauses
  after 7 idle days, 5 GB egress cap.
- **Day-1 CMS:** PocketBase's built-in admin dashboard — Achin can edit/upload
  immediately, zero code. The custom bilingual `/admin` route in SvelteKit is a later
  polish phase, not a blocker.
- **Admin UI styling (corrected 2026-09-06):** plain Tailwind + `portfolio.css` tokens
  + small custom components. **Not Skeleton UI** — it is installed but never activated
  or used anywhere in the site (see AGENTS.md SESSION STATE). Likely deps to add:
  `pocketbase` SDK, `sveltekit-superforms` + `zod`, `svelte-dnd-action` — each needs
  the owner's OK. (Svelte 5 migration done 2026-09-06, so Svelte 5-only libraries are fine.)
- **Media handling:** originals → private collection (never publicly served);
  public collection holds web-res (~1600px) only; thumbnails come free via PocketBase's
  `?thumb=WxH` URL param. Protection layers: Cloudflare AI-bot blocking, robots.txt +
  noai meta + Content Signals, optional per-image Glaze (Achin's call — visible
  artifacts), C2PA later.
- **SEO rule:** all runtime fetches happen **server-side** (`+page.server.ts` load) so
  crawlers get full HTML. Plus sitemap.xml, robots.txt, per-page `<svelte:head>`,
  JSON-LD (`VisualArtwork`), og:image. A cached content snapshot ships with each deploy
  as fallback so a down VPS degrades the site instead of breaking it.
- **Content blocks:** all page prose is currently hardcoded in `.svelte` files
  (inventoried 2026-09-03: hero, ticker, statement + 中文 quote duplicated on `/` and
  `/about`, placeholder contact info, orphaned essay `src/routes/contact/article.js`).
  Becomes a `content_blocks` collection keyed by slug with `text_zh` / `text_en` fields.
  ⚠️ The contact form is currently fake (`handleSubmit` does nothing) — wire or remove.
- **Migration blockers unchanged from v1:** triage the 68 loose files in
  `src/lib/assets/` (works vs page imagery — needs the owner's eyes), then a one-time
  script: 224 images → PocketBase (originals private + web-res public) + seeded rows.
- **Open questions before approval:** (1) which VPS — Vultr or DO, and its specs;
  (2) who is the merchant of record — the owner (UK) or the artist (Taiwan)? Stripe doesn't
  fully operate in Taiwan; PayPal does. Tax/legal before code. (3) Glaze per-image: yes/no
  default.
- **Next step:** the owner approves v2 → full spec (collections schema, VPS hardening
  checklist, backup cron, admin flow, migration script plan) → then code.

---

*Everything below is the reasoning. Skip unless revisiting the decision.*

## 1. What changed since v1

v1 (2026-08-31) chose Supabase: managed Postgres + Storage + Auth, custom `/admin`.
The owner's review (2026-09-01→03) surfaced four things v1 under-weighted:

1. **Learning is a first-class constraint.** He is building a dev/cybersecurity career;
   a managed platform outsources exactly the skills (Linux hardening, TLS, reverse
   proxy, auth, backups, monitoring) he needs to practice.
2. **He already pays for idle VPSes** — self-hosting has zero marginal cost here.
3. **Media ≠ business data.** Serving images and storing transactional rows have
   opposite needs; v1 bundled them in one vendor. (v2 keeps them in one *binary* but
   the private/public split and Cloudflare edge do the media-serving work.)
4. **v1 omitted Supabase's 7-day free-tier auto-pause** — found and documented
   2026-08-31; a quiet week would have taken the site's data down.

## 2. The three candidates, honestly

| | Sveltia (git-based) | Supabase (managed BaaS) | PocketBase on VPS (chosen) |
|---|---|---|---|
| Core idea | repo IS the database; saves are commits; rebuild per change | rent Postgres+storage+auth; vendor runs everything | one Go binary you run; SQLite; everything yours |
| Orders/donations | ❌ impossible | ✅ | ✅ |
| Edit→live | 2–4 min rebuild | instant | instant |
| Cost | £0 | £0 with pause+egress caps, then $25/mo | £0 marginal (VPS already paid) |
| Learning value | low | medium | high — the point |
| Uptime owner | Netlify | vendor | **the site owner** — accepted trade |
| Exit path | files already in repo | `pg_dump` | copy one SQLite file + uploads dir |
| Day-1 admin UI | ✅ | ❌ must build | ✅ built-in |
| Credential blast radius | GitHub token = **code write** | data only | data only |

Sveltia is disqualified by orders alone. Supabase is the right pick for someone who
never wants to see a server; that is the opposite of this user.

## 3. Known risks of the chosen stack (accepted, mitigated)

- **You are the uptime.** VPS down = API down until fixed. Mitigation: Netlify frontend
  stays up; deploy-time content snapshot renders the site read-only; Cloudflare caches
  public images.
- **PocketBase is pre-1.0** — APIs move between releases. Pin the version; back up
  before upgrades; read changelogs.
- **SQLite single-writer ceiling** — irrelevant at one-artist scale; the documented
  outgrow-path is Postgres (and that migration is itself planned learning).
- **Server compromise risk** — mitigated by the hardening checklist (SSH keys only,
  ufw, fail2ban, unattended-upgrades, Cloudflare-only ingress) which is deliberately
  part of the project, not overhead.

## 4. Protection stack (2026 AI-crawler reality)

No storage product prevents copying of publicly displayed images. Defense in layers:
(1) never publish full resolution — originals stay in a private collection;
(2) Cloudflare AI-bot blocking + hotlink protection at the edge;
(3) machine-readable opt-outs (robots.txt AI blocks, noai/noimageai meta, Content
Signals) — legal groundwork under EU/UK TDM rules;
(4) optional Glaze/Nightshade per image before upload (artist's choice — visible cost);
(5) C2PA Content Credentials later for provenance.
Market check 2026-09-02: no vendor sells this whole stack for a self-owned site —
Cara/Kin.art bundle it only on their own platforms. (Noted in GTD as a startup idea.)
