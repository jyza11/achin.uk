<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { pb } from '$lib/pb-browser';
	import { actionLabels, textLabels, pbErrorToZh } from '$lib/admin/labels';

	interface ContentBlock extends RecordModel {
		slug: string;
		text_zh: string;
		text_en: string;
		note: string;
	}

	// One entry per loaded block. `saved_zh`/`saved_en` track the last value written to the
	// backend (the "baseline") so the 儲存 button can tell whether this block is dirty.
	interface BlockState {
		record: ContentBlock;
		text_zh: string;
		text_en: string;
		saved_zh: string;
		saved_en: string;
		saving: boolean;
		saved: boolean;
		savedTimer: ReturnType<typeof setTimeout> | null;
		error: string;
	}

	const groupOrder = ['home', 'about', 'gallery', 'contact', 'events'] as const;
	type GroupKey = (typeof groupOrder)[number] | 'other';

	function groupOf(slug: string): GroupKey {
		const prefix = slug.split('.')[0];
		return (groupOrder as readonly string[]).includes(prefix) ? (prefix as GroupKey) : 'other';
	}

	let blocks = $state<BlockState[]>([]);
	let loading = $state(true);
	let loadError = $state('');

	let groups = $derived.by(() => {
		const byGroup = new Map<GroupKey, BlockState[]>();
		for (const block of blocks) {
			const key = groupOf(block.record.slug);
			const list = byGroup.get(key);
			if (list) {
				list.push(block);
			} else {
				byGroup.set(key, [block]);
			}
		}
		const order: GroupKey[] = [...groupOrder, 'other'];
		return order
			.filter((key) => byGroup.has(key))
			.map((key) => ({ key, label: textLabels.groups[key], items: byGroup.get(key) ?? [] }));
	});

	function isDirty(block: BlockState): boolean {
		return block.text_zh !== block.saved_zh || block.text_en !== block.saved_en;
	}

	let anyDirty = $derived(blocks.some(isDirty));

	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (anyDirty) {
			event.preventDefault();
			event.returnValue = '';
		}
	}

	onMount(async () => {
		window.addEventListener('beforeunload', handleBeforeUnload);
		try {
			const records = await pb.collection('content_blocks').getFullList<ContentBlock>({
				sort: 'slug'
			});
			blocks = records.map((record) => ({
				record,
				text_zh: record.text_zh ?? '',
				text_en: record.text_en ?? '',
				saved_zh: record.text_zh ?? '',
				saved_en: record.text_en ?? '',
				saving: false,
				saved: false,
				savedTimer: null,
				error: ''
			}));
		} catch (err) {
			loadError = pbErrorToZh(err);
		} finally {
			loading = false;
		}
	});

	onDestroy(() => {
		window.removeEventListener('beforeunload', handleBeforeUnload);
		for (const b of blocks) if (b.savedTimer) clearTimeout(b.savedTimer);
	});

	async function save(block: BlockState) {
		if (block.saving) return;
		block.saving = true;
		block.error = '';
		try {
			await pb.collection('content_blocks').update(block.record.id, {
				text_zh: block.text_zh,
				text_en: block.text_en
			});
			block.saved_zh = block.text_zh;
			block.saved_en = block.text_en;
			block.saved = true;
			if (block.savedTimer) clearTimeout(block.savedTimer);
			block.savedTimer = setTimeout(() => {
				block.saved = false;
				block.savedTimer = null;
			}, 2000);
		} catch (err) {
			block.error = pbErrorToZh(err);
		} finally {
			block.saving = false;
		}
	}
</script>

<svelte:head>
	<title>頁面文字 — Achin 後台</title>
</svelte:head>

<h1 class="admin-list-title">{textLabels.heading}</h1>
<p class="admin-hint admin-text-hint">{textLabels.hint}</p>

{#if loading}
	<p class="admin-state">{textLabels.loading}</p>
{:else if loadError}
	<p class="admin-state admin-state-error">無法連線到後台（{loadError}）</p>
{:else if blocks.length === 0}
	<p class="admin-state">{textLabels.empty}</p>
{:else}
	{#each groups as group (group.key)}
		<section class="admin-text-group">
			<h2>{group.label}</h2>
			<div class="admin-text-cards">
				{#each group.items as block (block.record.id)}
					<div class="admin-text-card">
						<div class="admin-text-card-header">
							<span class="admin-text-slug">{block.record.slug}</span>
							{#if block.record.note}
								<span class="admin-hint">{block.record.note}</span>
							{/if}
						</div>
						<div class="admin-form-grid">
							<div class="admin-field">
								<label for={`text-zh-${block.record.id}`}>{textLabels.zh}</label>
								<textarea id={`text-zh-${block.record.id}`} bind:value={block.text_zh} rows="4"
								></textarea>
							</div>
							<div class="admin-field">
								<label for={`text-en-${block.record.id}`}>{textLabels.en}</label>
								<textarea id={`text-en-${block.record.id}`} bind:value={block.text_en} rows="4"
								></textarea>
							</div>
						</div>
						{#if block.error}
							<p class="admin-error">{block.error}</p>
						{/if}
						<div class="admin-text-card-actions">
							<button
								class="admin-btn admin-btn-accent"
								type="button"
								disabled={!isDirty(block) || block.saving}
								onclick={() => save(block)}
							>
								{block.saving ? actionLabels.saving : actionLabels.save}
							</button>
							{#if block.saved}
								<span class="admin-text-saved">{textLabels.saved}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/each}
{/if}
