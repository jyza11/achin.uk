# Session Notes — Bootstrap + Skill Creation
> Session span: 2026-05-14 → 2026-05-21
> Scope: Document the Achin portfolio project + build a reusable `project-bootstrap` skill

---

## TL;DR

Two parallel outcomes from this session:

1. **Achin portfolio project documented** — added PLAN.md, CLAUDE.md, SECURITY-AUDIT.md, hardened netlify.toml, and a design brief for AI handoff
2. **`project-bootstrap` skill drafted + tested** — a reusable Claude Code skill that produces the same three docs for any future project. Lives in `~/.claude/skills/project-bootstrap/`

Both are **uncommitted** and ready for owner review before any merge or ship.

---

## Decisions Made

| # | Decision | Reasoning |
|---|---|---|
| 1 | Stack: SvelteKit 2 + Skeleton UI v2 + Tailwind v3 + Netlify | Already in repo, owner familiar; lighter than Next.js for old-mobile target |
| 2 | Old mobile (Chrome 70-era) is a hard constraint | Owner's actual user base includes older devices |
| 3 | Netlify CLI deploy, NOT GitHub auto-deploy | Owner preference; keeps code local; faster iteration |
| 4 | Custom Stripe over Shopify | Owner wants to learn internals (hacker-research goal) |
| 5 | Stripe Checkout (hosted) over Stripe Elements for MVP | Less PCI burden, faster MVP, old-mobile compatibility |
| 6 | MVP scope: Portfolio gallery first, then donation, then shop | Driven by client feedback; matches one-day-a-week cadence |
| 7 | MVP target: 2 work-days (≈ 2 weeks calendar) | Realistic for owner's 1 day/week schedule |
| 8 | Aesthetic locked: **minimal gallery** (whitespace, monochrome, art-first) | Owner chose after seeing 4 options |
| 9 | Artist display name: **Achin** | Keep existing name, no rebrand |
| 10 | File naming convention: SECURITY-AUDIT.md (internal audit), NOT SECURITY.md (public policy) | Distinguishes from GitHub-standard vulnerability reporting file |
| 11 | netlify.toml lives in BOTH branches now | Was deploy-only; security headers + cache rules added |
| 12 | Categories config = single source of truth (`src/lib/config/categories.ts`) | Lets artist rename/add categories without code changes — fulfills "flexible" requirement |
| 13 | AI agents must NOT run git/deploy commands | Owner reviews and commits manually; safety rail |
| 14 | Skill location: `~/.claude/skills/project-bootstrap/` (user-level) | Reusable across all future projects |
| 15 | Skill tested in vibe-check mode (no formal assertions) | Faster iteration for subjective skill |

---

## Owner's Answers Captured

| Question | Answer |
|---|---|
| Artist display name | Achin |
| Aesthetic | Minimal gallery |
| Domain | Owner already has one (achin.uk confirmed live) |
| Day 1 images | 20+ images coming, use existing folders (sketch + canvas) |
| Folder structure flexibility | Yes — categories must be flexible, artist may rename later |
| Existing categories detected | `src/lib/assets/sketch/`, `src/lib/assets/gallery/` (canvas paintings) |
| Existing routes | `/sketch` and `/art` using `import.meta.glob` pattern |
| Agent isolation preference | Branch-per-agent for review (then deferred — too risky) |
| Git operations by AI | NOT allowed (owner-only safety rule) |
| Deployment method | Netlify CLI direct, keep CLI-only |
| Skill scope | Generic (works for any web project) |
| Repo states supported | Both empty and existing codebases |
| Output files | PLAN.md + CLAUDE.md + SECURITY-AUDIT.md (no README) |
| Test scenarios | All 3 (SvelteKit inherited, Next.js greenfield, Flask existing) |

---

## Files Created This Session

### Achin project (`/Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/`)
| File | Purpose | State |
|---|---|---|
| `PLAN.md` | Weekly working plan, MVP roadmap | Uncommitted |
| `CLAUDE.md` | AI agent memory file | Uncommitted |
| `SECURITY-AUDIT.md` | Security audit with severity table | Uncommitted |
| `netlify.toml` | Hardened with CSP, HSTS, cache rules, source map blocking | Uncommitted (master only) |
| `netlify.deploy.toml` | Extracted from deploy branch for comparison | Uncommitted |
| `docs/briefs/portfolio-design.md` | Self-contained brief for Claude Design handoff | Uncommitted |
| `.claude/launch.json` | Dev server config for preview tool | Uncommitted |
| `docs/sessions/2026-05-session-bootstrap-and-skill.md` | This file | Uncommitted |

### Skill (`~/.claude/skills/project-bootstrap/`)
| File | Purpose |
|---|---|
| `SKILL.md` | Main skill workflow + triggers |
| `references/plan-template.md` | PLAN.md structure + section-by-section guidance |
| `references/claude-md-template.md` | CLAUDE.md structure + guidance |
| `references/security-audit-template.md` | SECURITY-AUDIT.md structure + guidance |
| `references/stack-detection.md` | How to identify common stacks from package.json + configs |

### Test workspace (`~/.claude/skills/project-bootstrap-workspace/iteration-1/`)
- 3 evals × 2 configs each = 18 markdown outputs ready for review
- `evals/evals.json` — 3 test prompts
- `eval_metadata.json` + `timing.json` per run

---

## Test Results Summary (Agent Self-Reports)

| Eval | With-skill outcome | Baseline outcome |
|---|---|---|
| 0 — SvelteKit inherited | Found 1 High (donor PII), 3 Med, 3 Low. Used [TBC] placeholders correctly. 14 tool uses, 215s. | Found 10 findings, recommended Stripe Checkout. 9 tool uses, 378s. |
| 1 — Next.js greenfield | 0/0/0/0 severity (no code yet), focused on pre-flight checklists. 9 tool uses, 183s. | 12-section threat model. 4 tool uses, 193s. |
| 2 — Flask existing API | **1 Critical (JWT_SECRET fallback), 4 High (never-expiring JWT, IDOR, PII in print, unverified webhook), 4 Med, 3 Low.** 13 tool uses, 235s. | P0-P3 priority roadmap, flagged inline comments as real bugs. 8 tool uses, 141s. |

**Observation:** With-skill uses ~70% more tokens (reads the 4 reference templates) but produces more structured output. On the Flask case, with-skill correctly classified JWT_SECRET as Critical — baseline did not.

---

## What's Done vs Pending

### ✅ Done
- Achin project audited and documented
- `project-bootstrap` skill written (5 files)
- 6 test runs completed successfully
- Timing data captured for all 6 runs
- Decision log this file

### ⏳ Pending
- Review the 18 test markdown files (manual or via eval viewer)
- Iterate skill v2 based on review feedback
- Run description-optimization loop (improves skill triggering accuracy)
- Package skill as `.skill` file for sharing
- Owner: decide which files in Achin repo to commit (currently all uncommitted)
- Owner: decide whether to merge netlify.toml to deploy branch
- Phase 1 build (Layout shell + Portfolio page) — was paused before agent spawn

---

## Known Issues Discovered

| Issue | Location | Severity |
|---|---|---|
| Donor PII logged to browser console | `src/routes/+page.svelte` line 9 (`handleDonation`) | 🟠 High |
| `body { overflow: hidden }` breaks mobile scroll | `src/app.postcss` | 🟠 High |
| `alert()` used for validation errors | `src/lib/components/DonationCard.svelte` | 🟡 Medium |
| Both `adapter-auto` and `adapter-netlify` in devDeps | `package.json` | 🟢 Low |
| No CSP / security headers (before this session) | Now fixed in new netlify.toml | Was 🟠 High |

---

## Open Questions for Next Session

- [ ] Commit the new Achin docs (PLAN, CLAUDE, SECURITY-AUDIT) to master? Or keep uncommitted while iterating?
- [ ] Merge hardened netlify.toml to deploy branch? Or consolidate branches entirely?
- [ ] Review the 18 test markdown files to confirm skill v1 ships?
- [ ] Run description-optimization for better skill triggering?
- [ ] Package the skill into a `.skill` file?
- [ ] Begin Phase 1 build (Layout shell + Portfolio page)?
- [ ] Stop the localhost:5173 dev server (likely still running from earlier)?

---

## How To Resume This Work (Paste in Fresh Claude Session)

```
Resume work on Achin portfolio + project-bootstrap skill.

Files to read first:
- /Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/CLAUDE.md
- /Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/PLAN.md
- /Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/docs/sessions/2026-05-session-bootstrap-and-skill.md

Skill workspace:
- ~/.claude/skills/project-bootstrap/SKILL.md (the skill)
- ~/.claude/skills/project-bootstrap-workspace/iteration-1/ (test outputs, 18 markdown files waiting for review)

Continue from the "Open Questions for Next Session" list in the session notes.
```

---

## Lessons / Best Practices Captured

1. **A plan you don't re-read is a journal entry** — optimize for Monday-morning re-readability
2. **Skills cost ~100 tokens; MCPs cost ~55,000** — prefer skills, use MCPs only for live data
3. **Branch-split deploy patterns add audit blind spots** — unless deploy config differs meaningfully, keep one source of truth on master
4. **Categories config file > hardcoded routes** — one line to add a category, zero code elsewhere
5. **Subagents need worktrees OR same-dir + non-overlapping files** — both work, both safe
6. **Vibe-check first, formal assertions later** — saves time for subjective skills
7. **AI should not run git/deploy commands unless explicitly asked** — safety rail
8. **Test fixtures should include intentional bugs** — proves the skill catches them (Flask JWT_SECRET worked perfectly)

---

*This session note was authored at the user's request as a single resume-friendly artifact. Future agents should treat it as canonical for this work span.*
