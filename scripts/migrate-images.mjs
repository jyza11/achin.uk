// One-time migration: bundled images in src/lib/assets/{gallery,sketch} → PocketBase `works`.
// Idempotent: a file is skipped when a row with the same `source_file` exists.
//
//   node scripts/migrate-images.mjs            # migrate everything
//   node scripts/migrate-images.mjs --dry-run  # list what would be uploaded
//
// Titles are placeholders (未命名 / Untitled + number) for the artist to edit in the dashboard.
// Rows are published so the site keeps showing the full collection; order follows the
// filename order the site used before (sort = position). Requires pocketbase/.env.dev.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PocketBase from 'pocketbase';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const env = Object.fromEntries(
	readFileSync(resolve(root, 'pocketbase/.env.dev'), 'utf8')
		.split('\n')
		.filter((l) => l.includes('='))
		.map((l) => l.split('=').map((s) => s.trim()))
);

const MIME = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};
const COLLECTIONS = [
	{ name: 'gallery', zh: '未命名', en: 'Untitled', medium: 'Oil on linen' },
	{ name: 'sketch', zh: '素描', en: 'Sketch', medium: 'Graphite on paper' }
];

const pb = new PocketBase(env.PB_URL ?? 'http://127.0.0.1:8090');
pb.autoCancellation(false);
await pb.collection('_superusers').authWithPassword(env.PB_ADMIN_EMAIL, env.PB_ADMIN_PASSWORD);

const existing = new Set(
	(await pb.collection('works').getFullList({ fields: 'source_file' }))
		.map((r) => r.source_file)
		.filter(Boolean)
);

let created = 0;
let skipped = 0;
for (const c of COLLECTIONS) {
	const dir = resolve(root, 'src/lib/assets', c.name);
	const files = readdirSync(dir)
		.filter((f) => MIME[extname(f).toLowerCase()])
		.sort((a, b) => a.localeCompare(b)); // same order works.ts used
	for (const [i, file] of files.entries()) {
		const key = `${c.name}/${file}`;
		const n = String(i + 1).padStart(3, '0');
		if (existing.has(key)) {
			skipped++;
			continue;
		}
		if (dryRun) {
			console.log(`would create ${key} → ${c.zh} ${n} / ${c.en} ${n}`);
			created++;
			continue;
		}
		const fd = new FormData();
		fd.append('title_zh', `${c.zh} ${n}`);
		fd.append('title_en', `${c.en} ${n}`);
		fd.append('medium', c.medium);
		fd.append('collection', c.name);
		fd.append('sort', String(i + 1));
		fd.append('status', 'published');
		fd.append('source_file', key);
		fd.append(
			'image',
			new File([readFileSync(resolve(dir, file))], file, {
				type: MIME[extname(file).toLowerCase()]
			})
		);
		try {
			await pb.collection('works').create(fd);
			created++;
			console.log(`created ${key}`);
		} catch (e) {
			console.error(`FAILED ${key}:`, e.status, JSON.stringify(e.response?.data ?? e.message));
		}
	}
}
console.log(
	`${dryRun ? 'would create' : 'created'} ${created}, skipped ${skipped} (already migrated)`
);
