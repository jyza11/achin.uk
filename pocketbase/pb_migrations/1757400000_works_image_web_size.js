// Runs inside PocketBase's JS VM (globals: migrate), not Node — excluded from ESLint.
//
// Schema v1.2 — media pipeline support (see pb_hooks/works_images.pb.js)
//   works.image.thumbs   += 2400x2400f (fit, no crop — the stored public copy's size)
//   works.image.mimeTypes -= image/heic (the resizer can't decode it; the hook rejects it)
migrate(
	(app) => {
		const works = app.findCollectionByNameOrId('works');
		const image = works.fields.getByName('image');
		image.thumbs = ['400x0', '1600x0', '2400x2400f'];
		image.mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
		app.save(works);
	},
	(app) => {
		const works = app.findCollectionByNameOrId('works');
		const image = works.fields.getByName('image');
		image.thumbs = ['400x0', '1600x0'];
		image.mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];
		app.save(works);
	}
);
