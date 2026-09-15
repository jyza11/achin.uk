import type { PageServerLoad } from './$types';
import { loadWorks } from '$lib/server/works';
import { loadBlocks } from '$lib/server/content';

export const load: PageServerLoad = async () => {
	const [works, blocks] = await Promise.all([loadWorks('gallery'), loadBlocks(['gallery.note'])]);
	return { ...works, blocks };
};
