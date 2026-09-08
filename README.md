# achin.uk

Website for **Achin**, a painter based in Taipei — paintings, sketches, exhibitions, contact.
Bilingual (中文 / English). Built with SvelteKit; content is managed in a small self-hosted CMS
(PocketBase) so the artist can upload work and edit text himself.

> Working on this repo with an AI agent, or want the full picture (design decisions, conventions,
> current state)? Read **[AGENTS.md](AGENTS.md)** — it is the source of truth. This README is the
> short human version.

## Stack

| | |
|---|---|
| Site | SvelteKit 2 · Svelte 5 · TypeScript · hand-written CSS (`src/lib/styles/portfolio.css`) |
| CMS | [PocketBase](https://pocketbase.io) — one binary: SQLite + auth + file storage + admin dashboard |
| Hosting | Site on Netlify · CMS on a self-hosted Linux server behind Caddy + Cloudflare |

## Run it locally

```bash
npm install
cp .env.example .env          # PUBLIC_PB_URL=http://127.0.0.1:8090
```

**CMS (PocketBase).** Download the release for your OS from
[pocketbase/pocketbase releases](https://github.com/pocketbase/pocketbase/releases) — the version
the schema was written against is in `AGENTS.md` › Commands — verify the sha256 against the
release's `checksums.txt`, and put the binary at `pocketbase/pocketbase`. Then:

```bash
./pocketbase/pocketbase superuser upsert you@example.com <password> --dir=./pocketbase/pb_data
./pocketbase/pocketbase serve --http=127.0.0.1:8090 --dir=./pocketbase/pb_data --migrationsDir=./pocketbase/pb_migrations --hooksDir=./pocketbase/pb_hooks
```

Dashboard: <http://127.0.0.1:8090/_/>. Collections are created automatically from
`pocketbase/pb_migrations/` on first start; `pocketbase/pb_hooks/` holds the image pipeline
(originals kept private, a 2400 px web copy served to the site).

**Site.** In a second terminal:

```bash
npm run dev                    # http://localhost:5173
node scripts/seed-dev.mjs      # optional: one sample painting + the /about text (reads pocketbase/.env.dev)
```

The site works without the CMS running — it falls back to the images bundled in
`src/lib/assets/` and the text written into the pages.

## Editing content

Log in to the dashboard and edit two collections:

- **works** — one row per painting or sketch: bilingual title and description, year, medium,
  size, sold, `collection` (gallery / sketch), `sort`, `status` (draft / published), `image`.
  Only *published* rows appear on the site.
- **content_blocks** — page text by slug (`about.quote`, `about.statement`, …) with `text_zh`
  and `text_en`.

Upload the painting as photographed. The site never crops or edits artwork; it only requests
resized copies. If a work drops back to draft right after upload, its image could not be
processed — export it as JPEG and upload again.

## Structure

```
src/routes/            pages: / gallery sketch about contact events  (+page.server.ts = CMS loads)
src/lib/components/    WorksGrid, Lightbox
src/lib/server/        PocketBase client + loaders with local fallback (server-only)
src/lib/styles/        portfolio.css — all design tokens and styles
src/lib/assets/        bundled images (fallback content until fully migrated to the CMS)
pocketbase/            pb_migrations/ = the schema (committed) · binary, pb_data/, .env.dev = local only
scripts/               dev seed
```

## Checks before you commit

```bash
npm run check && npm run lint && npm run build
```

## Rights

All artwork © Achin. The paintings and sketches in this repository and on the site are not
licensed for reuse, redistribution, or training of machine-learning models.
