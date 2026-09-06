import type { RecordModel } from 'pocketbase';
import type { Work } from '$lib/data/works';
import { galleryWorks, sketchWorks } from '$lib/data/works';
import { pbClient, pbErrorSummary, PB_TIMEOUT_MS } from './pb';

export type WorksCollection = 'gallery' | 'sketch';
export type WorksSource = 'cms' | 'local';

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

const LOCAL: Record<WorksCollection, Work[]> = { gallery: galleryWorks, sketch: sketchWorks };

function bilingual(zh: string, en: string): string {
	if (zh && en) return `${zh} · ${en}`;
	return zh || en;
}

function toWork(pb: ReturnType<typeof pbClient>, r: WorkRecord): Work {
	const title = bilingual(r.title_zh, r.title_en);
	return {
		// Width-only thumb = resize, keep aspect, never crop (art direction).
		src: pb.files.getURL(r, r.image, { thumb: '1600x0' }),
		alt: title,
		title,
		year: r.year ? String(r.year) : '',
		medium: r.medium ?? '',
		size: r.size ?? '',
		sold: r.sold || undefined
	};
}

/**
 * Published works for one collection, from PocketBase. If the backend is
 * unreachable, slow, or empty, falls back to the images bundled in the repo
 * so the site never renders blank. `source` tells the page which one it got.
 */
export async function loadWorks(
	collection: WorksCollection
): Promise<{ works: Work[]; source: WorksSource }> {
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
	} catch (err) {
		console.warn(
			`[works] PocketBase unavailable for "${collection}", using local images: ${pbErrorSummary(err)}`
		);
	}
	return { works: LOCAL[collection], source: 'local' };
}
