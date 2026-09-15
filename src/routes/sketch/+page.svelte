<script lang="ts">
	import { onMount } from 'svelte';
	import WorksGrid from '$lib/components/WorksGrid.svelte';

	// Works come from PocketBase via +page.server.ts (local fallback when it's down).
	let { data } = $props();
	let sketchWorks = $derived(data.works);

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

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">素描 · Sketches</span>
			<h1 class="section-title">Drawings <em>and studies</em></h1>
		</div>
		<div class="section-aside">
			{sketchWorks.length}
			{sketchWorks.length === 1 ? 'sketch' : 'sketches'} · Graphite on paper
		</div>
	</header>

	{#if sketchWorks.length === 0}
		<p class="empty">No sketches to show yet. Publish a sketch in the CMS to populate this page.</p>
	{:else}
		<WorksGrid works={sketchWorks} />
	{/if}
</section>

<style>
	.empty {
		font-family: var(--serif);
		font-style: italic;
		color: var(--ink-3);
		text-align: center;
		padding: 80px 0;
	}
</style>
