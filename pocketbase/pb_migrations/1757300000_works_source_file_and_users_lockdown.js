// Runs inside PocketBase's JS VM (globals: migrate, Collection), not Node — excluded from ESLint.
//
// Schema v1.1
//   works.source_file  — the bundled filename a row was migrated from (idempotent migration,
//                        and the key for retiring the Vite-glob fallback later)
//   users              — no public sign-up (superuser creates accounts), plus a `role` field
//                        (admin | artist | editor) for the custom /admin later.
//   works / content_blocks write rules now require a `users` login explicitly.
migrate(
	(app) => {
		const works = app.findCollectionByNameOrId('works');
		works.fields.add(new TextField({ name: 'source_file', max: 300 }));
		works.indexes.push(
			'CREATE UNIQUE INDEX idx_works_source_file ON works (source_file) WHERE source_file != ""'
		);
		const write = '@request.auth.collectionName = "users"';
		works.createRule = write;
		works.updateRule = write;
		works.deleteRule = write;
		app.save(works);

		const blocks = app.findCollectionByNameOrId('content_blocks');
		blocks.createRule = write;
		blocks.updateRule = write;
		blocks.deleteRule = write;
		app.save(blocks);

		const users = app.findCollectionByNameOrId('users');
		users.createRule = null; // superuser only — no self-registration
		users.fields.add(
			new SelectField({ name: 'role', maxSelect: 1, values: ['admin', 'artist', 'editor'] })
		);
		app.save(users);
	},
	(app) => {
		const users = app.findCollectionByNameOrId('users');
		users.fields.removeByName('role');
		users.createRule = '';
		app.save(users);

		const write = '@request.auth.id != ""';
		const blocks = app.findCollectionByNameOrId('content_blocks');
		blocks.createRule = write;
		blocks.updateRule = write;
		blocks.deleteRule = write;
		app.save(blocks);

		const works = app.findCollectionByNameOrId('works');
		works.createRule = write;
		works.updateRule = write;
		works.deleteRule = write;
		works.indexes = works.indexes.filter((i) => !i.includes('idx_works_source_file'));
		works.fields.removeByName('source_file');
		app.save(works);
	}
);
