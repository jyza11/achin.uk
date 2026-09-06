<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import { galleryWorks } from '$lib/data/works';
	import profilePic from '$lib/assets/pro.jpg';

	const tickerPhrases = [
		'油畫 · Paintings',
		'素描 · Sketches',
		'展覽 · Exhibitions',
		'工作室 · Studio'
	];
</script>

<section class="hero">
	<div class="hero-text reveal">
		<div class="hero-eyebrow">Painter · Taipei</div>
		<h1>The hour <em>before</em> the light forgets the room.</h1>
		<p class="hero-deck">
			Oil on linen — slow, considered surfaces of weather, water, and interior thresholds. Painted
			from life, then revisited from memory.
		</p>
		<div class="hero-actions">
			<a class="btn primary" href="/gallery">View Selected Works <span class="arrow"></span></a>
			<a class="btn" href="/about">關於 · About</a>
		</div>
	</div>
	<div class="hero-canvas">
		<div class="slot">
			<img
				src={profilePic}
				alt="Featured painting"
				style="width:100%;height:100%;object-fit:cover;"
			/>
		</div>
		<div class="hero-caption">
			<span>Featured</span>
			<span class="title">Recent work · Studio</span>
			<span>2026</span>
		</div>
		<span class="signature">Achin</span>
	</div>
</section>

<div class="ticker">
	<div class="ticker-track">
		{#each [...tickerPhrases, ...tickerPhrases, ...tickerPhrases] as phrase}
			<span>{phrase}</span>
		{/each}
	</div>
</div>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">01 · Selected</span>
			<h2 class="section-title">Recent <em>works</em></h2>
		</div>
		<div class="section-aside">A small preview · See all on /gallery</div>
	</header>
	{#if galleryWorks.length > 0}
		<WorksGrid works={galleryWorks} limit={4} />
	{:else}
		<p
			style="font-family: var(--serif); font-style: italic; color: var(--ink-3); text-align: center; padding: 40px 0;"
		>
			Add images to <code>src/lib/assets/gallery/</code> to see them here.
		</p>
	{/if}
</section>

<section class="band statement-band">
	<header class="section-head">
		<div>
			<span class="section-num">02 · Notes</span>
			<h2 class="section-title">From the <em>studio</em></h2>
		</div>
		<div class="section-aside">Continued on /about</div>
	</header>
	<div class="statement">
		<div class="statement-portrait">
			<img
				src={profilePic}
				alt="The artist at work"
				style="width:100%;height:100%;object-fit:cover;"
			/>
		</div>
		<div>
			<p class="pq">
				我不在家就在去咖啡館的路上 — 雙叟 · 左岸 · 巴黎 · 花街 — 黃金海岸的比基尼 — 可憐我一雙
				Ferragamo 的高跟鞋。
			</p>
			<p>
				A practice built on slow looking — light, weather, and the corners of rooms held still long
				enough to draw out the hour.
			</p>
			<div class="statement-meta">
				<div><span class="k">Born</span><span class="v">Taipei</span></div>
				<div><span class="k">Based</span><span class="v">Studio · Taipei</span></div>
				<div><span class="k">Medium</span><span class="v">Oil · Graphite</span></div>
			</div>
		</div>
	</div>
</section>
