<script lang="ts">
	import '$lib/styles/admin.css';
	import { pb } from '$lib/pb-browser';
	import { pbErrorToZh } from '$lib/admin/labels';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// Re-run when the auth store changes (login/logout) so the layout re-renders.
	let isValid = $state(pb.authStore.isValid);
	let userEmail = $state(pb.authStore.record?.email ?? '');

	// onChange returns an unsubscribe fn — call it on destroy so listeners don't pile up when
	// the user leaves /admin for the public site and comes back.
	$effect(() =>
		pb.authStore.onChange(() => {
			isValid = pb.authStore.isValid;
			userEmail = pb.authStore.record?.email ?? '';
		})
	);

	let email = $state('');
	let password = $state('');
	let loggingIn = $state(false);
	let loginError = $state('');

	async function login(event: SubmitEvent) {
		event.preventDefault();
		loggingIn = true;
		loginError = '';
		try {
			await pb.collection('users').authWithPassword(email, password);
			password = '';
		} catch (err) {
			loginError = '登入失敗，請檢查電子郵件與密碼。';
			console.error(pbErrorToZh(err));
		} finally {
			loggingIn = false;
		}
	}

	function logout() {
		pb.authStore.clear();
	}
</script>

<svelte:head>
	<title>後台 — Achin</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="admin">
	{#if !isValid}
		<div class="admin-shell">
			<form class="admin-login" onsubmit={login}>
				<h1>Achin 後台</h1>
				<label for="admin-email">電子郵件</label>
				<input id="admin-email" type="email" bind:value={email} required autocomplete="username" />
				<label for="admin-password">密碼</label>
				<input
					id="admin-password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
				/>
				{#if loginError}
					<p class="admin-error">{loginError}</p>
				{/if}
				<button class="admin-btn" type="submit" disabled={loggingIn}>登入</button>
			</form>
		</div>
	{:else}
		<div class="admin-shell">
			<header class="admin-header">
				<span class="admin-title">Achin 後台</span>
				<nav class="admin-nav">
					<a href="/admin">作品</a>
					<a href="/admin/text">頁面文字</a>
				</nav>
				<span class="admin-user">{userEmail}</span>
				<button class="admin-btn" onclick={logout}>登出</button>
			</header>
			{@render children?.()}
		</div>
	{/if}
</div>
