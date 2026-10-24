<script lang="ts">
	import { onMount } from 'svelte';
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import BiText from '$lib/components/BiText.svelte';
	import { bi } from '$lib/text';

	// Works come from PocketBase via +page.server.ts (local fallback when it's down).
	let { data } = $props();
	let sketchWorks = $derived(data.works);
	// No fallback copy on purpose: the note shows only once a `sketch.note` row exists
	// with the artist's own words — the site never invents his text.
	const note = $derived(bi(data.blocks['sketch.note'], { zh: '', en: '' }));
	const hasNote = $derived(Boolean(note.zh || note.en));

	// Minimal-canvas mode — same opt-in as /gallery (see portfolio.css
	// MINIMAL CANVAS MODE section): pure white, no chrome while mounted.
	onMount(() => {
		document.body.classList.add('minimal-canvas');
		return () => document.body.classList.remove('minimal-canvas');
	});
</script>

<svelte:head>
	<title>素描 · Sketches — Achin</title>
</svelte:head>

<!-- Same reading order as /gallery (portfolio.css › ART ROUTES): works → note → title last. -->
<section class="band art-band">
	{#if sketchWorks.length === 0}
		<p class="art-empty">
			No sketches to show yet. Publish a sketch in the CMS to populate this page.
		</p>
	{:else}
		<WorksGrid works={sketchWorks} />
	{/if}

	{#if hasNote}
		<div class="art-note">
			<BiText text={note} />
		</div>
	{/if}

	<header class="section-head section-head--footer">
		<div>
			<span class="section-num">素描 · Sketches</span>
			<h1 class="section-title">
				素描習作<span class="title-en" lang="en">Drawings and studies</span>
			</h1>
		</div>
		<div class="section-aside">
			{sketchWorks.length}
			件 · 鉛筆 · 紙 ·
			<span lang="en">{sketchWorks.length === 1 ? 'sketch' : 'sketches'} · Pencil on paper</span>
		</div>
	</header>
</section>
