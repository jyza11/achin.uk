<script lang="ts">
	import { onMount } from 'svelte';
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import BiText from '$lib/components/BiText.svelte';
	import { bi } from '$lib/text';

	// Works come from PocketBase via +page.server.ts (server-side, so crawlers get
	// full HTML); `data.source` is 'local' when the backend was unreachable.
	let { data } = $props();
	let galleryWorks = $derived(data.works);
	const note = $derived(
		bi(data.blocks['gallery.note'], {
			zh: '油畫與壓克力作品。原作多數展示於淡水 Hacha。',
			en: 'Oil and acrylic paintings. Most of the originals hang at Hacha in Tamsui.'
		})
	);

	// Minimal-canvas mode: adds `body.minimal-canvas` while this route is
	// mounted; removed on navigation away. All the visual overrides (white
	// background, no frames, no hairlines, no paper grain, no pull-hint,
	// hidden footer) live under that class in portfolio.css so any other
	// art-viewing route (e.g. /sketch) can opt in the same way — one line.
	onMount(() => {
		document.body.classList.add('minimal-canvas');
		return () => document.body.classList.remove('minimal-canvas');
	});
</script>

<svelte:head>
	<title>油畫 · Paintings — Achin</title>
</svelte:head>

<!--
	Editorial reading order per artist's brief:
	  1. Artwork first (WorksGrid — image only, no title above)
	  2. Text description (the .gallery-note paragraph)
	  3. Title header last (.section-head--footer — reads as a closing colophon,
	     not a lead-in)

	The user lands on the paintings; the section title only appears after they've
	seen and read past the work. On mobile the WorksGrid fills 100dvh, so the
	description + header are revealed by scrolling the page down past the gallery.
-->
<section class="band">
	{#if galleryWorks.length === 0}
		<p class="empty">No works to show yet. Publish a painting in the CMS to populate this page.</p>
	{:else}
		<WorksGrid works={galleryWorks} />
	{/if}

	<div class="gallery-note">
		<BiText text={note} />
	</div>

	<header class="section-head section-head--footer">
		<div>
			<span class="section-num">油畫 · Paintings</span>
			<h1 class="section-title">油畫作品<span class="title-en" lang="en">Selected works</span></h1>
		</div>
		<div class="section-aside">
			{galleryWorks.length} 件 · 油畫 · 壓克力 ·
			<span lang="en">{galleryWorks.length === 1 ? 'work' : 'works'} · Oil · Acrylic</span>
		</div>
	</header>
</section>

<style>
	/* Override the global .band's default top padding (96px desktop / 56px
	   mobile). It was there for a lead-in section-head — with the header
	   moved to the bottom of this page there is no lead-in element, so the
	   top padding becomes empty white space above the paintings. Zero it
	   here; keep bottom padding for space after the closing header. Svelte
	   scopes this rule via a hash class, giving it higher specificity than
	   the global `section.band` in portfolio.css. */
	section.band {
		padding-top: 0;
	}

	/* Kill the cream placeholder background on the img element itself.
	   `.work .frame img` in portfolio.css sets `background: oklch(0.93 …)`
	   as a load-state colour; it also shows in the letterbox strips when
	   object-fit:contain leaves space around a painting. Anchored to the
	   body.minimal-canvas class so this only fires on the gallery route. */
	:global(body.minimal-canvas .work .frame img) {
		background: transparent;
	}

	.empty {
		font-family: var(--serif);
		font-style: italic;
		color: var(--ink-3);
		text-align: center;
		padding: 80px 0;
	}

	.gallery-note {
		max-width: 56ch;
		margin: 48px auto 24px; /* the 48px top margin replaces the border-top separator */
		padding: 0;
		text-align: center;
	}

	.gallery-note :global(p) {
		font-family: var(--serif);
		font-style: italic;
		font-size: 18px;
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0;
		text-wrap: pretty;
	}
	.gallery-note :global(.bi-en) {
		font-size: 16px;
		color: var(--ink-3);
		margin-top: 8px;
	}

	@media (max-width: 768px) {
		.gallery-note {
			margin: 32px 18px 20px;
			padding: 20px 0;
		}
		.gallery-note :global(p) {
			font-size: 16px;
		}
		.gallery-note :global(.bi-en) {
			font-size: 14px;
		}
	}
</style>
