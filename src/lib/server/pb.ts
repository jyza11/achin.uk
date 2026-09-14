import PocketBase from 'pocketbase';
import { building } from '$app/environment';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

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

/**
 * Guards `npm run build` (prerendering, see AGENTS.md › Deployment) against silently
 * shipping stale bundled content when the CMS is unreachable or empty: throws loudly unless
 * `ALLOW_FALLBACK_BUILD=1` is set, in which case it warns loudly instead and lets the caller
 * fall back. A no-op outside of `building` — dev server / preview keep the existing silent
 * fallback, which callers still log themselves.
 */
export function guardBuildFallback(what: string, reason: string): void {
	if (!building) return;
	if (privateEnv.ALLOW_FALLBACK_BUILD === '1') {
		console.warn(
			`[build] ALLOW_FALLBACK_BUILD=1 — building ${what} from the bundled fallback content despite: ${reason}`
		);
		return;
	}
	throw new Error(
		`[build] Refusing to prerender ${what}: ${reason}. Set ALLOW_FALLBACK_BUILD=1 to build from the bundled fallback content instead.`
	);
}
