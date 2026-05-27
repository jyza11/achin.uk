<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import { sketchWorks } from '$lib/data/works';
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
			{sketchWorks.length} {sketchWorks.length === 1 ? 'sketch' : 'sketches'} · Graphite on paper
		</div>
	</header>

	{#if sketchWorks.length === 0}
		<p class="empty">
			No sketches to show yet. Add images to <code>src/lib/assets/sketch/</code> to populate this page.
		</p>
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
