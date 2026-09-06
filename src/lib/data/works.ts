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
 * Optional sidecar metadata. Drop a `<image-filename>.json` next to any image
 * in `src/lib/assets/gallery/` or `src/lib/assets/sketch/` to annotate it.
 *
 *   src/lib/assets/gallery/morning-light.jpg
 *   src/lib/assets/gallery/morning-light.jpg.json   ← sidecar
 *
 * Sidecar contents (all fields optional):
 *   {
 *     "title":  "Morning Light",
 *     "year":   "2024",
 *     "medium": "Oil on linen",
 *     "size":   "40 × 60 cm",
 *     "sold":   true
 *   }
 *
 * Any field omitted from the sidecar falls back to the auto-derived default
 * (title from filename; year/medium/size empty; sold undefined).
 */
type WorkMetadata = Partial<{
	title: string;
	year: string;
	medium: string;
	size: string;
	sold: boolean;
}>;

/**
 * Filename → title. Replaces hyphens/underscores with spaces and title-cases
 * ASCII letters at the start of each "word" — where a word starts at the
 * beginning of the string OR after any non-letter character (space, digit,
 * punctuation). CJK and other non-Latin scripts pass through unchanged.
 *
 * Examples:
 *   morning-light_01  → Morning Light 01
 *   2024autumn-study  → 2024Autumn Study   (digit boundary counts)
 *   study01abc        → Study01Abc
 *   黃金海岸           → 黃金海岸          (unchanged)
 *   IMG_001           → IMG 001            (uppercase preserved)
 */
function filenameToTitle(path: string): string {
	const base = path.split('/').pop() ?? '';
	const name = base.replace(/\.[^.]+$/, '');
	return name
		.replace(/[-_]/g, ' ')
		.replace(
			/(^|[^a-zA-Z])([a-z])/g,
			(_, prefix: string, letter: string) => prefix + letter.toUpperCase()
		);
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

/**
 * Vite imports `.json` files as modules whose default export is the parsed
 * object. Defensively unwrap and validate types.
 */
function extractMetadata(mod: unknown): WorkMetadata {
	const raw = mod && typeof mod === 'object' ? (mod as { default?: unknown }).default : mod;
	if (!raw || typeof raw !== 'object') return {};
	const obj = raw as Record<string, unknown>;
	const meta: WorkMetadata = {};
	if (typeof obj.title === 'string') meta.title = obj.title;
	if (typeof obj.year === 'string') meta.year = obj.year;
	if (typeof obj.medium === 'string') meta.medium = obj.medium;
	if (typeof obj.size === 'string') meta.size = obj.size;
	if (typeof obj.sold === 'boolean') meta.sold = obj.sold;
	return meta;
}

/**
 * Build a filename → metadata map from the JSON sidecar modules. Sidecar path
 * `…/morning-light.jpg.json` maps to image filename `morning-light.jpg`.
 */
function buildMetaMap(metaModules: Record<string, unknown>): Map<string, WorkMetadata> {
	const map = new Map<string, WorkMetadata>();
	for (const [path, mod] of Object.entries(metaModules)) {
		const base = path.split('/').pop() ?? '';
		const imageBasename = base.replace(/\.json$/i, '');
		map.set(imageBasename, extractMetadata(mod));
	}
	return map;
}

function buildWorks(
	modules: Record<string, unknown>,
	metaModules: Record<string, unknown>,
	label: string
): Work[] {
	const metaMap = buildMetaMap(metaModules);

	const result = Object.entries(modules)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, mod]) => {
			const base = path.split('/').pop() ?? '';
			const meta = metaMap.get(base) ?? {};
			const autoTitle = filenameToTitle(path);
			return {
				src: extractUrl(mod),
				alt: meta.title ?? autoTitle,
				title: meta.title ?? autoTitle,
				year: meta.year ?? '',
				medium: meta.medium ?? '',
				size: meta.size ?? '',
				sold: meta.sold
			};
		})
		.filter((w) => w.src.length > 0);

	// Loud warning when glob matched files but all extractions failed — the
	// most likely cause is a future Vite upgrade changing the return shape.
	// Without this, the user sees a blank grid with zero diagnostic signal.
	const matched = Object.keys(modules).length;
	if (matched > 0 && result.length === 0) {
		console.warn(
			`[works.ts] "${label}" glob matched ${matched} files but every URL extraction returned empty. ` +
				`extractUrl() may not understand the shape Vite is returning — check import.meta.glob options.`
		);
	}
	return result;
}

// Use RELATIVE paths (not `$lib/...`) inside import.meta.glob — Vite's glob
// matcher is more reliable with literal relative patterns than with aliases.
// Both case variants are matched; uppercase extensions are declared as assets
// in vite.config.ts (`assetsInclude`) so Vite handles them properly.
//
// Using the modern `query: '?url', import: 'default'` form instead of the
// deprecated `as: 'url'` shortcut — Vite 6 removes the latter entirely.
const galleryModules = import.meta.glob(
	'../assets/gallery/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,avif,AVIF}',
	{ eager: true, query: '?url', import: 'default' }
) as Record<string, unknown>;

const sketchModules = import.meta.glob(
	'../assets/sketch/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,svg,avif,AVIF}',
	{ eager: true, query: '?url', import: 'default' }
) as Record<string, unknown>;

// Sidecar JSON metadata — eagerly imported and parsed by Vite. Absent for
// images without a `.json` sibling; that's fine, the work just uses defaults.
const galleryMeta = import.meta.glob('../assets/gallery/*.json', { eager: true }) as Record<
	string,
	unknown
>;

const sketchMeta = import.meta.glob('../assets/sketch/*.json', { eager: true }) as Record<
	string,
	unknown
>;

export const galleryWorks: Work[] = buildWorks(galleryModules, galleryMeta, 'gallery');
export const sketchWorks: Work[] = buildWorks(sketchModules, sketchMeta, 'sketch');
