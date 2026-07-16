import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		// PurgeCSS safelist: keep portfolio.css selectors that PurgeCSS may
		// otherwise strip in production. The `greedy` regexes match any
		// selector starting with these prefixes. Without this, custom
		// component classes (sidebar, works grid, lightbox, etc.) can
		// disappear from the production bundle.
		//
		// `legacy: true` opts into the plugin's classic PurgeCSS mode — that's
		// the branch where `safelist` is actually wired up (the default mode
		// uses Tailwind's built-in purger and ignores safelist).
		purgeCss({
			legacy: true,
			safelist: {
				greedy: [
					/^pf-/,        // sidebar / topbar / footer / content shell
					/^work/,       // works grid + work cells (data-shape attr)
					/^frame/,      // mat frame inside .work
					/^lightbox/,   // lightbox container
					/^lb-/,        // lightbox descendants (lb-inner, lb-art, lb-meta, lb-close…)
					/^section-/,   // section chrome (head/num/title/aside)
					/^band$/,      // <section class="band">
					/^visit/,      // visit band (hours, address)
					/^hours/,      // hours grid
					/^statement/,  // about page statement
					/^events?$/,   // events page
					/^contact/,    // contact page
					/^page-cta/,   // page cta block
					/^btn$/,       // buttons
					/^pq$/,        // page quote
					/^kk$/,        // small uppercase label inside lightbox
					/^pf-sidebar-backdrop$/, // mobile drawer backdrop
					/^open$/,      // .open modifier (drawer, lightbox)
					/^active$/,    // .active modifier (current nav link)
					/^romaji$/     // sidebar nav romaji label
				]
			}
		})
	],
	// Teach Vite that uppercase image extensions are static assets. Without this,
	// files like IMG_001.JPG (default from iPhone/Mac) match the glob in
	// src/lib/data/works.ts but Vite refuses to handle them as URL assets,
	// silently dropping them from gallery/sketch grids.
	assetsInclude: [
		'**/*.JPG',
		'**/*.JPEG',
		'**/*.PNG',
		'**/*.GIF',
		'**/*.WEBP',
		'**/*.AVIF'
	]
});