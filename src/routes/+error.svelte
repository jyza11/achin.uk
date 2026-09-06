<script lang="ts">
	import { page } from '$app/stores';

	let status = $derived($page.status);
	let message = $derived($page.error?.message ?? '');

	// Friendly labels per status — fall through to the raw message otherwise
	let label = $derived(
		(() => {
			if (status === 404) return 'Page not found';
			if (status === 403) return 'Forbidden';
			if (status === 410) return 'Gone';
			if (status >= 500) return 'Something went wrong';
			return message || 'Error';
		})()
	);
</script>

<svelte:head>
	<title>{status} · Achin</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error-page" aria-labelledby="error-title">
	<div class="error-inner">
		<p class="error-status" aria-hidden="true">{status}</p>
		<h1 id="error-title" class="error-label">{label}</h1>

		{#if message && status !== 404}
			<p class="error-detail">{message}</p>
		{/if}

		<nav class="error-links" aria-label="Where to go next">
			<a href="/" class="error-link">Home</a>
			<span class="error-sep" aria-hidden="true">·</span>
			<a href="/sketch" class="error-link">Sketches</a>
			<span class="error-sep" aria-hidden="true">·</span>
			<a href="/art" class="error-link">Paintings</a>
		</nav>
	</div>
</main>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem 1.5rem;
		background: var(--color-surface-50, #ffffff);
	}

	.error-inner {
		max-width: 32rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.error-status {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: clamp(4rem, 12vw, 7rem);
		font-weight: 200;
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--color-surface-400, #9aa0a6);
		margin: 0 0 0.5rem;
	}

	.error-label {
		font-size: clamp(1.125rem, 2.5vw, 1.5rem);
		font-weight: 400;
		color: var(--color-surface-900, #1a1a1a);
		margin: 0;
		letter-spacing: 0.01em;
	}

	.error-detail {
		font-size: 0.9rem;
		color: var(--color-surface-600, #5f6368);
		margin: 0.25rem 0 0;
		max-width: 28rem;
	}

	.error-links {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.error-link {
		color: var(--color-surface-700, #3c4043);
		text-decoration: none;
		padding: 0.25rem 0;
		border-bottom: 1px solid transparent;
		transition:
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.error-link:hover,
	.error-link:focus-visible {
		color: var(--color-surface-900, #1a1a1a);
		border-bottom-color: var(--color-surface-900, #1a1a1a);
		outline: none;
	}

	.error-sep {
		color: var(--color-surface-400, #9aa0a6);
		user-select: none;
	}

	/* Dark mode — Skeleton sets this via [data-theme] */
	:global([data-theme='custom-theme']) .error-page {
		background: var(--color-surface-50);
	}
</style>
