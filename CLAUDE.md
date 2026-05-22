# CLAUDE.md — Project Memory for AI Agents & Humans
> Read this **first** before doing any work on this repo. Read `PLAN.md` second.

## 1. What This Project Is

A personal artist website for **Achin**.
- Portfolio of artwork (20+ pieces expected — needs pagination or category filter)
- Donation system (Stripe)
- Shop / merch (later phase, driven by client feedback)

**Aesthetic: minimal gallery** — whitespace-heavy, monochrome, art-first. Like a museum site. Avoid: heavy gradients, busy decoration, anything that competes visually with the artwork.

Owner works **1 day/week**. MVP target is **2 work-days**.

## 2. Stack — Stick To It

| Layer | Tool | Don't swap for |
|---|---|---|
| Framework | **SvelteKit 2** + Svelte 4 | React, Vue, Next.js |
| UI library | **Skeleton UI v2** | shadcn, Material, Chakra |
| Styling | **Tailwind v3** + OKLCH custom theme | CSS-in-JS, vanilla CSS modules |
| Adapter | **adapter-netlify** | Vercel, adapter-node |
| Language | **TypeScript** | plain JS |
| Payments | **Stripe** (Checkout hosted) | Shopify, PayPal-only, custom |

If you think you need to swap something, **ask first**. Constraints exist for a reason (see §6).

## 3. Where Things Live

```
src/
├── app.html              ← data-theme="custom-theme" — DO NOT remove
├── app.postcss           ← imports custom-theme.css
├── custom-theme.css      ← OKLCH design tokens — the design system
├── lib/
│   ├── assets/           ← static images bundled with code
│   └── components/       ← reusable Svelte components
└── routes/
    ├── +page.svelte      ← home (exists)
    └── (everything else) ← TODO per PLAN.md
```

## 4. Coding Conventions

- **Components** → PascalCase filename (`ArtworkCard.svelte`)
- **Routes** → SvelteKit standard (`+page.svelte`, `+layout.svelte`, `+server.ts`)
- **Server code** → in `+server.ts` files (API routes), never inline secrets in frontend
- **Tailwind** → use Skeleton's design tokens (`bg-surface-50`, `text-primary-500`) — don't hard-code hex
- **Images** → always include `width`, `height`, `loading="lazy"` (old mobile target)
- **No** `alert()` — use Skeleton Toast instead
- **No** new dependencies without checking with owner (bundle size matters)

## 5. Design System — Use These Tokens

The OKLCH theme in `custom-theme.css` defines:
- `primary` (blue-violet) — main CTAs
- `secondary` (purple) — accents
- `tertiary` (pink) — highlights
- `success` / `warning` / `error` — status colors
- `surface-50…950` — neutral grays (light to dark)

Always reference them via Tailwind classes (`bg-primary-500`) — never `#hex`.

## 6. Hard Constraints — Don't Violate

1. **Old mobile users matter** — target Chrome 70 era. No CSS-only features without flexbox fallback. Bundle size budget: <100KB JS on first load.
2. **Netlify only** — no Vercel-specific APIs, no edge runtime assumptions.
3. **No Shopify, no Wix, no Squarespace** — custom Stripe by design.
4. **Owner is learning** — when in doubt, explain *why*, not just *what*. They want to understand internals.
5. **Webhooks must verify signatures** — never trust webhook payloads without checking `Stripe-Signature`.

## 7. Current State (as of 2026-05-14)

✅ Done:
- SvelteKit scaffolded
- Skeleton UI v2 installed
- Netlify adapter configured
- Custom OKLCH theme system in place
- `DonationCard.svelte` UI exists (but Stripe call is faked with `console.log`)
- Home `+page.svelte` shows Achin profile + DonationCard

❌ Not done:
- `+layout.svelte` (no nav, no footer)
- Portfolio page
- Stripe wired
- Shop / merch
- Custom domain

See `PLAN.md` for the full phased roadmap and what to do today.

## 8. Known Bugs to Fix Casually

- `body { overflow: hidden }` in `app.postcss` — breaks mobile scroll
- `alert()` calls in `DonationCard.svelte` — swap for Skeleton Toast
- `adapter-auto` still in `package.json` devDeps — safe to remove

## 9. Secrets / Env Vars

Never commit. Live in Netlify dashboard:
```
STRIPE_PUBLIC_KEY      (pk_test_… for dev, pk_live_… for prod)
STRIPE_SECRET_KEY      (sk_test_… / sk_live_…)
STRIPE_WEBHOOK_SECRET  (whsec_…)
PUBLIC_SITE_URL        (https://achin.uk)
```

## 9b. Deployment — Netlify CLI Only (NOT GitHub)

This project is deployed by **Netlify CLI direct upload**, not via GitHub auto-deploy.

- Linked Netlify site ID: `e1587692-97c7-45d0-9ada-0e6db9fecdce`
- Live URL: **https://achin.uk**
- Link config: `.netlify/state.json` (do not delete)
- No git remote configured — code stays local

**Deploy commands:**
```bash
netlify status              # verify link
netlify deploy              # preview URL
netlify deploy --prod       # push to achin.uk
```

**For other AI agents:** Do NOT add a git remote or push to GitHub without owner approval. CLI-only is intentional.

## 10. When Stuck or Unsure

1. Re-read `PLAN.md` — the current phase tells you what to do
2. Re-read this file — constraints answer most questions
3. Update `PLAN.md` decision log if you make a choice that affects future work
4. Ask the owner — don't guess on Stripe, payments, or anything financial

---

*This file is the project's brain. Keep it updated. If you change a constraint, change this file in the same commit.*
