import type { PageServerLoad } from './$types';
import { loadBlocks } from '$lib/server/content';

// Slugs this page renders. Each falls back to the hardcoded text in +page.svelte.
const ABOUT_SLUGS = ['about.quote', 'about.statement', 'about.practice'] as const;

export const load: PageServerLoad = async () => ({ blocks: await loadBlocks([...ABOUT_SLUGS]) });
