<script lang="ts">
	import BiText from '$lib/components/BiText.svelte';
	import { bi } from '$lib/text';

	// Contact copy + details come from CMS content_blocks (fallback: the 2026-10-24 text below).
	// The paintings hang at Hacha, Achin's restaurant in Tamsui — there is no studio.
	// `contact.hours` is one line per row, "label | value"; the 中文 and English rows pair by
	// line number (label from each language, value from English, else 中文).
	// Email and Instagram rows render only when the block has a value — no placeholders on a
	// live site. The fake contact form was removed 2026-10-24 (it dropped every message);
	// a real form (Netlify Forms) is a later slice.
	let { data } = $props();
	const b = $derived(data.blocks);
	const title = $derived(bi(b['contact.title'], { zh: '來看畫', en: 'See the paintings' }));
	const headline = $derived(
		bi(b['contact.headline'], {
			zh: '來淡水，看原作。',
			en: 'Come to Tamsui and see the originals.'
		})
	);
	const intro = $derived(
		bi(b['contact.intro'], {
			zh: '張忠晉的原作展示於他在淡水經營的餐廳 Hacha。營業時間內歡迎來看畫。',
			en: "Achin's original paintings hang at Hacha, the restaurant he runs in Tamsui. Drop in during opening hours to see them."
		})
	);
	const hoursText = $derived(
		bi(b['contact.hours'], { zh: '每日 | 12:30–21:00', en: 'Daily | 12:30–21:00' })
	);
	const address = $derived(
		bi(b['contact.address'], {
			zh: 'Hacha 黑客茶舖\n新北市淡水區北新路117-2號',
			en: 'Hacha\nNo. 117-2, Beixin Rd, Tamsui, New Taipei'
		})
	);
	const contactEmail = $derived((b['contact.email']?.en || b['contact.email']?.zh || '').trim());
	const instagram = $derived(
		(b['contact.instagram']?.en || b['contact.instagram']?.zh || '').trim()
	);

	function rows(text: string): string[][] {
		return text
			.split('\n')
			.map((l) => l.split('|').map((s) => s.trim()))
			.filter((r) => r.length === 2 && r[0]);
	}
	const hours = $derived.by(() => {
		const zh = rows(hoursText.zh);
		const en = rows(hoursText.en);
		return Array.from({ length: Math.max(zh.length, en.length) }, (_, i) => ({
			zh: zh[i]?.[0] ?? '',
			en: en[i]?.[0] ?? '',
			value: en[i]?.[1] ?? zh[i]?.[1] ?? ''
		}));
	});
	const lines = (text: string) => text.split('\n').filter((l) => l.trim());
</script>

<svelte:head>
	<title>合作 · Contact — Achin</title>
</svelte:head>

<section class="band visit-band">
	<header class="section-head">
		<div>
			<span class="section-num">合作 · Contact</span>
			<h1 class="section-title">{title.zh}<span class="title-en" lang="en">{title.en}</span></h1>
		</div>
		<div class="section-aside">淡水 · <span lang="en">Tamsui</span></div>
	</header>

	<div class="visit">
		<div class="visit-text">
			<h2>{headline.zh}<span class="title-en" lang="en">{headline.en}</span></h2>
			<BiText text={intro} />
			<div class="hours">
				{#each hours as row}
					<div class="hours-row" class:closed={/request|closed|休/i.test(row.value)}>
						<span
							>{row.zh}{#if row.en}&nbsp;<span lang="en">{row.en}</span>{/if}</span
						>
						<span>{row.value}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="visit-card">
			<h3>地址 · <span lang="en">Address</span></h3>
			<div class="addr">
				{#each lines(address.zh) as l}{l}<br />{/each}
				{#if address.en}
					<span lang="en"
						>{#each lines(address.en) as l}{l}<br />{/each}</span
					>
				{/if}
			</div>
			{#if contactEmail}
				<div class="row">
					<span class="k">Email</span>
					<span class="v"><a href="mailto:{contactEmail}">{contactEmail}</a></span>
				</div>
			{/if}
			{#if instagram}
				<div class="row">
					<span class="k">Instagram</span>
					<span class="v">
						<a href="https://www.instagram.com/{instagram.replace(/^@/, '')}/" rel="noopener"
							>{instagram}</a
						>
					</span>
				</div>
			{/if}
		</div>
	</div>
</section>
