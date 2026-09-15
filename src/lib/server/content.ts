import type { RecordModel } from 'pocketbase';
import { building } from '$app/environment';
import { snapshotBlocks, snapshotMeta } from './content-snapshot';
import { pbClient, pbErrorSummary, guardBuildFallback, PB_URL, PB_TIMEOUT_MS } from './pb';

export type Block = { zh: string; en: string };
export type Blocks = Record<string, Block>;

type BlockRecord = RecordModel & { slug: string; text_zh: string; text_en: string };

/**
 * Content blocks by slug. Missing slugs are simply absent from the result — pages keep their
 * hardcoded text as the fallback for each block. If the backend is unreachable, falls back to
 * the committed content snapshot (`$lib/server/content-snapshot.ts`, see AGENTS.md › Deployment).
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
		const reason = `PocketBase at ${PB_URL} unavailable for "content_blocks": ${pbErrorSummary(err)}`;
		guardBuildFallback('the "content_blocks" collection', reason, snapshotMeta.exported_at);
		if (!building) {
			console.warn(
				`[content] ${reason}, using the committed snapshot (exported ${snapshotMeta.exported_at})`
			);
		}
		return snapshotBlocks(slugs);
	}
}
