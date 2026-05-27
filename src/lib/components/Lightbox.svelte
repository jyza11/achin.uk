<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { lightboxStore } from '$lib/stores/lightbox';

	let closeButton: HTMLButtonElement | undefined;

	// Close on any route change — prevents stale state across pages
	beforeNavigate(() => lightboxStore.close());

	$: current = $lightboxStore.works[$lightboxStore.index];

	// Body scroll lock + auto-focus close button when opened
	$: if (browser) {
		if ($lightboxStore.isOpen) {
			document.body.style.overflow = 'hidden';
			// next tick — let the dialog render before focusing
			setTimeout(() => closeButton?.focus(), 0);
		} else {
			document.body.style.overflow = '';
		}
	}

	onMount(() => {
		function handleKey(event: KeyboardEvent) {
			const state = get(lightboxStore);
			if (!state.isOpen) return;
			if (event.key === 'Escape') lightboxStore.close();
			if (event.key === 'ArrowRight') lightboxStore.next();
			if (event.key === 'ArrowLeft') lightboxStore.prev();
		}
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('keydown', handleKey);
			// safety: clear any scroll lock if the component unmounts mid-open
			if (browser) document.body.style.overflow = '';
		};
	});
</script>

{#if $lightboxStore.isOpen && current}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div
		class="lightbox open"
		role="dialog"
		aria-modal="true"
		aria-label="Artwork detail"
		on:click|self={() => lightboxStore.close()}
	>
		<div class="lb-inner">
			<div class="lb-art">
				<div class="canvas-holder">
					<img src={current.src} alt={current.alt} />
				</div>
			</div>

			<div class="lb-meta">
				<div class="lb-counter">
					{$lightboxStore.index + 1} / {$lightboxStore.works.length}
				</div>
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
				bind:this={closeButton}
				on:click={() => lightboxStore.close()}
				aria-label="Close"
			>
				✕
			</button>
		</div>
	</div>
{/if}
