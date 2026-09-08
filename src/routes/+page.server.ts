import type { PageServerLoad } from './$types';
import { loadWorks } from '$lib/server/works';
import { loadBlocks } from '$lib/server/content';

// Home shares the artist's quote/statement blocks with /about — one row, two pages.
export const load: PageServerLoad = async () => {
	const [gallery, blocks] = await Promise.all([
		loadWorks('gallery'),
		loadBlocks(['home.hero_eyebrow', 'home.hero_deck', 'about.quote', 'about.statement'])
	]);
	return { ...gallery, blocks };
};
