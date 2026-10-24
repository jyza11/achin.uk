<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import BiText from '$lib/components/BiText.svelte';
	import profilePic from '$lib/assets/pro.jpg';
	import { bi, paragraphs } from '$lib/text';

	// Works + text blocks come from PocketBase via +page.server.ts (with local fallback).
	let { data } = $props();
	let galleryWorks = $derived(data.works);
	// Each block falls back to the copy below when the CMS has no row for it (2026-10-24 texts).
	const b = $derived(data.blocks);
	const eyebrow = $derived(
		bi(b['home.hero_eyebrow'], { zh: '畫家 · 淡水', en: 'Painter · Tamsui' })
	);
	const headline = $derived(
		bi(b['home.headline'], { zh: '將自己\n放進畫布。', en: 'I put myself into the canvas.' })
	);
	const deck = $derived(
		bi(b['home.hero_deck'], {
			zh: '無師自通的台灣畫家。以油畫將人體、符號與色彩，如積木般重新拼貼。',
			en: 'A self-taught Taiwanese painter who, in oil, pieces bodies, signs and colours back together like building blocks.'
		})
	);
	const notesTitle = $derived(bi(b['home.notes_title'], { zh: '他說', en: 'In his words' }));
	const quote = $derived(
		bi(b['home.quote'], {
			zh: '繪畫不是描摹現實，而是描繪人造事物的真實展現。',
			en: 'Painting is not copying reality. It is showing man-made things as they truly are.'
		})
	);
	const statement = $derived(
		bi(b['about.statement'], {
			zh: '阿晉（Achin）出身台灣高雄，1996 年第一家店開張時，拿起油漆刷把店裡的牆壁一面面畫滿，開啟了無師自通的創作之路。',
			en: 'Achin (阿晉) comes from Kaohsiung, Taiwan. When his first shop opened in 1996, he picked up a house-painting brush and filled its walls one by one, setting out on his path as a self-taught artist.'
		})
	);
	// Home shows only the bio's first paragraph; the full story is on /about.
	const statementLead = $derived({
		zh: paragraphs(statement.zh)[0] ?? '',
		en: paragraphs(statement.en)[0] ?? ''
	});
</script>

<svelte:head>
	<title>阿晉 Achin｜台灣當代畫家 · Contemporary painter, Taiwan</title>
</svelte:head>

<section class="hero">
	<div class="hero-text reveal">
		<div class="hero-eyebrow">{eyebrow.zh} <span lang="en">{eyebrow.en}</span></div>
		<h1>{headline.zh}<span class="title-en" lang="en">{headline.en}</span></h1>
		<BiText text={deck} class="hero-deck" />
		<div class="hero-actions">
			<a class="btn primary" href="/gallery">看作品 · View works <span class="arrow"></span></a>
			<a class="btn" href="/about">關於 · About</a>
		</div>
	</div>
	<div class="hero-canvas">
		<div class="slot">
			<img src={profilePic} alt="阿晉 Achin" style="width:100%;height:100%;object-fit:cover;" />
		</div>
		<div class="hero-caption">
			<span>畫家 · Artist</span>
			<span class="title">阿晉 Achin</span>
			<span>淡水 · Tamsui</span>
		</div>
		<span class="signature">Achin</span>
	</div>
</section>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">01 · 作品 · Selected</span>
			<h2 class="section-title">近期作品<span class="title-en" lang="en">Recent works</span></h2>
		</div>
		<div class="section-aside">A small preview · See all on /gallery</div>
	</header>
	{#if galleryWorks.length > 0}
		<WorksGrid works={galleryWorks} limit={4} />
	{:else}
		<p
			style="font-family: var(--serif); font-style: italic; color: var(--ink-3); text-align: center; padding: 40px 0;"
		>
			Publish a painting in the CMS to see it here.
		</p>
	{/if}
</section>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">02 · 關於 · About</span>
			<h2 class="section-title">
				{notesTitle.zh}<span class="title-en" lang="en">{notesTitle.en}</span>
			</h2>
		</div>
		<div class="section-aside">Continued on /about</div>
	</header>
	<div class="statement">
		<div class="statement-portrait">
			<img src={profilePic} alt="阿晉 Achin" style="width:100%;height:100%;object-fit:cover;" />
		</div>
		<div>
			<p class="pq">
				{quote.zh}{#if quote.en}<span class="title-en" lang="en">{quote.en}</span>{/if}
			</p>
			<BiText text={statementLead} />
			<div class="statement-meta">
				<div><span class="k">出生 · Born</span><span class="v">高雄 · Kaohsiung</span></div>
				<div><span class="k">現居 · Based</span><span class="v">淡水 · Tamsui</span></div>
				<div>
					<span class="k">媒材 · Medium</span><span class="v">油畫 · 壓克力 · 素描</span>
				</div>
			</div>
		</div>
	</div>
</section>
