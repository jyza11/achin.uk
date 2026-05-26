# Dependency Management Runbook
> Procedure for keeping npm dependencies safe and reproducible.

## When to run this
- **Quarterly** at minimum (set a calendar reminder)
- **Before** starting any new Phase (per PLAN.md)
- **Whenever** `npm audit` warns about a Critical or High CVE
- **After** any framework upgrade (SvelteKit, Vite, Skeleton UI)

---

## The Procedure (10–20 min)

### 1. Capture baseline (read-only)

```bash
cd my-skeleton-app

# Confirm working state first
npm run dev    # Ctrl+C once it starts cleanly
# If this fails, STOP. Fix dev server before continuing.

# Snapshot versions
node --version
npm --version

# Find vulnerabilities
npm audit

# Find stale packages
npm outdated
```

### 2. Triage findings

For each `npm audit` finding, classify:

| Severity | Action |
|---|---|
| 🔴 Critical | Fix immediately. Block deploys until resolved. |
| 🟠 High | Fix within 1 work session. |
| 🟡 Moderate | Fix in current Phase or document why deferred. |
| 🟢 Low | Note in SECURITY-AUDIT.md Audit History, address quarterly. |

For each `npm outdated` row, classify:

| Difference | Action |
|---|---|
| Patch only (1.2.3 → 1.2.5) | Run `npm update <pkg>` — usually safe |
| Minor (1.2.x → 1.3.x) | Read changelog. Update if no breaking changes. |
| Major (1.x → 2.x) | Read migration guide. Schedule as its own task. |

### 3. Apply fixes — carefully

**Preferred path** (works for most patch + minor updates):
```bash
npm audit fix             # auto-fixes patches that don't break peer deps
npm run dev               # confirm still works
git diff package*.json    # review what changed
```

**If `npm audit fix` proposes a major version bump:**
- Do NOT use `--force` blindly
- Read the package's changelog
- Plan it as its own task in PLAN.md

**Before any `npm uninstall <pkg>`** — verify the import graph:
```bash
grep -rE "from ['\"]@?<package-name>" src/ *.config.* *.ts *.js
```
If grep returns matches, do NOT uninstall. (Lesson learned 2026-05-25.)

### 4. Test the new tree

```bash
rm -rf node_modules     # optional but proves cleanliness
npm ci                  # strict install from lockfile
npm run build           # full production build
npm run dev             # confirm dev still starts
```

If any step fails, restore the lockfile:
```bash
git checkout HEAD -- package.json package-lock.json
```

### 5. Document in SECURITY-AUDIT.md

Add a dated entry to the "Audit History" section:

```markdown
### YYYY-MM-DD — quarterly dep audit
- npm audit: [N] critical, [N] high, [N] moderate, [N] low
- Fixed: [list]
- Accepted (deferred): [list with reason]
- Upgraded packages: [package@old → @new]
- Next audit due: [YYYY-MM-DD]
```

### 6. Commit (when ready)

```bash
git status                                  # review
git add package.json package-lock.json SECURITY-AUDIT.md
git commit -m "chore(deps): quarterly audit — patch updates + CVE fixes"
```

---

## Reference: What's Pinned and Why

| Pin | Where | Why |
|---|---|---|
| Node major version | `.nvmrc` + `package.json` engines | Match production (`netlify.toml` NODE_VERSION) |
| Exact dep versions | `package-lock.json` | Reproducible installs across machines |
| `engine-strict=true` | `.npmrc` | Install fails on wrong Node, not just warns |
| `audit-level=moderate` | `.npmrc` | `npm audit` exits non-zero for moderate+ CVE |
| `save-prefix=~` | `.npmrc` | New deps default to patch-only updates |

---

## Recovery Recipes

### "I broke the lockfile"
```bash
git checkout deploy -- package-lock.json  # restore from production-tested branch
npm ci                                     # strict install
```

### "npm install fails with ERESOLVE peer dep conflict"
```bash
# DON'T run npm install --force or --legacy-peer-deps as first step
# Instead:
git checkout HEAD -- package.json package-lock.json   # rollback
npm ci                                                  # restore working state
# Then read the conflict carefully and decide manually
```

### "I want to update one package safely"
```bash
npm install <pkg>@<exact-version>  # explicit, not 'latest'
npm run dev                         # smoke test
npm run build                       # build test
# Commit only if both pass
```

---

## Tools NOT Currently Used (would be improvements)

If/when this project moves to a GitHub remote:

| Tool | Why valuable |
|---|---|
| **Dependabot** | Auto-opens PRs for dep upgrades; reads `engines` and respects lockfile |
| **GitHub Security Advisories** | Tracks CVEs per dep without needing local `npm audit` |
| **Renovate Bot** | More configurable than Dependabot; supports more file types |
| **Socket.dev** | Supply-chain attack detection (typo-squatting, malicious updates) |
| **CodeQL** | Static analysis for vulns in your own code |

Until GitHub remote: stick with this runbook + manual `npm audit` quarterly.

---

## Anti-Patterns (Things That Bit Us)

1. **Deleting `package-lock.json` to "force a fresh install"** — without the lockfile, npm resolves to latest matching ranges, which may pull incompatible peer deps. Always `npm ci` first; only delete the lockfile if you have a clear recovery path.

2. **Recommending `npm uninstall` without checking imports** — broke the build on 2026-05-25. Always `grep` for the package's import string in source files first.

3. **Running `npm install --force`** — bypasses ERESOLVE but doesn't fix the underlying conflict. Use only as a temporary diagnostic, never commit the resulting lockfile.

4. **Trusting "latest" in tutorials** — they age. Pin versions in real projects.

---

*Last updated: 2026-05-25 — Initial runbook authored after dep crisis recovery.*
