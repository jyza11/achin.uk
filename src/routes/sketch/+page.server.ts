import type { PageServerLoad } from './$types';
import { loadWorks } from '$lib/server/works';

export const load: PageServerLoad = async () => loadWorks('sketch');
