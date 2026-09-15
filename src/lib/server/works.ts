import type { RecordModel } from 'pocketbase';
import { building } from '$app/environment';
import type { Work } from '$lib/data/works';
import { snapshotWorks, snapshotMeta } from './content-snapshot';
import { pbClient, pbErrorSummary, guardBuildFallback, PB_URL, PB_TIMEOUT_MS } from './pb';

export type WorksCollection = 'gallery' | 'sketch';
export type WorksSource = 'cms' | 'snapshot';

type WorkRecord = RecordModel & {
	title_zh: string;
	title_en: string;
	year: number | null;
	medium: string;
	size: string;
	sold: boolean;
	sort: number | null;
	image: string;
};

function bilingual(zh: string, en: string): string {
	if (zh && en) return `${zh} · ${en}`;
	return zh || en;
}

function toWork(pb: ReturnType<typeof pbClient>, r: WorkRecord): Work {
	const title = bilingual(r.title_zh, r.title_en);
	return {
		// Width-only thumb = resize, keep aspect, never crop (art direction). The stored
		// `image` is already the 2400px web copy (pb_hooks/works_images.pb.js) — the
		// grid asks for 1600, the lightbox gets the full web copy.
		src: pb.files.getURL(r, r.image, { thumb: '1600x0' }),
		hires: pb.files.getURL(r, r.image),
		alt: title,
		title,
		year: r.year ? String(r.year) : '',
		medium: r.medium ?? '',
		size: r.size ?? '',
		sold: r.sold || undefined
	};
}

/**
 * Published works for one collection, from PocketBase. If the backend is unreachable, slow, or
 * empty, falls back to the committed content snapshot (`$lib/server/content-snapshot.ts`, see AGENTS.md ›
 * Deployment) so the site never renders blank. `source` tells the page which one it got.
 */
export async function loadWorks(
	collection: WorksCollection
): Promise<{ works: Work[]; source: WorksSource }> {
	let reason: string;
	try {
		const pb = pbClient();
		const records = await pb.collection('works').getFullList<WorkRecord>({
			filter: pb.filter('collection = {:c} && status = "published"', { c: collection }),
			sort: 'sort,-created',
			signal: AbortSignal.timeout(PB_TIMEOUT_MS)
		});
		if (records.length > 0) {
			return { works: records.map((r) => toWork(pb, r)), source: 'cms' };
		}
		// A live site must not prerender an empty gallery (Art direction / Deployment).
		reason = `PocketBase at ${PB_URL} is reachable but returned zero published "${collection}" works`;
	} catch (err) {
		reason = `PocketBase at ${PB_URL} unavailable for "${collection}" works: ${pbErrorSummary(err)}`;
	}
	guardBuildFallback(`the "${collection}" works collection`, reason, snapshotMeta.exported_at);
	const works = snapshotWorks(collection);
	if (building && works.length === 0) {
		// Never prerender an empty gallery, even from the snapshot itself.
		throw new Error(
			`[build] Refusing to prerender the "${collection}" works collection: ${reason}, and the ` +
				`committed snapshot (exported ${snapshotMeta.exported_at}) has zero works for it either.`
		);
	}
	if (!building) {
		console.warn(
			`[works] ${reason}, using the committed snapshot (exported ${snapshotMeta.exported_at})`
		);
	}
	return { works, source: 'snapshot' };
}
