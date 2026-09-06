// Dev seed for the CMS slice: one painting + the /about text blocks.
// Usage (PocketBase must be running):
//   node scripts/seed-dev.mjs
// Reads superuser credentials from pocketbase/.env.dev (git-ignored).
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import PocketBase from 'pocketbase';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
	readFileSync(resolve(root, 'pocketbase/.env.dev'), 'utf8')
		.split('\n')
		.filter((l) => l.includes('='))
		.map((l) => l.split('=').map((s) => s.trim()))
);

const pb = new PocketBase(env.PB_URL ?? 'http://127.0.0.1:8090');
pb.autoCancellation(false);
await pb.collection('_superusers').authWithPassword(env.PB_ADMIN_EMAIL, env.PB_ADMIN_PASSWORD);

// One real painting from the repo, with clearly-placeholder titles.
const galleryDir = resolve(root, 'src/lib/assets/gallery');
const file = readdirSync(galleryDir).find((f) => /\.jpe?g$/i.test(f));
if (!file) throw new Error('no jpg in src/lib/assets/gallery');

const existing = await pb
	.collection('works')
	.getList(1, 1, { filter: 'title_en = "Seed painting"' });
if (existing.totalItems === 0) {
	const fd = new FormData();
	fd.append('title_zh', '測試作品');
	fd.append('title_en', 'Seed painting');
	fd.append('description_zh', '這是 CMS 測試用的作品說明。');
	fd.append('description_en', 'Placeholder description for the CMS slice.');
	fd.append('year', '2025');
	fd.append('medium', 'Oil on linen');
	fd.append('collection', 'gallery');
	fd.append('sort', '1');
	fd.append('status', 'published');
	fd.append(
		'image',
		new File([readFileSync(resolve(galleryDir, file))], basename(file), { type: 'image/jpeg' })
	);
	const rec = await pb.collection('works').create(fd);
	console.log('created work', rec.id, 'from', file);
} else {
	console.log('seed painting already exists, skipping');
}

// The /about text, as it is hardcoded today — so the page proves the wiring by
// showing identical content that now comes from the CMS.
const blocks = [
	{
		slug: 'about.quote',
		text_zh:
			'我不在家就在去咖啡館的路上 — 雙叟 · 左岸 · 巴黎 · 花街 — 黃金海岸的比基尼 — 可憐我一雙 Ferragamo 的高跟鞋。',
		text_en: '',
		note: 'Artist quote shown on / and /about'
	},
	{
		slug: 'about.statement',
		text_zh: '',
		text_en:
			'A practice built on slow looking. Oil on linen, graphite on paper, and the long hours between — light, weather, and the corners of rooms held still long enough to draw out the hour before the room forgets itself.',
		note: 'First paragraph on /about; short version also on /'
	},
	{
		slug: 'about.practice',
		text_zh: '',
		text_en:
			'Working from life and from memory. Sittings at the café, drawings in the morning, paintings revisited in the studio after the day has cooled.',
		note: 'Second paragraph on /about'
	}
];
for (const b of blocks) {
	const found = await pb
		.collection('content_blocks')
		.getList(1, 1, { filter: pb.filter('slug = {:s}', { s: b.slug }) });
	if (found.totalItems === 0) {
		await pb.collection('content_blocks').create(b);
		console.log('created block', b.slug);
	} else {
		console.log('block exists', b.slug);
	}
}
console.log('done');
