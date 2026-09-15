<script lang="ts">
	import { onMount } from 'svelte';
	import { ClientResponseError } from 'pocketbase';
	import { pb } from '$lib/pb-browser';
	import { pbErrorToZh } from '$lib/admin/labels';
	import WorkForm, { type Work } from '$lib/admin/WorkForm.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	let record = $state<Work | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let error = $state('');

	onMount(async () => {
		try {
			record = await pb.collection('works').getOne<Work>(params.id);
		} catch (err) {
			if (err instanceof ClientResponseError && err.status === 404) {
				notFound = true;
			} else {
				error = pbErrorToZh(err);
			}
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>編輯作品 — Achin 後台</title>
</svelte:head>

<h1 class="admin-list-title">編輯作品</h1>

{#if loading}
	<p class="admin-state">載入中…</p>
{:else if notFound}
	<p class="admin-state admin-state-error">找不到作品</p>
{:else if error}
	<p class="admin-state admin-state-error">{error}</p>
{:else if record}
	<WorkForm work={record} />
{/if}
