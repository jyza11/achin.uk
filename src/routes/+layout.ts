// Prerender the public routes at build time — static site, rebuilt on content change
// (PocketBase → Netlify build hook). See AGENTS.md › Deployment.
// `/admin` opts out on its own (`src/routes/admin/+layout.ts`: prerender = false, ssr = false).
export const prerender = true;
