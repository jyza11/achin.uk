import type { RecordModel } from 'pocketbase';
import { pbClient, PB_TIMEOUT_MS } from './pb';

export type Block = { zh: string; en: string };
export type Blocks = Record<string, Block>;

type BlockRecord = RecordModel & { slug: string; text_zh: string; text_en: string };

/**
 * Content blocks by slug. Missing slugs are simply absent from the result —
 * pages keep their hardcoded text as the fallback for each block.
 */
export async function loadBlocks(slugs: string[]): Promise<Blocks> {
	if (slugs.length === 0) return {};
	try {
		const pb = pbClient();
		const filter = slugs.map((_, i) => `slug = {:s${i}}`).join(' || ');
		const params = Object.fromEntries(slugs.map((s, i) => [`s${i}`, s]));
		const records = await pb.collection('content_blocks').getFullList<BlockRecord>({
			filter: pb.filter(filter, params),
			signal: AbortSignal.timeout(PB_TIMEOUT_MS)
		});
		const out: Blocks = {};
		for (const r of records) out[r.slug] = { zh: r.text_zh ?? '', en: r.text_en ?? '' };
		return out;
	} catch (err) {
		console.warn('[content] PocketBase unavailable, using hardcoded text:', err);
		return {};
	}
}
