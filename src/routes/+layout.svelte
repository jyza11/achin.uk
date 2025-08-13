<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	let isMobileMenuOpen = false;
	
	// Navigation items configuration
	const navItems = [
		{ href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/gallery', label: '油畫', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href:	'/sketch', label: '素描', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href: '/about', label: '關於', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ href: '/about', label: '展覽', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
	];
	
	// Shared navigation link styles - FIXED FOR BETTER CONTRAST
	const navLinkClass = "block px-4 py-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors";
	const activeNavLinkClass = "block px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium transition-colors";
	
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
	
	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}
	
	function getNavLinkClass(href) {
		return $page.url.pathname === href ? activeNavLinkClass : navLinkClass;
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
	<header class="bg-surface-100-800-token border-b border-surface-300-600-token md:col-span-2">
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
				
				<strong class="text-xl font-bold">Your App</strong>
			</div>
			<nav class="hidden md:flex space-x-4">
				<!-- Header navigation items -->
			</nav>
		</div>
	</header>

	<!-- Desktop Sidebar -->
	<aside class="bg-surface-50-900-token border-r border-surface-300-600-token w-56 p-4 hidden md:block">
		<nav class="space-y-2">
			{#each navItems as item}
				<a 
					href={item.href} 
					class={getNavLinkClass(item.href)}
					aria-current={$page.url.pathname === item.href ? 'page' : undefined}
				>
					<div class="flex items-center space-x-3">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
						</svg>
						<span>{item.label}</span>
					</div>
				</a>
			{/each}
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
		<aside class="fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-xl">
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<strong class="text-xl font-bold text-gray-900 dark:text-white">Menu</strong>
				<button 
					class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					on:click={closeMobileMenu}
					aria-label="Close mobile menu"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<nav class="p-4 space-y-2">
				{#each navItems as item}
					<a 
						href={item.href} 
						class={getNavLinkClass(item.href)}
						on:click={closeMobileMenu}
						aria-current={$page.url.pathname === item.href ? 'page' : undefined}
					>
						<div class="flex items-center space-x-3">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
							</svg>
							<span>{item.label}</span>
						</div>
					</a>
				{/each}
			</nav>
		</aside>
	{/if}

	<!-- Main Content -->
	<main class="overflow-auto p-4">
		<slot />
	</main>
</div>