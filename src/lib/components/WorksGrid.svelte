<script lang="ts">
	import type { Work } from '$lib/data/works';
	import { lightboxStore } from '$lib/stores/lightbox';

	export let works: Work[] = [];
	export let limit: number | null = null;

	// `=== null` so a limit of 0 still acts as "show none" (avoids the falsy-zero bug)
	$: visible = limit !== null && limit !== undefined ? works.slice(0, limit) : works;

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
	REBUILD: simple uniform grid, plain <img>, explicit pixel-height frame.
	No aspect-ratio percent-resolution, no .w-N asymmetric spans, no
	background-image-on-empty-div. Once we confirm images render reliably
	we can layer the asymmetric editorial layout back on top.
-->
<div class="works">
	{#each visible as work, i (work.src)}
		<div
			class="work"
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
