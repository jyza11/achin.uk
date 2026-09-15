// Exports published content from PocketBase into a committed snapshot the static site can
// build from with no backend (AGENTS.md › Deployment). Anonymous reads only — `works` and
// `content_blocks` are both publicly readable for published rows.
//
//   node scripts/export-content.mjs
//
// Reads PUBLIC_PB_URL from the environment, else from .env, else http://127.0.0.1:8090.
// Writes src/lib/content/{works.json,blocks.json,meta.json,images/<id>.jpg}. Re-running with
// no content change downloads nothing and leaves meta.json (and therefore git) untouched.
//
// Safety: an empty works/blocks result is refused when the snapshot on disk is not empty
// (pass --allow-empty to really clear it); images under 4 KB are refused (not a painting,
// and Vite would inline them); JSON is written atomically; images of removed works are
// deleted only after the new JSON is safely on disk.
import {
	readFileSync,
	writeFileSync,
	existsSync,
	readdirSync,
	mkdirSync,
	renameSync,
	unlinkSync
} from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PocketBase from 'pocketbase';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'src/lib/content');
const imagesDir = resolve(contentDir, 'images');
const worksPath = resolve(contentDir, 'works.json');
const blocksPath = resolve(contentDir, 'blocks.json');
const metaPath = resolve(contentDir, 'meta.json');

function readEnvFile() {
	const envPath = resolve(root, '.env');
	if (!existsSync(envPath)) return {};
	return Object.fromEntries(
		readFileSync(envPath, 'utf8')
			.split('\n')
			.filter((l) => l.includes('=') && !l.trim().startsWith('#'))
			.map((l) => {
				const i = l.indexOf('=');
				return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
			})
	);
}

const PB_URL = process.env.PUBLIC_PB_URL ?? readEnvFile().PUBLIC_PB_URL ?? 'http://127.0.0.1:8090';

const MIN_IMAGE_BYTES = 4096; // Vite's default assetsInlineLimit — smaller files get base64-inlined

function writeAtomic(path, data) {
	const tmp = `${path}.tmp`;
	try {
		writeFileSync(tmp, data);
		renameSync(tmp, path);
	} finally {
		if (existsSync(tmp)) unlinkSync(tmp);
	}
}

function fail(message) {
	console.error(`export-content: ${message}`);
	process.exit(1);
}

function readJsonIfExists(path) {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return null;
	}
}

async function main() {
	mkdirSync(imagesDir, { recursive: true });
	// Leftovers from an interrupted earlier run.
	for (const file of readdirSync(imagesDir)) {
		if (file.endsWith('.tmp')) unlinkSync(resolve(imagesDir, file));
	}

	const pb = new PocketBase(PB_URL);
	pb.autoCancellation(false);

	let records;
	let blockRecords;
	try {
		records = await pb.collection('works').getFullList({
			filter: 'status = "published"',
			sort: 'collection,sort,-created'
		});
		blockRecords = await pb.collection('content_blocks').getFullList();
	} catch (err) {
		console.error(
			`export-content: failed to read from PocketBase at ${PB_URL}: ${err.message ?? err}`
		);
		process.exit(1);
		return;
	}

	// Fixed key order per row — keeps `git diff` on works.json readable.
	const newWorks = records.map((r) => ({
		id: r.id,
		collection: r.collection,
		sort: r.sort,
		title_zh: r.title_zh ?? '',
		title_en: r.title_en ?? '',
		description_zh: r.description_zh ?? '',
		description_en: r.description_en ?? '',
		year: r.year ? r.year : null,
		medium: r.medium ?? '',
		size: r.size ?? '',
		sold: Boolean(r.sold),
		image: `${r.id}.jpg`,
		source_image: r.image ?? '',
		collectionId: r.collectionId
	}));

	const oldWorks = readJsonIfExists(worksPath) ?? [];
	const oldBlocks = readJsonIfExists(blocksPath) ?? {};
	const allowEmpty = process.argv.includes('--allow-empty');
	if (!allowEmpty && newWorks.length === 0 && oldWorks.length > 0) {
		fail(
			`PocketBase at ${PB_URL} returned 0 published works but the snapshot has ${oldWorks.length}. ` +
				'Refusing to wipe it (wrong URL, or content unpublished?). Pass --allow-empty to really clear it.'
		);
	}
	if (!allowEmpty && blockRecords.length === 0 && Object.keys(oldBlocks).length > 0) {
		fail(
			`PocketBase at ${PB_URL} returned 0 content blocks but the snapshot has ${Object.keys(oldBlocks).length}. ` +
				'Refusing to wipe them. Pass --allow-empty to really clear them.'
		);
	}
	const oldSourceById = new Map(oldWorks.map((w) => [w.id, w.source_image]));

	let downloaded = 0;
	for (const entry of newWorks) {
		const dest = resolve(imagesDir, entry.image);
		const needsDownload = !existsSync(dest) || oldSourceById.get(entry.id) !== entry.source_image;
		if (!needsDownload) continue;

		const url = `${PB_URL}/api/files/${entry.collectionId}/${entry.id}/${entry.source_image}`;
		let res;
		try {
			res = await fetch(url);
		} catch (err) {
			console.error(
				`export-content: failed to fetch image for work ${entry.id}: ${err.message ?? err}`
			);
			process.exit(1);
			return;
		}
		if (!res.ok) {
			console.error(
				`export-content: image fetch for work ${entry.id} returned HTTP ${res.status} (${url})`
			);
			process.exit(1);
			return;
		}
		const type = res.headers.get('content-type') ?? '';
		if (!type.startsWith('image/')) {
			fail(`image fetch for work ${entry.id} returned ${type || 'no content-type'}, not an image`);
		}
		const buf = Buffer.from(await res.arrayBuffer());
		if (buf.length < MIN_IMAGE_BYTES) {
			fail(
				`image for work ${entry.id} is only ${buf.length} bytes — refusing (a web copy of a painting ` +
					'is never this small, and Vite would inline it into the HTML)'
			);
		}
		writeAtomic(dest, buf);
		downloaded += 1;
	}

	// Images of works no longer exported — deleted only after the new JSON is written below.
	const currentIds = new Set(newWorks.map((w) => w.id));
	const toRemove = readdirSync(imagesDir).filter(
		(file) => file.endsWith('.jpg') && !currentIds.has(file.slice(0, -'.jpg'.length))
	);
	const removed = toRemove.length;
	const kept = newWorks.length - downloaded;

	// collectionId is only needed to build the download URL above — drop it from the
	// committed snapshot so the row shape matches the spec exactly.
	const worksForFile = newWorks.map((entry) => {
		const rest = { ...entry };
		delete rest.collectionId;
		return rest;
	});

	const newBlocks = Object.fromEntries(
		blockRecords
			.map((r) => [r.slug, { zh: r.text_zh ?? '', en: r.text_en ?? '' }])
			.sort(([a], [b]) => a.localeCompare(b))
	);

	const newWorksStr = JSON.stringify(worksForFile, null, 2) + '\n';
	const newBlocksStr = JSON.stringify(newBlocks, null, 2) + '\n';
	const oldWorksStr = existsSync(worksPath) ? readFileSync(worksPath, 'utf8') : null;
	const oldBlocksStr = existsSync(blocksPath) ? readFileSync(blocksPath, 'utf8') : null;

	const changed =
		newWorksStr !== oldWorksStr || newBlocksStr !== oldBlocksStr || downloaded > 0 || removed > 0;

	if (newWorksStr !== oldWorksStr) writeAtomic(worksPath, newWorksStr);
	if (newBlocksStr !== oldBlocksStr) writeAtomic(blocksPath, newBlocksStr);
	if (changed) {
		const meta = {
			exported_at: new Date().toISOString(),
			source: PB_URL,
			works: worksForFile.length,
			blocks: Object.keys(newBlocks).length
		};
		writeAtomic(metaPath, JSON.stringify(meta, null, 2) + '\n');
	}
	for (const file of toRemove) unlinkSync(resolve(imagesDir, file));

	console.log(
		`export-content: ${worksForFile.length} works, ${Object.keys(newBlocks).length} blocks, ` +
			`images downloaded ${downloaded} / kept ${kept} / removed ${removed}, changed: ${changed ? 'yes' : 'no'}`
	);
}

main().catch((err) => {
	console.error(`export-content: ${err.message ?? err}`);
	process.exit(1);
});
