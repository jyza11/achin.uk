export type Work = {
	src: string;
	alt: string;
	title: string;
	year: string;
	medium: string;
	size: string;
	sold?: boolean;
};

function filenameToTitle(path: string): string {
	const base = path.split('/').pop() ?? '';
	const name = base.replace(/\.[^.]+$/, '');
	return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildWorks(modules: Record<string, string>): Work[] {
	return Object.entries(modules).map(([path, url]) => ({
		src: url,
		alt: filenameToTitle(path),
		title: filenameToTitle(path),
		year: '',
		medium: '',
		size: ''
	}));
}

const galleryModules = import.meta.glob('$lib/assets/gallery/*.{png,jpg,jpeg,gif,webp,svg}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

const sketchModules = import.meta.glob('$lib/assets/sketch/*.{png,jpg,jpeg,gif,webp,svg}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

export const galleryWorks: Work[] = buildWorks(galleryModules);
export const sketchWorks: Work[] = buildWorks(sketchModules);
