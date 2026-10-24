<script lang="ts">
	import profilePic from '$lib/assets/pro.jpg';
	import BiText from '$lib/components/BiText.svelte';
	import { bi } from '$lib/text';

	// Text comes from the CMS `content_blocks` (edited by the artist); each block falls back
	// to the copy below when the CMS has no row for it. Achin's own text, 2026-10-24.
	// Name rule: never the full Chinese name — 中文 uses 阿晉（Achin）, English Achin.
	let { data } = $props();
	const b = $derived(data.blocks);
	const title = $derived(
		bi(b['about.title'], {
			zh: '從牆面塗鴉到心靈重塑',
			en: 'From painted walls to a reshaped inner world'
		})
	);
	const quote = $derived(
		bi(b['about.quote'], {
			zh: '將自己放進畫布，讓參與的角色自己對話，直到它們安靜下來、找到平衡。',
			en: 'I put myself into the canvas and let the figures in it talk to each other, until they fall quiet and find their balance.'
		})
	);
	const statement = $derived(
		bi(b['about.statement'], {
			zh: '阿晉（Achin）出身台灣高雄，1996 年第一家店開張時，拿起油漆刷把店裡的牆壁一面面畫滿，開啟了無師自通的創作之路。',
			en: 'Achin (阿晉) comes from Kaohsiung, Taiwan. When his first shop opened in 1996, he picked up a house-painting brush and filled its walls one by one, setting out on his path as a self-taught artist.'
		})
	);
	const practiceTitle = $derived(
		bi(b['about.practice_title'], {
			zh: '核心美學與風格語彙',
			en: 'Core aesthetics and visual vocabulary'
		})
	);
	const practice = $derived(
		bi(b['about.practice'], {
			zh: '阿晉的創作汲取了米羅、畢卡索與康丁斯基的養分，並結合他眼中「融合」的當代台灣味。',
			en: "Achin's work draws on Miró, Picasso and Kandinsky, combined with what he sees as the fusion of contemporary Taiwan."
		})
	);
	const cta = $derived(
		bi(b['about.cta'], {
			zh: '原作展示於淡水黑客茶舖。',
			en: 'The original paintings hang at Hacha in Tamsui.'
		})
	);
</script>

<svelte:head>
	<title>關於 · About — 阿晉 Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">關於藝術家 · About the artist</span>
			<h1 class="section-title">{title.zh}<span class="title-en" lang="en">{title.en}</span></h1>
		</div>
		<div class="section-aside">淡水 · <span lang="en">Tamsui</span></div>
	</header>

	<div class="statement">
		<div class="statement-portrait">
			<img src={profilePic} alt="阿晉 Achin" />
		</div>
		<div>
			<p class="pq">
				{quote.zh}{#if quote.en}<span class="title-en" lang="en">{quote.en}</span>{/if}
			</p>
			<BiText text={statement} />

			<h2 class="practice-title">
				{practiceTitle.zh}<span class="title-en" lang="en">{practiceTitle.en}</span>
			</h2>
			<BiText text={practice} headings />

			<div class="statement-meta">
				<div><span class="k">出生 · Born</span><span class="v">高雄 · Kaohsiung</span></div>
				<div><span class="k">現居 · Based</span><span class="v">淡水 · Tamsui</span></div>
				<div>
					<span class="k">媒材 · Medium</span><span class="v">油畫 · 壓克力 · 素描</span>
				</div>
			</div>
		</div>
	</div>

	<div class="page-cta">
		<BiText text={cta} />
		<a href="/contact">來看畫 · Visit →</a>
	</div>
</section>
