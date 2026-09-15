/// Runs inside PocketBase's JS VM (not Node) — excluded from ESLint.
/// Triggers a Netlify rebuild after content changes. Logic lives in lib/rebuild.js; see
/// the comment there. Handlers must be self-contained (each runs in its own VM), hence
/// the require() inside.

onRecordAfterCreateSuccess(
	(e) => {
		try {
			require(`${__hooks}/lib/rebuild.js`).markDirty(e.app);
		} catch (err) {
			// Never fail the editor's save because the rebuild bookkeeping failed.
			console.log('[rebuild] markDirty failed: ' + String(err));
		}
		e.next();
	},
	'works',
	'content_blocks'
);

onRecordAfterUpdateSuccess(
	(e) => {
		try {
			require(`${__hooks}/lib/rebuild.js`).markDirty(e.app);
		} catch (err) {
			console.log('[rebuild] markDirty failed: ' + String(err));
		}
		e.next();
	},
	'works',
	'content_blocks'
);

onRecordAfterDeleteSuccess(
	(e) => {
		try {
			require(`${__hooks}/lib/rebuild.js`).markDirty(e.app);
		} catch (err) {
			console.log('[rebuild] markDirty failed: ' + String(err));
		}
		e.next();
	},
	'works',
	'content_blocks'
);

// Checks roughly once a minute whether the site has been quiet long enough to trigger a
// Netlify rebuild. See lib/rebuild.js tick() for the debounce/retry logic.
cronAdd('netlify_rebuild', '* * * * *', () => {
	require(`${__hooks}/lib/rebuild.js`).tick($app);
});
