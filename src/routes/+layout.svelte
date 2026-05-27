<script lang="ts">
	import '../app.postcss';

	// Highlight JS (kept as infrastructure from Skeleton UI)
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml';
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for popups (kept as infrastructure)
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/gallery', label: '油畫' },
		{ href: '/sketch', label: '素描' },
		{ href: '/about', label: '關於' },
		{ href: '/contact', label: '合作' },
		{ href: '/events', label: '展覽' }
	];

	let menuOpen = false;

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

	$: currentPath = $page.url.pathname;
</script>

<header class="topbar">
	<div class="topbar-inner">
		<div class="meta-left">
			<span><span class="dot"></span>&nbsp;Open today · 10—18h</span>
			<span class="sep" style="opacity:.5">·</span>
			<span>Taipei · Studio</span>
		</div>
		<a class="wordmark zh" href="/">Achin</a>
		<div class="meta-right">
			<span>中 · EN</span>
			<span style="opacity:.5">·</span>
			<span>Est. MMXXIV</span>
		</div>
		<button class="menu-btn" on:click={toggleMenu} aria-label="Menu">
			<span></span>
		</button>
	</div>
	<nav class="nav" class:open={menuOpen}>
		<div class="nav-inner">
			{#each navItems as item}
				<a
					href={item.href}
					class="zh"
					class:active={currentPath === item.href}
					on:click={closeMenu}
				>
					{item.label}
				</a>
			{/each}
		</div>
	</nav>
</header>

<main>
	<slot />
</main>

<footer>
	<div class="foot-inner">
		<div class="foot-top">
			<div class="foot-mark">
				Achin
				<p>Painter of quiet hours and stolen afternoons.</p>
			</div>
			<div>
				<h4>Explore</h4>
				<ul>
					{#each navItems as item}
						<li><a href={item.href}>{item.label}</a></li>
					{/each}
				</ul>
			</div>
			<div>
				<h4>Studio</h4>
				<ul>
					<li>Taipei</li>
					<li>By appointment</li>
					<li><a href="/contact">合作 · Contact</a></li>
				</ul>
			</div>
			<div class="news">
				<h4>Newsletter</h4>
				<p>Occasional notes — new work, openings, slow letters.</p>
				<form class="news-form" on:submit|preventDefault>
					<input type="email" placeholder="your email" aria-label="Email" />
					<button type="submit">Subscribe</button>
				</form>
			</div>
		</div>
		<div class="foot-bottom">
			<div>© Achin {new Date().getFullYear()} · All works copyright the artist</div>
			<div class="right">Site by hand · No tracking</div>
		</div>
	</div>
</footer>
