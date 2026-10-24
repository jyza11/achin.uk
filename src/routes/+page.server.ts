import type { PageServerLoad } from './$types';
import { loadWorks } from '$lib/server/works';
import { loadBlocks } from '$lib/server/content';

// Home shares the bio (`about.statement`) with /about — one row, two pages. Its quote is its own
// (`home.quote`), so the two pages show two different lines of Achin's.
export const load: PageServerLoad = async () => {
	const [gallery, blocks] = await Promise.all([
		loadWorks('gallery'),
		loadBlocks([
			'home.hero_eyebrow',
			'home.headline',
			'home.hero_deck',
			'home.notes_title',
			'home.quote',
			'about.statement'
		])
	]);
	return { ...gallery, blocks };
};
