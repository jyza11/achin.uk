<script lang="ts">
	import '../app.postcss';
	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import logo from '$lib/assets/IMG_3811.jpeg';

	import { onMount } from 'svelte';
	
	let isMobileMenuOpen = false;
	
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
	
	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}
	
	// Close menu when clicking outside or pressing escape
	onMount(() => {
		function handleKeydown(event) {
			if (event.key === 'Escape') {
				closeMobileMenu();
			}
		}
		
		document.addEventListener('keydown', handleKeydown);
		
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- This is the proper Skeleton v3 layout approach using semantic HTML -->
<div class="h-full grid grid-rows-[auto_1fr_auto] md:grid-cols-[auto_1fr]">
	<!-- Header -->
	<header class="bg-surface-100-800-token border-surface-300-600-token md:col-span-2">
		<div class="flex items-center justify-between p-4">
			<div class="flex items-center space-x-4">
				<!-- Mobile menu button -->
				<button 
					class="md:hidden p-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
					on:click={toggleMobileMenu}
					aria-label="Toggle mobile menu"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
				
			</div>
			<nav class="hidden md:flex space-x-4">
				<!-- Header navigation items -->
			</nav>
		</div>
	</header>

	<!-- Desktop Sidebar -->
	<aside class="bg-surface-50-900-token  border-surface-300-600-token w-56 p-4 hidden md:block">
		<nav class="space-y-2">
			<a href="/" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				
					<div class="logo-section">
						<img 
							src={logo} 
							alt="Site Logo" 
							class="logo-image"
						/>
					</div>
			</a>
			<a href="/gallery" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				油畫
			</a>
			<a href="/sketch" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				鉛筆
			</a>
			<a href="/about" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				關於
			</a>
			<a href="/contact" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				 合作
			</a>
			<a href="/events" class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
				展覽
			</a>
		</nav>
	</aside>

	<!-- Mobile Sidebar Overlay -->
	{#if isMobileMenuOpen}
		<!-- Backdrop -->
		<div 
			class="fixed inset-0 bg-black/50 z-40 md:hidden"
			on:click={closeMobileMenu}
			on:keydown={(e) => e.key === 'Enter' && closeMobileMenu()}
			role="button"
			tabindex="0"
			aria-label="Close mobile menu"
		></div>
		
		<!-- Mobile Sidebar -->
		<aside class="fixed top-0 left-0 w-64 h-full bg-surface-50-900-token border-r border-surface-300-600-token z-50 md:hidden transform transition-transform duration-300 ease-in-out">
			<div class="flex items-center justify-between p-4 border-b border-surface-300-600-token">
				<strong class="text-xl font-bold">Menu</strong>
				<button 
					class="p-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
					on:click={closeMobileMenu}
					aria-label="Close mobile menu"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<nav class="p-4 space-y-2">
				<a 
					href="/" 
					class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
					on:click={closeMobileMenu}
				>
					Home
				</a>
				<a 
					href="/gallery" 
					class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
					on:click={closeMobileMenu}
				>
					藝術品
				</a>
				<a 
					href="/about" 
					class="block px-4 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
					on:click={closeMobileMenu}
				>
					關於
				</a>
			</nav>
		</aside>
	{/if}

	<!-- Main Content -->
	<main class="overflow-auto p-4">
		<slot />
	</main>
</div>