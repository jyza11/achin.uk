<script lang="ts">
	import { paragraphs, type Bi } from '$lib/text';

	// A bilingual prose block: 中文 paragraphs, then the English ones (smaller, `lang="en"`).
	// Either language may be empty; nothing is rendered for it then.
	let { text, class: cls = '' }: { text: Bi; class?: string } = $props();
</script>

{#each paragraphs(text.zh) as para}
	<p class={cls}>{para}</p>
{/each}
{#each paragraphs(text.en) as para}
	<p class="bi-en {cls}" lang="en">{para}</p>
{/each}
