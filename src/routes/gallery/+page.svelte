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
			zh: '原作多數展示於淡水黑客茶舖。',
			en: 'Most of the originals hang at Hacha in Tamsui.'
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
	<title>油畫 · Paintings — 阿晉 Achin</title>
</svelte:head>

<!--
	Editorial reading order per artist's brief:
	  1. Artwork first (WorksGrid — image only, no title above)
	  2. Text description (the .art-note paragraph)
	  3. Title header last (.section-head--footer — reads as a closing colophon,
	     not a lead-in)

	The user lands on the paintings; the section title only appears after they've
	seen and read past the work. On mobile the WorksGrid fills 100dvh, so the
	description + header are revealed by scrolling the page down past the gallery.
-->
<section class="band art-band">
	{#if galleryWorks.length === 0}
		<p class="art-empty">
			No works to show yet. Publish a painting in the CMS to populate this page.
		</p>
	{:else}
		<WorksGrid works={galleryWorks} />
	{/if}

	<div class="art-note">
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
