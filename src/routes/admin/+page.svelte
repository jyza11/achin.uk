<script lang="ts">
	import { onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { pb } from '$lib/pb-browser';
	import { collectionLabels, statusLabels, pbErrorToZh } from '$lib/admin/labels';

	interface Work extends RecordModel {
		title_zh: string;
		title_en: string;
		year: number;
		collection: 'gallery' | 'sketch';
		status: 'draft' | 'published';
		sold: boolean;
		image: string;
	}

	let works = $state<Work[]>([]);
	let loading = $state(true);
	let error = $state('');
	let filter = $state<'all' | 'gallery' | 'sketch'>('all');

	let filtered = $derived(filter === 'all' ? works : works.filter((w) => w.collection === filter));

	onMount(async () => {
		try {
			works = await pb.collection('works').getFullList<Work>({
				sort: 'collection,sort,-created'
			});
		} catch (err) {
			error = pbErrorToZh(err);
		} finally {
			loading = false;
		}
	});

	function thumbUrl(work: Work): string {
		return pb.files.getURL(work, work.image, { thumb: '400x0' });
	}

	// Mobile card meta line, e.g. "油畫 · 公開 · 2025 · 已售" — omits empty parts.
	function workMeta(work: Work): string {
		return [
			collectionLabels[work.collection],
			statusLabels[work.status],
			work.year ? String(work.year) : '',
			work.sold ? '已售' : ''
		]
			.filter(Boolean)
			.join(' · ');
	}
</script>

<svelte:head>
	<title>作品 — Achin 後台</title>
</svelte:head>

<div class="admin-list-header">
	<h1 class="admin-list-title">作品</h1>
	<a class="admin-btn admin-btn-accent" href="/admin/works/new">新增作品</a>
</div>

<div class="admin-filters">
	<button class:active={filter === 'all'} onclick={() => (filter = 'all')}>全部</button>
	<button class:active={filter === 'gallery'} onclick={() => (filter = 'gallery')}>油畫</button>
	<button class:active={filter === 'sketch'} onclick={() => (filter = 'sketch')}>素描</button>
</div>

{#if loading}
	<p class="admin-state">載入中…</p>
{:else if error}
	<p class="admin-state admin-state-error">無法連線到後台（{error}）</p>
{:else if filtered.length === 0}
	<p class="admin-state">尚無作品</p>
{:else}
	<ul class="admin-work-cards">
		{#each filtered as work (work.id)}
			<li class:muted={work.status === 'draft'}>
				<a class="admin-work-card" href={`/admin/works/${work.id}`}>
					<img
						class="admin-work-card-thumb"
						src={thumbUrl(work)}
						alt=""
						loading="lazy"
						decoding="async"
					/>
					<div class="admin-work-card-body">
						<span class="admin-work-card-title">
							{work.title_zh}
							{#if work.status === 'draft'}
								<span class="admin-badge-draft">草稿</span>
							{/if}
						</span>
						{#if work.title_en}
							<span class="admin-title-en">{work.title_en}</span>
						{/if}
						<span class="admin-work-card-meta">{workMeta(work)}</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>

	<table class="admin-table">
		<thead>
			<tr>
				<th></th>
				<th>標題</th>
				<th>系列</th>
				<th>狀態</th>
				<th>已售</th>
				<th>年份</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as work (work.id)}
				<tr class:muted={work.status === 'draft'}>
					<td class="admin-cell-thumb">
						<img class="admin-thumb" src={thumbUrl(work)} alt={work.title_zh} loading="lazy" />
					</td>
					<td data-label="標題">
						{work.title_zh}
						{#if work.title_en}
							<span class="admin-title-en">{work.title_en}</span>
						{/if}
					</td>
					<td data-label="系列">{collectionLabels[work.collection]}</td>
					<td data-label="狀態">
						{statusLabels[work.status]}
						{#if work.status === 'draft'}
							<span class="admin-badge-draft">草稿</span>
						{/if}
					</td>
					<td data-label="已售">{work.sold ? '✓' : ''}</td>
					<td data-label="年份">{work.year || ''}</td>
					<td data-label="">
						<a class="admin-btn" href={`/admin/works/${work.id}`}>編輯</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
