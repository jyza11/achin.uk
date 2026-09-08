<script module lang="ts">
	import type { RecordModel } from 'pocketbase';

	export interface Work extends RecordModel {
		title_zh: string;
		title_en: string;
		description_zh: string;
		description_en: string;
		year: number;
		medium: string;
		size: string;
		sold: boolean;
		collection: 'gallery' | 'sketch';
		sort: number;
		status: 'draft' | 'published';
		image: string;
	}
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb-browser';
	import {
		fieldLabels,
		collectionLabels,
		statusLabels,
		actionLabels,
		formLabels,
		pbErrorToZh
	} from '$lib/admin/labels';

	interface Props {
		work: Work | null;
	}

	let { work }: Props = $props();

	// `work` is only ever read once, to seed the form's initial values — this component is
	// re-created per page load (new work vs. an edit), it never receives a changed `work` prop
	// while mounted. `untrack` opts out of the "read a reactive value outside $derived" warning.
	let title_zh = $state(untrack(() => work?.title_zh ?? ''));
	let title_en = $state(untrack(() => work?.title_en ?? ''));
	let description_zh = $state(untrack(() => work?.description_zh ?? ''));
	let description_en = $state(untrack(() => work?.description_en ?? ''));
	let year = $state<number | undefined>(untrack(() => work?.year ?? undefined));
	let medium = $state(untrack(() => work?.medium ?? ''));
	let size = $state(untrack(() => work?.size ?? ''));
	let collection = $state<'gallery' | 'sketch'>(untrack(() => work?.collection ?? 'gallery'));
	let status = $state<'draft' | 'published'>(untrack(() => work?.status ?? 'draft'));
	let sold = $state(untrack(() => work?.sold ?? false));
	let sort = $state<number | undefined>(untrack(() => work?.sort ?? undefined));

	let imageFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let objectUrlToRevoke: string | null = null;

	let currentImageUrl = $derived(work ? pb.files.getURL(work, work.image, { thumb: '400x0' }) : '');

	let saving = $state(false);
	let errorMsg = $state('');

	function revokePreview() {
		if (objectUrlToRevoke) {
			URL.revokeObjectURL(objectUrlToRevoke);
			objectUrlToRevoke = null;
		}
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		revokePreview();
		imageFile = file;
		if (file) {
			const url = URL.createObjectURL(file);
			previewUrl = url;
			objectUrlToRevoke = url;
		} else {
			previewUrl = null;
		}
	}

	onDestroy(revokePreview);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (saving || deleting) return;
		errorMsg = '';

		if (!work && !imageFile) {
			errorMsg = formLabels.missingImage;
			return;
		}
		if (!title_zh.trim()) {
			errorMsg = formLabels.missingTitle;
			return;
		}

		saving = true;
		try {
			const fd = new FormData();
			fd.append('title_zh', title_zh);
			fd.append('title_en', title_en);
			fd.append('description_zh', description_zh);
			fd.append('description_en', description_en);
			if (year !== undefined) fd.append('year', String(year));
			fd.append('medium', medium);
			fd.append('size', size);
			fd.append('collection', collection);
			fd.append('status', status);
			fd.append('sold', sold ? 'true' : 'false');
			if (sort !== undefined) fd.append('sort', String(sort));
			if (imageFile) fd.append('image', imageFile);

			if (work) {
				await pb.collection('works').update(work.id, fd);
			} else {
				await pb.collection('works').create(fd);
			}
			goto('/admin');
		} catch (err) {
			errorMsg = pbErrorToZh(err);
		} finally {
			saving = false;
		}
	}

	let deleting = $state(false);
	async function handleDelete() {
		if (!work || deleting || saving) return;
		if (!confirm(formLabels.deleteConfirm)) return;
		deleting = true;
		try {
			await pb.collection('works').delete(work.id);
			goto('/admin');
		} catch (err) {
			errorMsg = pbErrorToZh(err);
			deleting = false;
		}
	}
</script>

<form class="admin-form" autocomplete="off" onsubmit={handleSubmit}>
	<div class="admin-field admin-field-full">
		<span class="admin-field-label">{fieldLabels.image}</span>
		{#if previewUrl || currentImageUrl}
			<img class="admin-image-preview" src={previewUrl || currentImageUrl} alt="" />
		{/if}
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp,image/avif"
			onchange={onFileChange}
		/>
		<p class="admin-hint">{formLabels.imageHint}</p>
	</div>

	<div class="admin-field admin-field-full">
		<label for="work-title-zh">{fieldLabels.title_zh}</label>
		<input
			id="work-title-zh"
			type="text"
			bind:value={title_zh}
			maxlength="200"
			required
			enterkeyhint="done"
		/>
	</div>

	<div class="admin-field admin-field-full">
		<label for="work-title-en">{fieldLabels.title_en}</label>
		<input
			id="work-title-en"
			type="text"
			bind:value={title_en}
			enterkeyhint="done"
			autocapitalize="off"
			spellcheck="false"
		/>
	</div>

	<div class="admin-field admin-field-full">
		<label for="work-description-zh">{fieldLabels.description_zh}</label>
		<textarea id="work-description-zh" bind:value={description_zh} maxlength="5000" rows="5"
		></textarea>
	</div>

	<div class="admin-field admin-field-full">
		<label for="work-description-en">{fieldLabels.description_en}</label>
		<textarea id="work-description-en" bind:value={description_en} rows="5"></textarea>
	</div>

	<div class="admin-form-grid">
		<div class="admin-field">
			<label for="work-year">{fieldLabels.year}</label>
			<input
				id="work-year"
				type="number"
				bind:value={year}
				min="1900"
				max="2100"
				inputmode="numeric"
				enterkeyhint="done"
			/>
		</div>

		<div class="admin-field">
			<label for="work-medium">{fieldLabels.medium}</label>
			<input id="work-medium" type="text" bind:value={medium} enterkeyhint="done" />
		</div>

		<div class="admin-field">
			<label for="work-size">{fieldLabels.size}</label>
			<input id="work-size" type="text" bind:value={size} enterkeyhint="done" />
		</div>

		<div class="admin-field">
			<label for="work-collection">{fieldLabels.collection}</label>
			<select id="work-collection" bind:value={collection}>
				<option value="gallery">{collectionLabels.gallery}</option>
				<option value="sketch">{collectionLabels.sketch}</option>
			</select>
		</div>

		<div class="admin-field">
			<span class="admin-field-label">{fieldLabels.status}</span>
			<div class="admin-radio-group">
				<label>
					<input type="radio" name="work-status" value="draft" bind:group={status} />
					{statusLabels.draft}
				</label>
				<label>
					<input type="radio" name="work-status" value="published" bind:group={status} />
					{statusLabels.published}
				</label>
			</div>
		</div>

		<div class="admin-field">
			<label class="admin-checkbox-label">
				<input type="checkbox" bind:checked={sold} />
				{fieldLabels.sold}
			</label>
		</div>

		<div class="admin-field">
			<label for="work-sort">{fieldLabels.sort}</label>
			<input
				id="work-sort"
				type="number"
				bind:value={sort}
				inputmode="numeric"
				enterkeyhint="done"
			/>
			<p class="admin-hint">{formLabels.sortHint}</p>
		</div>
	</div>

	{#if errorMsg}
		<p class="admin-error">{errorMsg}</p>
	{/if}

	<div class="admin-form-actions">
		<button
			class="admin-btn admin-btn-accent admin-form-actions-save"
			type="submit"
			disabled={saving || deleting}
		>
			{saving ? actionLabels.saving : actionLabels.save}
		</button>
		{#if saving || deleting}
			<span class="admin-btn admin-form-actions-cancel" aria-disabled="true"
				>{actionLabels.cancel}</span
			>
		{:else}
			<a class="admin-btn admin-form-actions-cancel" href="/admin">{actionLabels.cancel}</a>
		{/if}
		{#if work}
			<button
				class="admin-btn admin-btn-danger admin-form-actions-delete"
				type="button"
				onclick={handleDelete}
				disabled={saving || deleting}
			>
				{actionLabels.delete}
			</button>
		{/if}
	</div>
</form>
