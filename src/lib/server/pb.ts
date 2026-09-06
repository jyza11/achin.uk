import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

// Server-only client. Pages fetch in `+page.server.ts` so crawlers get full HTML
// (see AGENTS.md › CMS design › SEO rule). No auth: the site reads public rows only.
export const PB_URL = env.PUBLIC_PB_URL ?? 'http://127.0.0.1:8090';

export function pbClient(): PocketBase {
	const pb = new PocketBase(PB_URL);
	// Node has no request lifecycle to dedupe against; disable auto-cancellation.
	pb.autoCancellation(false);
	return pb;
}

// Give up fast when the backend is down so the page falls back instead of hanging.
export const PB_TIMEOUT_MS = 3000;
