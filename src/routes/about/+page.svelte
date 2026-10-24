<script lang="ts">
	import profilePic from '$lib/assets/pro.jpg';
	import BiText from '$lib/components/BiText.svelte';
	import { bi } from '$lib/text';

	// Text comes from the CMS `content_blocks` (edited by the artist); each block falls back
	// to the copy below when the CMS has no row for it (2026-10-24 texts).
	let { data } = $props();
	const b = $derived(data.blocks);
	const title = $derived(bi(b['about.title'], { zh: '關於張忠晉', en: 'About Achin' }));
	const quote = $derived(
		bi(b['about.quote'], { zh: '我總是追求最好的。', en: 'I always go for the best.' })
	);
	const statement = $derived(
		bi(b['about.statement'], {
			zh: '張忠晉生於高雄，年輕時北上台北打拼，後來到淡水開餐廳。',
			en: 'Achin was born in Kaohsiung, moved north to Taipei as a young man, and later opened a restaurant in Tamsui.'
		})
	);
	const practice = $derived(
		bi(b['about.practice'], {
			zh: '他向心中最好的畫家學習，再把學到的化成自己的語言。',
			en: 'He learns from the painters he thinks are the best, and turns what he learns into a language of his own.'
		})
	);
	const cta = $derived(
		bi(b['about.cta'], {
			zh: '原作展示於淡水 Hacha。',
			en: 'The original paintings hang at Hacha in Tamsui.'
		})
	);
</script>

<svelte:head>
	<title>關於 · About — Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">關於 · About</span>
			<h1 class="section-title">{title.zh}<span class="title-en" lang="en">{title.en}</span></h1>
		</div>
		<div class="section-aside">淡水 · <span lang="en">Tamsui</span></div>
	</header>

	<div class="statement">
		<div class="statement-portrait">
			<img src={profilePic} alt="張忠晉 Achin" />
		</div>
		<div>
			<p class="pq">
				{quote.zh}{#if quote.en}<span class="title-en" lang="en">{quote.en}</span>{/if}
			</p>
			<BiText text={statement} />
			<BiText text={practice} />

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
