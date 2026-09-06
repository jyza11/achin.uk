<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { lightboxStore } from '$lib/stores/lightbox';

	let closeButton: HTMLButtonElement | undefined = $state();
	let imageError = $state(false);

	// Open/close lifecycle bookkeeping — captured on the closed→open edge, restored
	// on open→closed. Deliberately plain variables, not $state: the effect below
	// writes them, and reactive bookkeeping would make its own writes dependencies.
	let prevOpen = false;
	let previouslyFocused: HTMLElement | null = null;
	let savedOverflow = '';

	beforeNavigate(() => lightboxStore.close());

	let current = $derived($lightboxStore.works[$lightboxStore.index]);

	// Reset image-error state whenever the current work changes
	$effect(() => {
		if (current) imageError = false;
	});

	$effect(() => {
		const isOpen = $lightboxStore.isOpen;
		if (!browser) return;
		if (isOpen && !prevOpen) {
			// transition: closed → open
			previouslyFocused = document.activeElement as HTMLElement | null;
			savedOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			// wait for Svelte to render the dialog before focusing
			tick().then(() => closeButton?.focus());
		} else if (!isOpen && prevOpen) {
			// transition: open → closed
			document.body.style.overflow = savedOverflow;
			previouslyFocused?.focus?.();
			previouslyFocused = null;
		}
		prevOpen = isOpen;
	});

	onMount(() => {
		function handleKey(event: KeyboardEvent) {
			const state = get(lightboxStore);
			if (!state.isOpen) return;
			// stopImmediatePropagation so the layout-level Escape (mobile menu)
			// doesn't also fire — a single keypress should close one layer
			if (event.key === 'Escape') {
				event.stopImmediatePropagation();
				lightboxStore.close();
				return;
			}
			if (event.key === 'ArrowRight') {
				event.stopImmediatePropagation();
				lightboxStore.next();
				return;
			}
			if (event.key === 'ArrowLeft') {
				event.stopImmediatePropagation();
				lightboxStore.prev();
			}
		}
		// capture phase = true so we run BEFORE the layout's handler
		document.addEventListener('keydown', handleKey, true);
		return () => {
			document.removeEventListener('keydown', handleKey, true);
			// safety: restore overflow if we unmount mid-open
			if (browser) document.body.style.overflow = savedOverflow;
		};
	});
</script>

{#if $lightboxStore.isOpen && current}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="lightbox open"
		role="dialog"
		aria-modal="true"
		aria-label={`Artwork: ${current.title}`}
		tabindex="-1"
		onclick={(event) => {
			// backdrop click only — clicks inside the dialog must not close it
			if (event.target === event.currentTarget) lightboxStore.close();
		}}
	>
		<div class="lb-inner">
			<div class="lb-art">
				<div class="canvas-holder">
					{#if imageError}
						<div class="lb-error">
							<p>Couldn't load this image.</p>
							<button
								type="button"
								onclick={() => {
									imageError = false;
								}}>Retry</button
							>
						</div>
					{:else}
						<img
							src={current.src}
							alt={current.alt}
							onerror={() => {
								imageError = true;
							}}
						/>
					{/if}
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
							<div>
								<dt>Medium</dt>
								<dd>{current.medium}</dd>
							</div>
						{/if}
						{#if current.size}
							<div>
								<dt>Size</dt>
								<dd>{current.size}</dd>
							</div>
						{/if}
						{#if current.year}
							<div>
								<dt>Year</dt>
								<dd>{current.year}</dd>
							</div>
						{/if}
						{#if current.sold}
							<div>
								<dt>Status</dt>
								<dd>Sold</dd>
							</div>
						{/if}
					</dl>
				{/if}

				<div class="lb-nav">
					<button type="button" onclick={() => lightboxStore.prev()}>← Prev</button>
					<button type="button" onclick={() => lightboxStore.next()}>Next →</button>
				</div>
			</div>

			<button
				class="lb-close"
				type="button"
				bind:this={closeButton}
				onclick={() => lightboxStore.close()}
				aria-label="Close"
			>
				✕
			</button>
		</div>
	</div>
{/if}
