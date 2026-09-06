<script lang="ts">
	import '../app.postcss';

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Lightbox from '$lib/components/Lightbox.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const navItems = [
		{ href: '/gallery', label: '油畫', romaji: 'Paintings' },
		{ href: '/sketch', label: '素描', romaji: 'Sketches' },
		{ href: '/about', label: '關於', romaji: 'About' },
		{ href: '/contact', label: '合作', romaji: 'Contact' },
		{ href: '/events', label: '展覽', romaji: 'Exhibitions' }
	];

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
	function closeMenu() {
		menuOpen = false;
	}

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') closeMenu();
		}
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	let currentPath = $derived($page.url.pathname);
</script>

<!-- Mobile topbar — only renders on mobile (CSS controls display) -->
<header class="pf-topbar-mobile">
	<a href="/" class="pf-wordmark-small" onclick={closeMenu}>Achin</a>
	<button
		class="pf-menu-btn"
		class:open={menuOpen}
		onclick={toggleMenu}
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={menuOpen}
		aria-controls="primary-nav"
	>
		<span></span>
	</button>
</header>

<!-- Mobile backdrop (visible only when drawer is open on mobile) -->
<button
	class="pf-sidebar-backdrop"
	class:open={menuOpen}
	onclick={closeMenu}
	aria-label="Close menu"
	tabindex={menuOpen ? 0 : -1}
></button>

<!-- Sidebar — fixed on desktop, slides in on mobile -->
<aside class="pf-sidebar" class:open={menuOpen}>
	<a href="/" class="pf-sidebar-wordmark" onclick={closeMenu}>Achin</a>
	<span class="pf-sidebar-tag">Painter · Studio</span>

	<nav class="pf-sidebar-nav" id="primary-nav" aria-label="Primary">
		<div class="pf-sidebar-section">Index</div>
		{#each navItems as item}
			<a
				href={item.href}
				class:active={currentPath === item.href || currentPath.startsWith(item.href + '/')}
				onclick={closeMenu}
			>
				<span>{item.label}</span>
				<span class="romaji">{item.romaji}</span>
			</a>
		{/each}
	</nav>

	<div class="pf-sidebar-foot">
		© Achin {new Date().getFullYear()}<br />
		Studio · Taipei
	</div>
</aside>

<!-- Main content — offset to make room for the fixed sidebar -->
<div class="pf-content">
	<main class="pf-main">
		{@render children?.()}
	</main>

	<footer class="pf-footer">
		<div>© Achin {new Date().getFullYear()} · All works copyright the artist</div>
		<div class="right">By appointment · Taipei</div>
	</footer>
</div>

<!-- Lightbox mounted once globally; renders nothing while closed -->
<Lightbox />

<style>
	.pf-content {
		margin-left: 220px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.pf-main {
		flex: 1;
		padding: 24px;
		min-width: 0;
	}
	@media (max-width: 768px) {
		.pf-content {
			margin-left: 0;
		}
		.pf-main {
			padding: 16px;
		}
	}
</style>
