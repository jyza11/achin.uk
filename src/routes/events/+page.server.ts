import type { PageServerLoad } from './$types';
import { loadBlocks } from '$lib/server/content';

export const load: PageServerLoad = async () => ({
	blocks: await loadBlocks(['events.empty_line', 'events.empty_deck'])
});
