<script lang="ts">
	import type { Work } from '$lib/data/works';
	import { lightboxStore } from '$lib/stores/lightbox';

	export let works: Work[] = [];
	export let limit: number | null = null;

	// Validate limit: null/undefined → show all; finite non-negative number → slice;
	// anything else (NaN, negative, Infinity) → show all (defensive — these would
	// silently produce empty/wrong slices otherwise).
	$: visible = (() => {
		if (limit === null || limit === undefined) return works;
		if (!Number.isFinite(limit) || limit < 0) return works;
		return works.slice(0, Math.floor(limit));
	})();

	function openLightbox(index: number) {
		lightboxStore.open(visible, index);
	}

	function handleKey(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openLightbox(index);
		}
	}
</script>

<!--
	Editorial asymmetric grid: each cell gets a `data-shape` from 1 to 7,
	cycling through a curated pattern of column spans + aspect ratios. CSS
	rules live in portfolio.css under the WORKS GRID section.

	`data-shape` (vs class names like `.w-1`) — chosen to avoid colliding
	with Tailwind's `.w-1` width utility, which loads after this stylesheet
	and would otherwise override `grid-column: span N`.

	Each cell has a min-height fallback in CSS so it can never collapse even
	if the aspect-ratio doesn't resolve (the failure mode we hit earlier).
-->
<div class="works">
	{#each visible as work, i (i)}
		<div
			class="work"
			data-shape={(i % 7) + 1}
			role="button"
			tabindex="0"
			on:click={() => openLightbox(i)}
			on:keydown={(event) => handleKey(event, i)}
			aria-label="View {work.title}"
		>
			<div class="frame">
				<img src={work.src} alt={work.alt} loading="lazy" />
			</div>
			<div class="label">{work.title}</div>
		</div>
	{/each}
</div>
