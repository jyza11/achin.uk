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
	},
	{
		slug: 'home.hero_eyebrow',
		text_zh: '',
		text_en: 'Painter · Taipei',
		note: 'Small label above the homepage headline'
	},
	{
		slug: 'home.hero_deck',
		text_zh: '',
		text_en:
			'Oil on linen — slow, considered surfaces of weather, water, and interior thresholds. Painted from life, then revisited from memory.',
		note: 'Paragraph under the homepage headline'
	},
	{
		slug: 'gallery.note',
		text_zh: '',
		text_en:
			'A selection of recent oil paintings — each on linen unless noted. Tap any painting on desktop for a lightbox; on mobile, swipe up on a painting to see its details.',
		note: 'Paragraph under the paintings on /gallery'
	},
	{
		slug: 'contact.intro',
		text_zh: '',
		text_en:
			'The studio is open by appointment for visitors, collectors, and curators. Acquisitions, commissions, and press inquiries — please write directly.',
		note: '/contact opening paragraph'
	},
	{
		slug: 'contact.hours',
		text_zh: '',
		text_en: 'Mon · Tue | 10—18h\nWed · Thu | 10—18h\nFri | 12—19h\nSat · Sun | By request',
		note: '/contact hours — one row per line: "label | value"'
	},
	{
		slug: 'contact.address',
		text_zh: '',
		text_en: 'Taipei · Studio\nBy appointment',
		note: '/contact address, one line per row'
	},
	{
		slug: 'contact.email',
		text_zh: '',
		text_en: 'studio@achin.example',
		note: 'PLACEHOLDER — replace with the real studio email'
	},
	{
		slug: 'contact.press',
		text_zh: '',
		text_en: 'press@achin.example',
		note: 'PLACEHOLDER — replace with the real press email'
	},
	{
		slug: 'contact.instagram',
		text_zh: '',
		text_en: '@achin.studio',
		note: 'PLACEHOLDER — replace with the real handle'
	},
	{
		slug: 'events.empty_line',
		text_zh: '展覽 · Coming soon',
		text_en: '',
		note: '/events big line while there are no listings'
	},
	{
		slug: 'events.empty_deck',
		text_zh: '',
		text_en:
			"Exhibition listings will appear here as they're scheduled. For studio visits and press inquiries in the meantime, see",
		note: '/events small text; the page appends the 合作 link'
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
