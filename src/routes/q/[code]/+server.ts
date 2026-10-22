import { redirect } from '@sveltejs/kit';
import { qrTargets } from '$lib/qr';
import type { RequestHandler } from './$types';

// Runs per request in the Netlify function (the rest of the site is prerendered), so a
// scan counter can be added here later. 302, not 301: browsers cache a 301 forever and
// would skip this handler on the next scan. An unknown code goes home instead of a 404 —
// paper can't be fixed.
export const prerender = false;

export const GET: RequestHandler = ({ params }) => {
	redirect(302, qrTargets[params.code.toLowerCase()] ?? '/');
};
