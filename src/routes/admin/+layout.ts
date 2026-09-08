// /admin is a client-only app talking straight to PocketBase from the browser — the public
// site keeps its server-side loads (see src/routes/*/+page.server.ts) and is unaffected.
export const ssr = false;
export const prerender = false;
