# Notes — dated small observations

Format: `- YYYY-MM-DD — note`. Bugs, questions, gotchas. Bigger things go to `AGENTS.md`
(orientation) or a `<topic>-design.md` (decisions). Delete entries once they're folded in.

- 2026-09-06 — After `npx sv migrate svelte-5`, `npm run check` showed many errors and
  `npm install` hit `ERESOLVE` (`vite-plugin-svelte@3` vs Svelte 5). Cause: the migrate tool
  updates `package.json` but not the lockfile. Fix: `rm -rf node_modules package-lock.json &&
  npm install`. Result: 0 errors. Rule added to `AGENTS.md` → Commands.
- 2026-09-06 — Migration exposed two lightbox bugs (fixed): the `run()` legacy shim never fired
  the close transition (`$state` bookkeeping), and `+page.svelte` mounted a second `<Lightbox />`
  which left `body.style.overflow = hidden` after closing. Rules in `AGENTS.md` → Conventions.
- 2026-09-06 — `npm run lint` fails on 21 files that nobody touched in this session + ESLint
  scanning `.netlify/`. Pre-existing; fix in its own commit.
