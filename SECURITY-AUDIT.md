# Security Audit — Achin Portfolio
> Conducted: 2026-05-15 · Stack: SvelteKit 2 · Skeleton UI v2 · Netlify · No backend yet

## File Naming Note
This file is named `SECURITY-AUDIT.md` (not `SECURITY.md`). The all-caps convention matches `CLAUDE.md` and `PLAN.md` (root project docs). `SECURITY.md` is reserved for the GitHub-standard **vulnerability reporting policy** — different purpose. Create that separately if/when going public.

---

## TL;DR — Severity Summary

| Severity | Count | Items |
|---|---|---|
| 🔴 Critical | 0 | None right now |
| 🟠 High | 2 | Stripe placeholder logs donor PII to console · No CSP headers |
| 🟡 Medium | 4 | Donor data lacks server validation · `alert()` exposes UX · No rate limiting plan · Skeleton UI v2 + Svelte 4 are mature but not on latest patches |
| 🟢 Low | 3 | `adapter-auto` unused dependency · No SECURITY.md policy · `.netlify/state.json` site ID committed |

**Current overall risk: LOW** — because there's no backend, no real payments, no user accounts, no DB. Risk rises sharply when Stripe + shop ship.

---

## 🔴 Critical — None Right Now
Nothing currently in the repo accepts user input that's persisted or transmitted to a real backend. The donation flow is faked (`console.log`). No accounts exist. No file uploads. No SQL.

> ⚠️ This will change the moment Stripe is wired. Re-audit before Phase 3 deploys.

---

## 🟠 High Severity Findings

### H1 — Donor PII Logged to Browser Console
**Location:** `src/lib/components/DonationCard.svelte` line ~9 (parent `+page.svelte` line ~9 `handleDonation`)
**What happens:** Donor name, email, amount, message printed to browser console via `console.log('Donation received:', ...)`.
**Risk:** On a real site, browser extensions, screen-share recordings, or third-party scripts can read console output. Counts as PII leakage under GDPR if EU users.
**Fix:** Remove `console.log`s before Phase 3 ships. Send to Stripe via server route only.

### H2 — No Content Security Policy (CSP) Headers
**Location:** No `netlify.toml`, no `+layout.server.ts` setting response headers
**What happens:** Browser will load any script from any origin if injected. No defense against XSS even though Svelte auto-escapes by default.
**Risk:** Defense-in-depth missing. If a future bug allows injected HTML (e.g. rendering markdown unsafely), CSP would block script execution. Without it, the bug becomes a full XSS.
**Fix:** Add `netlify.toml` with security headers:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
```
Adjust CSP when adding Stripe.js and any analytics.

---

## 🟡 Medium Severity Findings

### M1 — Client-Only Validation on Donation Form
**Location:** `DonationCard.svelte` lines 35–43 — only checks `alert()` if invalid
**What happens:** If a malicious user disables JS, they can submit anything. (Currently moot — no backend exists.)
**Fix when wiring Stripe:** Re-validate `amount > 0`, `email` format, `name` non-empty server-side in `+server.ts` before creating the payment intent. **Never trust client input.**

### M2 — `alert()` Used for Errors
**Location:** `DonationCard.svelte` lines 36, 41, 60, 70
**Risk:** Not strictly a security issue but `alert()` is a phishing vector — looks system-modal, breaks accessibility, and attackers love it for social-engineering proof-of-concepts. Also bad UX.
**Fix:** Replace with Skeleton UI Toast notifications.

### M3 — No Rate Limiting Plan for Future Endpoints
**Location:** N/A yet — but `PLAN.md` Phase 3 will add `/api/create-payment-intent` and `/api/webhook`
**Risk:** Without rate limiting, a bot can trigger thousands of Stripe API calls (wasting your Stripe quota and inviting Stripe to flag the account).
**Fix when implementing API routes:** Add Netlify edge rate limiting via `netlify.toml` or use a token-bucket library at the handler level. Stripe also has built-in abuse prevention but front it yourself too.

### M4 — Dependencies Not on Latest Patches
**Location:** `package.json`
**Observation:**
- `svelte: ^4.2.7` — Svelte 5 is current, security patches still backported to 4.x but reduced cadence
- `@skeletonlabs/skeleton: ^2.11.0` — Skeleton 3.x exists, v2 still supported
- `vite: ^5.0.3` — current major is 6, several Vite 5 CVEs were patched in later 5.x releases
**Fix:** Run `npm outdated` and `npm audit` periodically. Schedule a dependency review every 3 months.

---

## 🟢 Low Severity Findings

### L1 — Unused `adapter-auto` in devDependencies
**Location:** `package.json` line 17 — `@sveltejs/adapter-auto`
**Why low:** `svelte.config.js` uses `adapter-netlify`, so `adapter-auto` is dead weight. Not a security issue, but unused deps = larger attack surface and slower `npm install`.
**Fix:** `npm uninstall @sveltejs/adapter-auto`.

### L2 — No `SECURITY.md` Vulnerability Reporting Policy
**Why low:** Project is private (no GitHub remote) and small. If you ever make it public, add `SECURITY.md` with a contact email so finders can report responsibly.

### L3 — `.netlify/state.json` Contains Site ID
**Location:** `.netlify/state.json` — has `siteId: e1587692-...`
**Why low:** Site ID alone isn't a secret — knowing it doesn't grant deploy access (that needs CLI auth tokens). Still, treat as `.gitignored` in most public repos. Currently fine because no public remote.

---

## Secrets Hygiene — ✅ Currently Clean

- `.gitignore` excludes `.env`, `.env.*` (correct)
- No `.env` file present in repo (verified, doesn't exist)
- No hardcoded API keys, tokens, or secrets found in `src/`
- Netlify CLI tokens live in `~/.netlify/config.json` (outside the repo) — good
- No Stripe keys present yet — will arrive in Netlify dashboard env vars, never in code

**Watch list for future:**
- Don't commit `.env.local`, `.env.production`
- Don't paste Stripe `sk_*` keys into Svelte files (must live in `+server.ts` only, sourced from `process.env`)
- Don't expose `sk_*` via `import.meta.env.VITE_*` — `VITE_` prefix exposes to client

---

## Deploy Pipeline Security — Mixed

| Aspect | Status | Note |
|---|---|---|
| Deploy auth | ✅ | Netlify CLI uses OAuth, no shared keys |
| Source code in transit | ✅ | HTTPS upload to Netlify |
| Production HTTPS | ✅ | Netlify auto-issues Let's Encrypt for achin.uk |
| Branch protection | ⚠️ | No GitHub remote = no PR review gate. CLI deploy from any logged-in machine pushes to prod |
| Two-person review | ⚠️ | Solo dev pattern. Risk: typo deploys go live with no second pair of eyes |
| Rollback path | ⚠️ | Netlify keeps deploy history, but no `git revert` workflow without GitHub |

**Recommendation:** When stakes rise (real money via Stripe), consider adding GitHub remote + Netlify-from-GitHub auto-deploy with branch protection. CLI deploy stays available for emergencies.

---

## Phase 3 (Stripe) Pre-Flight Checklist

Before deploying real payments:

- [ ] Remove all `console.log` of donor data
- [ ] Server-side validate amount, email, name in `+server.ts`
- [ ] Verify `Stripe-Signature` header on every webhook request — never trust raw payload
- [ ] Use `stripe.webhooks.constructEvent()` not manual parsing
- [ ] Store webhook secret in Netlify env, never in repo
- [ ] Idempotency keys on `paymentIntents.create` to prevent double-charges
- [ ] Add CSP including `https://api.stripe.com` and `https://js.stripe.com`
- [ ] Add rate limiting on `/api/create-payment-intent`
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:5173/api/webhook`
- [ ] Test failed/cancelled flows, not just happy path
- [ ] Set up Stripe Radar (their fraud detection) — free with Stripe
- [ ] Configure Stripe Tax if selling across regions

---

## Phase 4 (Shop) Pre-Flight Checklist

Adds these concerns:

- [ ] Cart data trust boundary — recompute totals server-side, never trust client cart
- [ ] Stock/inventory race conditions — atomic decrement, or accept oversells gracefully
- [ ] Digital downloads — signed URLs with expiry, never link directly to S3/Bucket
- [ ] Customer accounts (if any) — bcrypt/argon2 passwords, never plain text, never homemade JWT
- [ ] Order data PII — minimize collected, encrypt at rest if storing
- [ ] Refund flow — admin auth required, all refunds logged
- [ ] Shipping address validation — strip XSS, store as plain text not HTML

---

## Re-Audit Triggers

Run a fresh audit before any of these ships:
- ✅ Real Stripe integration (Phase 3)
- ✅ Shop / product pages (Phase 4)
- ✅ Customer login / accounts
- ✅ Any file upload feature (artist admin panel)
- ✅ Adding a new third-party script (analytics, chatbot, etc.)
- ✅ Going public on GitHub

---

## Audit Methodology Notes

This audit reviewed:
- All files in `src/` recursively
- `package.json`, `.gitignore`, `.git/config`
- `.netlify/state.json`
- `svelte.config.js`, `app.html`, `app.postcss`
- Live site at https://achin.uk (HTTP response signatures)

Not reviewed (no relevant code yet):
- API routes (none exist)
- Database queries (no DB)
- Authentication logic (no accounts)
- Image upload handlers (none)

---

*Update the Severity Summary table at the top whenever findings change. Date every entry.*
