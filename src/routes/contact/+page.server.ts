import type { PageServerLoad } from './$types';
import { loadBlocks } from '$lib/server/content';

// Each block falls back to the hardcoded text in +page.svelte.
const SLUGS = [
	'contact.intro',
	'contact.hours',
	'contact.address',
	'contact.email',
	'contact.press',
	'contact.instagram'
];

export const load: PageServerLoad = async () => ({ blocks: await loadBlocks(SLUGS) });
