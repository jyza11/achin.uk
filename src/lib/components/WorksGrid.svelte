<script lang="ts">
	import type { Work } from '$lib/data/works';
	import { lightboxStore } from '$lib/stores/lightbox';

	interface Props {
		works?: Work[];
		limit?: number | null;
	}

	let { works = [], limit = null }: Props = $props();

	// Validate limit: null/undefined → show all; finite non-negative number → slice;
	// anything else (NaN, negative, Infinity) → show all (defensive — these would
	// silently produce empty/wrong slices otherwise).
	let visible = $derived(
		(() => {
			if (limit === null || limit === undefined) return works;
			if (!Number.isFinite(limit) || limit < 0) return works;
			return works.slice(0, Math.floor(limit));
		})()
	);

	function openLightbox(index: number) {
		// Mobile uses the horizontal-swipe pattern with a per-painting details
		// panel (see WORKS GRID mobile block in portfolio.css). The swipe view IS
		// the detail view, so the lightbox is redundant here — suppress the open.
		// Breakpoint matches the CSS `@media (max-width: 768px)` block. The typeof
		// guard prevents ReferenceError during SSR (no window on the server).
		if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) return;
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

	The `.mobile-details` block below is emitted for every work but hidden on
	desktop. On mobile it becomes the second scroll-snap "screen" inside each
	painting card — swipe UP to reveal, swipe DOWN to hide. See portfolio.css
	under the WORKS GRID mobile media query.
-->
<div class="works">
	{#each visible as work, i (i)}
		<div
			class="work"
			data-shape={(i % 7) + 1}
			role="button"
			tabindex="0"
			onclick={() => openLightbox(i)}
			onkeydown={(event) => handleKey(event, i)}
			aria-label="View {work.title}"
		>
			<div class="frame">
				<img src={work.src} alt={work.alt} loading="lazy" />
			</div>
			<div class="label">{work.title}</div>

			<div class="mobile-details">
				<div class="md-counter">
					{String(i + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}
				</div>
				<h3 class="md-title">{work.title}</h3>
				{#if work.year || work.medium}
					<div class="md-year">{[work.year, work.medium].filter(Boolean).join(' · ')}</div>
				{/if}
				{#if work.size}
					<div class="md-dim">{work.size}</div>
				{/if}
				{#if work.sold}
					<div class="md-status">Sold</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
