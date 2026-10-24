<script lang="ts">
	import { bi } from '$lib/text';

	// Empty-state text is editable in the CMS; falls back to the copy below (2026-10-24 texts).
	let { data } = $props();
	const line = $derived(
		bi(data.blocks['events.empty_line'], { zh: '展覽 · 即將公布', en: 'Exhibitions · Coming soon' })
	);
	// The deck ends in a link to /contact, so each language's text ends where the link begins.
	const deck = $derived(
		bi(data.blocks['events.empty_deck'], {
			zh: '展覽消息將在此公布。在那之前，原作可在淡水黑客茶舖看到，詳見',
			en: 'Exhibitions will be listed here. Until then, the originals can be seen at Hacha in Tamsui. See'
		})
	);
</script>

<svelte:head>
	<title>展覽 · Exhibitions — 阿晉 Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">展覽 · Exhibitions</span>
			<h1 class="section-title">
				展覽<span class="title-en" lang="en">Current and forthcoming</span>
			</h1>
		</div>
		<div class="section-aside">個展 · 聯展 · <span lang="en">Solo · Group</span></div>
	</header>

	<div class="events-empty">
		<p class="events-empty-line">{line.zh}</p>
		{#if line.en}<p class="events-empty-line bi-en" lang="en">{line.en}</p>{/if}
		{#if deck.zh}
			<p class="events-empty-deck">{deck.zh}<a href="/contact">合作</a>。</p>
		{/if}
		{#if deck.en}
			<p class="events-empty-deck bi-en" lang="en">{deck.en} <a href="/contact">Contact</a>.</p>
		{/if}
	</div>
</section>

<style>
	.events-empty {
		text-align: center;
		padding: 80px 0;
	}
	.events-empty-line {
		font-family: var(--serif);
		font-style: italic;
		font-size: 28px;
		color: var(--ink-2);
		margin: 0 0 16px;
		text-wrap: balance;
	}
	.events-empty-deck {
		font-family: var(--serif);
		font-size: 17px;
		color: var(--ink-3);
		max-width: 42ch;
		margin: 0 auto;
	}
	.events-empty-line.bi-en {
		font-size: 20px;
		color: var(--ink-3);
		margin-top: -8px;
	}
	.events-empty-deck.bi-en {
		font-size: 15px;
		margin-top: 10px;
	}
	.events-empty-deck a {
		color: var(--oxblood);
		border-bottom: 1px solid currentColor;
	}
</style>
