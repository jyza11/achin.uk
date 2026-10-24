import type { PageServerLoad } from './$types';
import { loadWorks } from '$lib/server/works';
import { loadBlocks } from '$lib/server/content';

export const load: PageServerLoad = async () => {
	const [works, blocks] = await Promise.all([loadWorks('sketch'), loadBlocks(['sketch.note'])]);
	return { ...works, blocks };
};
