# CMS design — images + painting metadata

## AGENT BRIEF — read this block only; stop at the line unless you need the reasoning

- **STATUS: PROPOSED, NOT APPROVED.** Do not implement. Do not install Supabase.
- **Problem:** `src/lib/assets/` is the editing surface. **224 images, 65 MB, all in git**
  (`gallery/` 75 · 34 MB, `sketch/` 81 · 14 MB, loose at root 68 · 16 MB), iPhone UUID
  filenames, no thumbnails, every content change needs a redeploy.
- **Decision pending:** Approach A — Supabase (Postgres + Storage + Auth) with a custom
  `/admin` route in this SvelteKit app. Rejected: Sveltia CMS (git-based), Sanity.
- **Constraints:** £0 now, no vendor lock-in, Achin (non-technical) maintains it himself,
  must extend to other artists later.
- **Shape:** pixels → object storage + CDN; metadata → database rows
  (`title_zh`/`title_en`, year, medium, size, sold, sort order, `artist_id`);
  site fetches at runtime instead of at build time.
- **Superseded on approval:** `src/lib/data/works.ts` (Vite glob + `.jpg.json` sidecars).
  The sidecar system was designed but never used — zero sidecars exist.
- **Blocker for any approach:** 224 UUID filenames need a one-time migration script
  (read image → generate thumbnail → seed metadata row), or Achin faces 224 untitled works.
  The 68 loose files at the root of `src/lib/assets/` must first be triaged — some are
  page imagery (e.g. `pro.jpg` portrait), not catalogue works.
- **Next step:** Jeffery approves A → full spec (schema, storage layout, admin flow,
  migration, fetch-failure fallback) → then code.

---

*Everything below is the reasoning behind the brief. Skip it unless you are revisiting
the decision.*

## 1. The question (tidied)

> We're going to need a CMS for all the images and their corresponding data — the
> description data for each painting. Instead of storing them in the assets folder,
> is there a better way to store them?

## 2. Why the assets folder is wrong

Not wrong for *serving* files — wrong as the **editing surface**:

1. Git bloat — every image revision stored forever.
2. No upload UI — Achin cannot add a painting without a developer.
3. No thumbnails — the grid downloads full-size originals (several are 1.3 MB).
4. Every content change requires a rebuild and a redeploy.

## 3. The three approaches

### A. Supabase + custom `/admin` route — recommended

Postgres for metadata, Supabase Storage for images, Supabase Auth for login. Admin page
built inside the existing app.

- £0: 500 MB DB, 1 GB storage, 5 GB bandwidth/month — the 65 MB library fits ~15×
  (originals + generated thumbnails roughly double stored bytes).
- Zero lock-in: plain Postgres, S3-compatible storage. `pg_dump` and leave.
- Multi-artist = one `artist_id` column, not a new stack.
- Email login, no GitHub account required.
- Cost: the admin UI must be built (~2–3 sessions).
- Thumbnails generated in-browser on upload (canvas resize). Supabase's transform API is
  paid; this approach does not need it.

### B. Sveltia CMS (git-based) — rejected

Admin UI committing Markdown + images to GitHub. Free forever, no backend.
Rejected because: Achin needs a GitHub account; every save triggers a rebuild; images
stay in git; multi-artist means one repo per artist.

### C. Sanity (hosted headless CMS) — rejected

Best editing UI, free image CDN with on-the-fly resizing. Rejected because: the Studio is
React and deploys separately from SvelteKit, and content lives in Sanity's dataset —
exportable as NDJSON, but real lock-in.

### Why A

The only option satisfying all four constraints at once: free, portable,
painter-friendly login, multi-artist-ready.
