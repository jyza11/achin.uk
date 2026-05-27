<script lang="ts">
	import type { Work } from '$lib/data/works';
	import { lightboxStore } from '$lib/stores/lightbox';

	export let works: Work[] = [];
	export let limit: number | null = null;

	// Cycle through w-1..w-7 span classes for visual rhythm
	const spanPattern = ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7'];

	$: visible = limit ? works.slice(0, limit) : works;

	function openLightbox(index: number) {
		lightboxStore.open(visible, index);
	}
</script>

<div class="works">
	{#each visible as work, i}
		<button
			type="button"
			class="work {spanPattern[i % spanPattern.length]}"
			on:click={() => openLightbox(i)}
			aria-label="View {work.title}"
		>
			<div class="frame">
				<img src={work.src} alt={work.alt} />
			</div>
			<div class="label">
				<span class="t">{work.title}</span>
				{#if work.year}
					<span class="y">{work.year}</span>
				{/if}
			</div>
			{#if work.medium || work.sold}
				<div class="meta">
					{work.medium}
					{#if work.sold}<span class="sold">Sold</span>{/if}
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.work {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
	}
	.frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
