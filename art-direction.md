# Art direction — how the work is shown

Source of truth for visual presentation. Every pipeline, component, and CSS decision obeys this.
Confirmed by the owner 2026-09-06 unless marked otherwise. Verified against the repo 2026-09-06.

## The rule

**Show each painting as it is.** No crops, no edits, no filters, no overlays, nothing that tints
or alters the artwork. The site is a white wall; the work is the only colour.

## Confirmed rules

- **White canvas** (2026-08-30): `--paper: #ffffff`; warm near-whites for bands; never cream or
  beige, never cold grey, no darkening/multiply overlay, no paper grain.
- **One accent** — `--oxblood`. Everything else neutral.
- **Minimal chrome on art routes** — `/gallery` and `/sketch` use `body.minimal-canvas`: no
  sidebar/topbar borders, no footer, no frame mat, no pull-hint pill on mobile (artist's choice —
  discoverability traded for stillness).
- **Image pipeline may only:** resize keeping aspect, strip metadata, convert to sRGB. It may
  **never** crop, sharpen, filter, or watermark visibly.
- **No Glaze / Nightshade by default** — they perturb the image. Per-image opt-in only, and only
  the artist decides.
- **Bilingual 中/EN** labels everywhere; Chinese first, English companion.
- **Three-font roles:** serif = voice, sans = interface, mono = annotation.

## Known violation — to fix

The **desktop works grid crops paintings**: `.work .frame img { object-fit: cover }`
(`portfolio.css` ≈ line 860) inside fixed `aspect-ratio` shapes (4/3, 4/5, 1/1, 3/4, 5/4, 16/10
per `data-shape`). Mobile is correct — `object-fit: contain` (≈ line 1070), aspect preserved.
Fix: desktop must also `contain` (or derive each cell's aspect from the image's real dimensions);
the editorial "shape" pattern yields to the painting, never the reverse. **Not started.**

## Missing — collect from the artist

Text in Achin's own words describing the style and mood he wants the site to carry: references
he likes, what he dislikes, how the work should sit on the page. Needs a short interview.
Until it exists, the rules above are the guideline.
