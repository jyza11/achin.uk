// Runs inside PocketBase's JS VM (globals: migrate), not Node — excluded from ESLint.
//
// Schema v1.3 — /admin needs to list drafts, not just published rows
//   works.listRule/viewRule now also allow any logged-in `users` record (every role — role is not
//   checked yet, same as the write rules),
//   so the works list in /admin shows drafts alongside published works. Public visitors are
//   unaffected — the `status = "published"` clause still applies to them.
migrate(
	(app) => {
		const works = app.findCollectionByNameOrId('works');
		const rule = 'status = "published" || @request.auth.collectionName = "users"';
		works.listRule = rule;
		works.viewRule = rule;
		app.save(works);
	},
	(app) => {
		const works = app.findCollectionByNameOrId('works');
		works.listRule = 'status = "published"';
		works.viewRule = 'status = "published"';
		app.save(works);
	}
);
