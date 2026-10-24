<script lang="ts">
	import { paragraphs, type Bi } from '$lib/text';

	// A bilingual prose block: 中文 paragraphs, then the English ones (`lang="en"`, quieter).
	// Either language may be empty; nothing is rendered for it then.
	// `headings`: a paragraph with several lines renders its first line as a small heading
	// and each further line as its own paragraph — lets an editor write a titled list in a
	// plain textarea (e.g. the style section on /about). Off by default.
	let {
		text,
		class: cls = '',
		headings = false
	}: { text: Bi; class?: string; headings?: boolean } = $props();

	const lines = (para: string) =>
		para
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);
</script>

{#snippet block(para: string, en: boolean)}
	{@const ls = headings ? lines(para) : [para]}
	{#if ls.length > 1}
		<h3 class="bi-h" class:bi-en={en} lang={en ? 'en' : undefined}>{ls[0]}</h3>
		{#each ls.slice(1) as l}
			<p class={en ? `bi-en ${cls}` : cls} lang={en ? 'en' : undefined}>{l}</p>
		{/each}
	{:else}
		<p class={en ? `bi-en ${cls}` : cls} lang={en ? 'en' : undefined}>{ls[0]}</p>
	{/if}
{/snippet}

{#each paragraphs(text.zh) as para}
	{@render block(para, false)}
{/each}
{#each paragraphs(text.en) as para}
	{@render block(para, true)}
{/each}
