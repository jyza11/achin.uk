// Runs inside PocketBase's JS VM (globals: migrate, Collection), not Node — excluded from ESLint.
// Types for editor support: pocketbase/pb_data/types.d.ts (generated on first run).
//
// Schema v1 — the CMS slice. Two collections:
//   works           one row per painting/sketch; `image` is what the site shows
//   content_blocks  page prose keyed by slug, 中文 + English side by side
//
// Rules: anyone can read published content; only authenticated users
// (the `users` auth collection = Achin + team) can write. Superusers bypass rules.
migrate(
	(app) => {
		const works = new Collection({
			type: 'base',
			name: 'works',
			listRule: 'status = "published"',
			viewRule: 'status = "published"',
			createRule: '@request.auth.id != ""',
			updateRule: '@request.auth.id != ""',
			deleteRule: '@request.auth.id != ""',
			fields: [
				{ name: 'title_zh', type: 'text', required: true, max: 200 },
				{ name: 'title_en', type: 'text', max: 200 },
				{ name: 'description_zh', type: 'text', max: 5000 },
				{ name: 'description_en', type: 'text', max: 5000 },
				{ name: 'year', type: 'number', onlyInt: true, min: 1900, max: 2100 },
				{ name: 'medium', type: 'text', max: 200 },
				{ name: 'size', type: 'text', max: 100 },
				{ name: 'sold', type: 'bool' },
				{
					name: 'collection',
					type: 'select',
					required: true,
					maxSelect: 1,
					values: ['gallery', 'sketch']
				},
				{ name: 'sort', type: 'number', onlyInt: true },
				{
					name: 'status',
					type: 'select',
					required: true,
					maxSelect: 1,
					values: ['draft', 'published']
				},
				{
					// The displayed file. Art direction: the site only ever asks for
					// width-based thumbs (`Wx0` = resize, keep aspect, never crop).
					name: 'image',
					type: 'file',
					required: true,
					maxSelect: 1,
					maxSize: 26214400,
					mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'],
					thumbs: ['400x0', '1600x0']
				},
				{
					// Optional untouched original — protected: only served with a file token.
					name: 'original',
					type: 'file',
					maxSelect: 1,
					maxSize: 104857600,
					protected: true
				},
				{ name: 'created', type: 'autodate', onCreate: true },
				{ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
			],
			indexes: ['CREATE INDEX idx_works_collection_status ON works (collection, status, sort)']
		});
		app.save(works);

		const blocks = new Collection({
			type: 'base',
			name: 'content_blocks',
			listRule: '',
			viewRule: '',
			createRule: '@request.auth.id != ""',
			updateRule: '@request.auth.id != ""',
			deleteRule: '@request.auth.id != ""',
			fields: [
				{
					name: 'slug',
					type: 'text',
					required: true,
					max: 100,
					pattern: '^[a-z0-9]+(\\.[a-z0-9_-]+)*$'
				},
				{ name: 'text_zh', type: 'text', max: 10000 },
				{ name: 'text_en', type: 'text', max: 10000 },
				{ name: 'note', type: 'text', max: 500 },
				{ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
			],
			indexes: ['CREATE UNIQUE INDEX idx_content_blocks_slug ON content_blocks (slug)']
		});
		app.save(blocks);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId('content_blocks'));
		app.delete(app.findCollectionByNameOrId('works'));
	}
);
