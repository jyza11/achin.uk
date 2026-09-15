// One-off: run the media pipeline (pb_hooks/works_images.pb.js) over rows uploaded before
// the hook existed. Touching a record fires the update hook, which keeps the original in
// `original` and replaces `image` with the 2400px web copy. Idempotent — processed rows
// (image filename contains "_web") are skipped.
//
//   node scripts/reprocess-images.mjs
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
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

const rows = await pb.collection('works').getFullList({ fields: 'id,image,original,title_en' });
let done = 0;
let skipped = 0;
let failed = 0;
for (const r of rows) {
	if (!r.image || r.image.includes('_web')) {
		skipped++;
		continue;
	}
	try {
		// A no-op update is enough to fire onRecordAfterUpdateSuccess. The PATCH response is
		// built before the hook's own save, so re-fetch to see the processed filenames.
		await pb.collection('works').update(r.id, {});
		const after = await pb.collection('works').getOne(r.id, { fields: 'image,original' });
		if (after.image.includes('_web') && after.original) done++;
		else {
			failed++;
			console.error('not processed:', r.id, r.title_en, after.image);
		}
	} catch (e) {
		failed++;
		console.error(
			'FAILED',
			r.id,
			r.title_en,
			e.status,
			JSON.stringify(e.response?.data ?? e.message)
		);
	}
}
console.log(`processed ${done}, skipped ${skipped} (already done), failed ${failed}`);
