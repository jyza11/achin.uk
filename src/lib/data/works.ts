export type Work = {
	src: string;
	alt: string;
	title: string;
	year: string;
	medium: string;
	size: string;
	sold?: boolean;
};

/**
 * Filename → title. Replaces hyphens/underscores with spaces and title-cases
 * ASCII letters only — CJK and other non-Latin scripts pass through unchanged
 * (they don't have casing). This means `黃金海岸.jpg` → `黃金海岸` and
 * `morning-light_01.jpg` → `Morning Light 01`.
 */
function filenameToTitle(path: string): string {
	const base = path.split('/').pop() ?? '';
	const name = base.replace(/\.[^.]+$/, '');
	return name
		.replace(/[-_]/g, ' ')
		.replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Defensive URL extraction — works whether Vite hands us a string (newer `query`
 * option), a `{ default: string }` module wrapper (default eager import), or
 * something else. If nothing valid, returns empty string so the work gets
 * filtered out instead of producing `<img src="[object Object]">`.
 */
function extractUrl(mod: unknown): string {
	if (typeof mod === 'string') return mod;
	if (mod && typeof mod === 'object') {
		const d = (mod as { default?: unknown }).default;
		if (typeof d === 'string') return d;
	}
	return '';
}

function buildWorks(modules: Record<string, unknown>): Work[] {
	return Object.entries(modules)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, mod]) => ({
			src: extractUrl(mod),
			alt: filenameToTitle(path),
			title: filenameToTitle(path),
			year: '',
			medium: '',
			size: ''
		}))
		.filter((w) => w.src.length > 0);
}

// Use RELATIVE paths (not `$lib/...`) inside import.meta.glob — Vite's glob
// matcher is more reliable with literal relative patterns than with aliases.
// Both case variants are matched; uppercase extensions are declared as assets
// in vite.config.ts (`assetsInclude`) so Vite handles them properly.
const galleryModules = import.meta.glob(
	'../assets/gallery/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,avif,AVIF}',
	{ eager: true, as: 'url' }
) as Record<string, unknown>;

const sketchModules = import.meta.glob(
	'../assets/sketch/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,avif,AVIF}',
	{ eager: true, as: 'url' }
) as Record<string, unknown>;

export const galleryWorks: Work[] = buildWorks(galleryModules);
export const sketchWorks: Work[] = buildWorks(sketchModules);
