/// Runs inside PocketBase's JS VM (not Node) — excluded from ESLint.
/// Media pipeline for `works`. Logic lives in lib/works_images.js; see the comment there.
/// Handlers must be self-contained (each runs in its own VM), hence the require() inside.

onRecordAfterCreateSuccess((e) => {
	const lib = require(`${__hooks}/lib/works_images.js`);
	try {
		lib.processWorkImage(e.app, e.record);
	} catch (err) {
		// Never fail the editor's save because of the derivative — but never leave the
		// full-resolution upload public either, so pull the record back to draft.
		lib.markFailed(e.app, e.record, err);
	}
	e.next();
}, 'works');

onRecordAfterUpdateSuccess((e) => {
	const lib = require(`${__hooks}/lib/works_images.js`);
	try {
		lib.processWorkImage(e.app, e.record);
	} catch (err) {
		lib.markFailed(e.app, e.record, err);
	}
	e.next();
}, 'works');

// HEIC/HEIF (iPhone default) cannot be decoded by the resizer — refuse with a clear message.
onRecordCreateRequest((e) => {
	require(`${__hooks}/lib/works_images.js`).rejectHeic(e);
	e.next();
}, 'works');

onRecordUpdateRequest((e) => {
	require(`${__hooks}/lib/works_images.js`).rejectHeic(e);
	e.next();
}, 'works');
