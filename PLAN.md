# Achin Portfolio + Shop — Plan
> Updated: 2026-05-14 · Owner works **1 day/week** on this

## 🎯 Done Means
> A live portfolio site Achin can show clients, with donation working — within **2 work-days** (≈ 2 weeks calendar).

---

## ⏭️ This Work-Day (Day 1 of MVP — Portfolio Only)

1. Fill in the 4 **Blockers** below (~15 min)
2. Build `+layout.svelte` with Nav + Footer
3. Build `/portfolio` page + 1 `ArtworkCard` component
4. Deploy to Netlify (even with placeholder content) — proves pipeline

**End-of-day success:** portfolio page is visible on a `*.netlify.app` URL.

---

## ✅ Locked-In Blockers

- [x] Artist display name → **"Achin"**
- [x] Aesthetic → **Minimal gallery** (lots of whitespace, monochrome, art-first)
- [x] Domain → **Owner already has one** (waiting for the name)
- [x] Image plan → **Day 1 uses placeholders**, real 20+ artworks swapped in before launch
- [ ] 1-sentence bio (still needed for nav/hero)

## 🎨 Decisions (pick when convenient)

- [ ] Languages — EN only, ZH only, or both?
- [ ] Light/dark mode — both or one? (Minimal-gallery aesthetic usually = light only)
- [ ] Stripe keys — wait until Day 2

---

## 🪜 Phases — MVP First

### MVP — 2 work-days
| Day | Phase | Size | What ships |
|---|---|---|---|
| **Day 1** | Layout + Portfolio | **L** | Nav, Footer, /portfolio page, 5 artworks, deployed |
| **Day 2** | Donation wired to real Stripe | **L** | DonationCard takes test payments, webhook works |

### After MVP — driven by client feedback
- Shop / merch (whenever client confirms products)
- Multi-language
- Cart + multi-product checkout
- Email receipts (Resend)
- Print-on-demand (Printful) if physical merch
- Admin: artist uploads art without dev help
- Analytics (Plausible)

**Size key:** S = <1hr · M = 2–4hr · L = full day · XL = multi-day

---

## ⚠️ Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Day 1 scope creep → portfolio never ships | **High** | Hard stop: deploy something at end of Day 1, even ugly |
| Stripe webhook signature bug → fake payments succeed | Medium | Verify `Stripe-Signature` server-side, test with `stripe listen` |
| Stripe rejects account flag | Medium | Have PayPal donate button as fallback |
| Image rights unclear | Medium | Confirm with artist before publish |
| Old-mobile users can't checkout | Low | Use Stripe Checkout (hosted) — they handle compat |

---

## 💰 Costs (rough monthly)

| Item | Cost |
|---|---|
| Netlify free tier | $0 |
| Domain `.com` | ~$12/year |
| Stripe | 2.9% + $0.30 per transaction |
| **Starting total** | **~$1/mo** |

---

## 🐛 Known Bugs in Current Code

- `body { overflow: hidden }` in `app.postcss` → kills mobile scroll
- `alert()` in `DonationCard.svelte` → replace with Skeleton Toast
- No `+layout.svelte` exists → pages have no nav/footer
- Both `adapter-auto` and `adapter-netlify` in devDeps → drop `adapter-auto`

---

## 📝 Decision Log

- `2026-05-15` — Live URL is **https://achin.uk** (already deployed once)
- `2026-05-15` — Deploy method = **Netlify CLI only**, NO GitHub remote (intentional)
- `2026-05-15` — Aesthetic locked: **minimal gallery** (whitespace, monochrome, art-first)
- `2026-05-15` — Artist name locked: **"Achin"**
- `2026-05-15` — Domain owned by client (specific name TBC)
- `2026-05-15` — 20+ artworks expected → portfolio needs pagination or filter, not just a grid
- `2026-05-14` — 1 day/week cadence, 2 work-days for MVP
- `2026-05-14` — MVP = portfolio first, donation second, shop later (driven by client)
- `2026-05-14` — Custom Stripe over Shopify (learning + control)
- `2026-05-14` — Netlify over Vercel (user preference)
- `2026-05-14` — Stripe Checkout (hosted) over custom Elements for MVP

---

*Re-read this at the start of every work-day. AI agents: also read `CLAUDE.md`.*
