<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { galleryWorks } from '$lib/data/works';
</script>

<svelte:head>
	<title>油畫 · Paintings — Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">油畫 · Paintings</span>
			<h1 class="section-title">Selected <em>works</em></h1>
		</div>
		<div class="section-aside">
			{galleryWorks.length} {galleryWorks.length === 1 ? 'work' : 'works'} · Oil on linen
		</div>
	</header>

	{#if galleryWorks.length === 0}
		<p style="font-family: var(--serif); font-style: italic; color: var(--ink-3); text-align: center; padding: 80px 0;">
			No works to show yet. Add images to <code>src/lib/assets/gallery/</code> to populate this page.
		</p>
	{:else}
		<WorksGrid works={galleryWorks} />
	{/if}
</section>

<Lightbox />
