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

/** One-line reason for a failed PocketBase call — a down backend is routine, not a stack trace. */
export function pbErrorSummary(err: unknown): string {
	const e = err as {
		status?: number;
		message?: string;
		originalError?: { cause?: { code?: string } };
	};
	const code = e?.originalError?.cause?.code;
	if (code) return `${code} (${PB_URL})`;
	if (e?.status) return `HTTP ${e.status}: ${e.message ?? ''}`.trim();
	return e?.message ?? String(err);
}
