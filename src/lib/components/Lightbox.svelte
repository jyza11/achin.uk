<script lang="ts">
	import { onMount } from 'svelte';
	import { lightboxStore } from '$lib/stores/lightbox';
	import type { Work } from '$lib/data/works';

	let state: { isOpen: boolean; works: Work[]; index: number } = { isOpen: false, works: [], index: 0 };

	const unsub = lightboxStore.subscribe((s) => (state = s));

	$: current = state.works[state.index];

	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			if (!state.isOpen) return;
			if (e.key === 'Escape') lightboxStore.close();
			if (e.key === 'ArrowRight') lightboxStore.next();
			if (e.key === 'ArrowLeft') lightboxStore.prev();
		}
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('keydown', handleKey);
			unsub();
		};
	});
</script>

<div
	class="lightbox"
	class:open={state.isOpen}
	on:click|self={() => lightboxStore.close()}
	on:keydown={(e) => e.key === 'Enter' && lightboxStore.close()}
	role="dialog"
	aria-modal="true"
	aria-hidden={!state.isOpen}
	tabindex="-1"
>
	{#if current}
		<div class="lb-inner">
			<div class="lb-art">
				<div class="canvas-holder">
					<img src={current.src} alt={current.alt} />
				</div>
			</div>
			<div class="lb-meta">
				<div class="lb-counter">{state.index + 1} / {state.works.length}</div>
				<div class="kk">Selected Work</div>
				<h3>{current.title}</h3>
				{#if current.medium || current.size || current.year || current.sold}
					<dl class="lb-spec">
						{#if current.medium}
							<div><dt>Medium</dt><dd>{current.medium}</dd></div>
						{/if}
						{#if current.size}
							<div><dt>Size</dt><dd>{current.size}</dd></div>
						{/if}
						{#if current.year}
							<div><dt>Year</dt><dd>{current.year}</dd></div>
						{/if}
						{#if current.sold}
							<div><dt>Status</dt><dd>Sold</dd></div>
						{/if}
					</dl>
				{/if}
				<div class="lb-nav">
					<button type="button" on:click={() => lightboxStore.prev()}>← Prev</button>
					<button type="button" on:click={() => lightboxStore.next()}>Next →</button>
				</div>
			</div>
			<button
				class="lb-close"
				type="button"
				on:click={() => lightboxStore.close()}
				aria-label="Close"
			>
				✕
			</button>
		</div>
	{/if}
</div>

<style>
	.lb-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.lb-inner {
		position: relative;
	}
</style>
