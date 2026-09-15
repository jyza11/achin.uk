/// Runs inside PocketBase's JS VM (not Node) — excluded from ESLint.
/// Loaded from works_images.pb.js handlers via require() — PocketBase runs each handler in
/// an isolated VM, so shared code must live in a module like this one.
///
/// Media pipeline for `works` (AGENTS.md › Art direction / CMS design):
///   - the file the editor uploads is kept UNTOUCHED in `original` (protected field:
///     served only with a file token, never on a plain URL)
///   - `image` (the public field) becomes a copy resized to fit 2400×2400 — long edge
///     2400 px, aspect kept, never cropped, never upscaled; re-encoding drops EXIF
///     (phone photos carry the studio's GPS)
/// A processed `image` carries the "_web" marker in its filename, which is how the hook
/// knows to leave it alone when its own save fires the update hook again. The marker alone
/// is not enough: an artist could name an original upload e.g. "sunset_web.jpg" and the
/// pipeline would skip it, leaving `original` empty and the full-resolution EXIF-intact file
/// public as `image`. So a record only counts as processed when the marker is present AND
/// `original` is non-empty. A re-upload without the marker is still processed even though
/// `original` already holds a value from an earlier run.
/// If the derivative step throws, the caller (works_images.pb.js) sets `status` back to
/// `draft` via markFailed() below, so a failure never leaves a full-resolution file public.
/// Storage must be the local disk (default) — files are read from $app.dataDir().

const WEB_MARKER = '_web';
const WEB_BOX = '2400x2400f'; // f = fit inside the box, no crop; smaller images are not upscaled

function isProcessed(record) {
	return record.getString('image').includes(WEB_MARKER) && record.getString('original') !== '';
}

function processWorkImage(app, record) {
	const image = record.getString('image');
	if (!image || isProcessed(record)) return false;

	const base = record.baseFilesPath(); // "<collectionId>/<recordId>"
	const dir = app.dataDir() + '/storage/' + base;
	const stem = image.replace(/\.[^.]+$/, '');
	const webName = stem + WEB_MARKER + '.jpg';

	// 1) derivative via PocketBase's own thumb generator, written next to the source
	const fs = app.newFilesystem();
	try {
		fs.createThumb(base + '/' + image, base + '/' + webName, WEB_BOX);
	} finally {
		fs.close();
	}

	// 2) read both into memory, then let PocketBase re-attach them as proper field values
	//    (it renames with a random suffix, deletes the old `image` file, and validates)
	const originalBytes = $os.readFile(dir + '/' + image);
	const webBytes = $os.readFile(dir + '/' + webName);
	$os.remove(dir + '/' + webName); // temp file; the saved copy gets its own name

	const fresh = app.findRecordById('works', record.id);
	fresh.set('original', $filesystem.fileFromBytes(originalBytes, image));
	fresh.set('image', $filesystem.fileFromBytes(webBytes, webName));
	app.save(fresh);
	return true;
}

// Called from the handlers' catch block when processWorkImage throws. A failed derivative
// must never leave the full-resolution upload public, so the record is pulled back to draft.
// Wrapped in its own try/catch — this can never throw, so e.next() in the handler always runs.
// app.save() re-fires this same after-success hook (same as processWorkImage's own save does,
// see isProcessed above) — only save when the record isn't draft yet, so a derivative that
// keeps failing the same way settles after one retry instead of recursing without end.
function markFailed(app, record, err) {
	try {
		const fresh = app.findRecordById('works', record.id);
		if (fresh.getString('status') !== 'draft') {
			fresh.set('status', 'draft');
			app.save(fresh);
		}
	} catch (_) {
		// swallow — this must never throw, so the editor's save always completes
	}
	console.log('[works_images] FAILED ' + record.id + ': ' + String(err) + ' — set to draft');
}

function rejectHeic(e) {
	let files = [];
	try {
		files = e.findUploadedFiles('image') || []; // throws / empty on non-multipart requests
	} catch (_) {
		return;
	}
	for (const f of files) {
		if (/\.(heic|heif)$/i.test(f.name)) {
			throw new BadRequestError(
				'HEIC is not supported — please export the photo as JPEG (iPhone: Settings › Camera › Formats › Most Compatible).'
			);
		}
	}
}

module.exports = { processWorkImage, markFailed, rejectHeic };
