<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import { galleryWorks } from '$lib/data/works';
</script>

<svelte:head>
	<title>油畫 · Paintings — Achin</title>
</svelte:head>

<!--
	Editorial reading order per artist's brief:
	  1. Artwork first (WorksGrid — image only, no title above)
	  2. Text description (the .gallery-note paragraph)
	  3. Title header last (.section-head--footer — reads as a closing colophon,
	     not a lead-in)

	The user lands on the paintings; the section title only appears after they've
	seen and read past the work. On mobile the WorksGrid fills 100dvh, so the
	description + header are revealed by scrolling the page down past the gallery.
-->
<section class="band">
	{#if galleryWorks.length === 0}
		<p class="empty">
			No works to show yet. Add images to <code>src/lib/assets/gallery/</code> to populate this page.
		</p>
	{:else}
		<WorksGrid works={galleryWorks} />
	{/if}

	<div class="gallery-note">
		<p>
			A selection of recent oil paintings — each on linen unless noted. Tap any painting on desktop for a lightbox; on mobile, swipe up on a painting to see its details.
		</p>
		<!-- Replace this paragraph with the artist's own voice / bilingual pair when ready. -->
	</div>

	<header class="section-head section-head--footer">
		<div>
			<span class="section-num">油畫 · Paintings</span>
			<h1 class="section-title">Selected <em>works</em></h1>
		</div>
		<div class="section-aside">
			{galleryWorks.length} {galleryWorks.length === 1 ? 'work' : 'works'} · Oil on linen
		</div>
	</header>
</section>

<style>
	/* Override the global .band's default top padding (96px desktop / 56px
	   mobile). It was there for a lead-in section-head — with the header
	   moved to the bottom of this page there is no lead-in element, so the
	   top padding becomes empty white space above the paintings. Zero it
	   here; keep bottom padding for space after the closing header. Svelte
	   scopes this rule via a hash class, giving it higher specificity than
	   the global `section.band` in portfolio.css. */
	section.band {
		padding-top: 0;
	}

	.empty {
		font-family: var(--serif);
		font-style: italic;
		color: var(--ink-3);
		text-align: center;
		padding: 80px 0;
	}

	.gallery-note {
		max-width: 56ch;
		margin: 40px auto 24px;
		padding: 24px 0;
		border-top: 1px solid var(--rule);
		text-align: center;
	}

	.gallery-note p {
		font-family: var(--serif);
		font-style: italic;
		font-size: 18px;
		line-height: 1.6;
		color: var(--ink-2);
		margin: 0;
		text-wrap: pretty;
	}

	@media (max-width: 768px) {
		.gallery-note {
			margin: 32px 18px 20px;
			padding: 20px 0;
		}
		.gallery-note p {
			font-size: 16px;
		}
	}
</style>
