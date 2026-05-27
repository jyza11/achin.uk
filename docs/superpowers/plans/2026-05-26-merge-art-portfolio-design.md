# Art Portfolio Re-skin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the static `art Profolio/` design (paper/ink/oxblood palette, Cormorant Garamond serif, top-header + horizontal nav, asymmetric works grid, lightbox) to the existing `my-skeleton-app` SvelteKit site while preserving its "Achin" identity, Chinese labels, and existing routes.

**Architecture:** Layout-first re-skin. Replace the layout shell with the static design's topbar pattern. Import `styles.css` wholesale (pruned of resets that fight Tailwind base). Rebuild each existing route inline using the design's section patterns. Extract only what repeats: `WorksGrid.svelte` (gallery + sketch + home preview) and `Lightbox.svelte`.

**Tech Stack:** SvelteKit 2, Svelte 4, TypeScript, Tailwind 3, Skeleton UI 2 (kept installed for popups/highlight infrastructure but not used as a styling source), Netlify adapter, Vite 5.

**Source files reference (read-only):** Static design lives at `/Users/jyza11/Documents/Claude/Projects/art Profolio/`. The repo root for this plan is `/Users/jyza11/Documents/official-role-game/Andy/my-skeleton-app/`. All paths in tasks are relative to that root unless absolute.

**Note on verification:** This session's Bash tool is unavailable. The executing engineer (or user) runs `npm run check`, `npm run dev`, and `git commit` commands directly. Each task lists the expected command and what counts as success.

---

## Task 1: Add Google Fonts and clean up app.html

**Files:**
- Modify: `src/app.html`

- [ ] **Step 1: Replace app.html contents**

Open `src/app.html` and replace its full contents with:

```html
<!DOCTYPE html>
<html lang="en" class="bg-white dark:bg-black">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400&display=swap" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

Changes from existing:
- Add three `<link>` tags for Google Fonts
- Add `initial-scale=1, viewport-fit=cover` to viewport meta
- Drop `data-theme="custom-theme"` from `<html>` and `<body>`
- Drop the `h-full overflow-hidden` wrapper class (the design wants natural document flow)

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: no errors. The site won't visually use these fonts yet (portfolio.css is the next task) but the request to Google should succeed.

- [ ] **Step 3: Commit**

```
git add src/app.html
git commit -m "chore(app): add google fonts and simplify shell"
```

---

## Task 2: Create pruned portfolio.css

**Files:**
- Create: `src/lib/styles/portfolio.css`

- [ ] **Step 1: Copy styles.css**

Copy the full contents of `/Users/jyza11/Documents/Claude/Projects/art Profolio/assets/styles.css` to `src/lib/styles/portfolio.css`.

- [ ] **Step 2: Remove three reset rules that conflict with Tailwind base**

In the newly copied `src/lib/styles/portfolio.css`, delete these three rules near the top (lines 16-18 of the original):

```css
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
```

Leave the `body { … }` rule and everything else.

- [ ] **Step 3: Append Chinese-nav modifier at the bottom**

Append to the end of `src/lib/styles/portfolio.css`:

```css
/* ─────────────────────── CHINESE NAV ─────────────────────── */
.nav a.zh {
  letter-spacing: 0.05em;
  font-family: var(--sans);
  font-size: 14px;
}
.wordmark.zh {
  letter-spacing: 0.02em;
}
```

- [ ] **Step 4: Verify**

Read the file's last 10 lines. Confirm the `.nav a.zh` and `.wordmark.zh` rules are present and the file ends cleanly.

- [ ] **Step 5: Commit**

```
git add src/lib/styles/portfolio.css
git commit -m "feat(styles): import portfolio.css from static design"
```

---

## Task 3: Wire portfolio.css into the global stylesheet

**Files:**
- Modify: `src/app.postcss`

- [ ] **Step 1: Read current app.postcss**

Open `src/app.postcss` and note its current contents (typically `@tailwind base; @tailwind components; @tailwind utilities;` plus any Skeleton imports).

- [ ] **Step 2: Append the portfolio.css import**

Append the following line at the very end of `src/app.postcss`:

```postcss
@import '$lib/styles/portfolio.css';
```

Do not remove existing Tailwind directives or Skeleton imports.

- [ ] **Step 3: Verify dev server**

Run: `npm run dev`
Expected: server starts at `http://localhost:5173` with no console errors. Visit the site — you should see the paper-grain SVG noise overlay across the page background and the body should be using `var(--sans)` (Inter Tight). The existing layout will look broken (still has sidebar referencing skeleton tokens). That's expected — fixed in Task 4.

- [ ] **Step 4: Commit**

```
git add src/app.postcss
git commit -m "feat(styles): wire portfolio.css into global stylesheet"
```

---

## Task 4: Replace layout shell with topbar + nav + footer

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Replace the full file**

Open `src/routes/+layout.svelte` and replace its full contents with:

```svelte
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
```

- [ ] **Step 2: Verify svelte-check**

Run: `npm run check`
Expected: no TypeScript or Svelte errors. The `page` store import and `KeyboardEvent` type should resolve.

- [ ] **Step 3: Verify visually**

Run: `npm run dev` (if not already running). Visit `http://localhost:5173/`.

Expected:
- Top header: status dot + "Open today" left, "Achin" wordmark center, "中 · EN" + "Est. MMXXIV" right
- Below header: horizontal nav row with 油畫 / 素描 / 關於 / 合作 / 展覽
- The slot area still shows the broken old home page content — that's fine, fixed in Task 8
- Bottom: dark footer with 4 columns + bottom bar
- Resize to < 760px: hamburger appears, nav collapses

- [ ] **Step 4: Commit**

```
git add src/routes/+layout.svelte
git commit -m "feat(layout): replace sidebar shell with topbar + nav + footer"
```

---

## Task 5: Create the Work type and data module

**Files:**
- Create: `src/lib/data/works.ts`

- [ ] **Step 1: Write works.ts**

Create `src/lib/data/works.ts` with:

```ts
export type Work = {
	src: string;
	alt: string;
	title: string;
	year: string;
	medium: string;
	size: string;
	sold?: boolean;
};

function filenameToTitle(path: string): string {
	const base = path.split('/').pop() ?? '';
	const name = base.replace(/\.[^.]+$/, '');
	return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildWorks(modules: Record<string, string>): Work[] {
	return Object.entries(modules).map(([path, url]) => ({
		src: url,
		alt: filenameToTitle(path),
		title: filenameToTitle(path),
		year: '',
		medium: '',
		size: ''
	}));
}

const galleryModules = import.meta.glob('$lib/assets/gallery/*.{png,jpg,jpeg,gif,webp,svg}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

const sketchModules = import.meta.glob('$lib/assets/sketch/*.{png,jpg,jpeg,gif,webp,svg}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

export const galleryWorks: Work[] = buildWorks(galleryModules);
export const sketchWorks: Work[] = buildWorks(sketchModules);
```

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: no TypeScript errors. (`Work` type, exports, glob types all resolve.)

Note: the older `as: 'url'` form is deprecated in Vite 5; this plan uses the current `query: '?url', import: 'default'` form. If you see a deprecation warning anyway, both work — pick one and stay consistent.

- [ ] **Step 3: Commit**

```
git add src/lib/data/works.ts
git commit -m "feat(data): add Work type and gallery/sketch data modules"
```

---

## Task 6: Create the Lightbox component

**Files:**
- Create: `src/lib/components/Lightbox.svelte`
- Create: `src/lib/stores/lightbox.ts`

- [ ] **Step 1: Create the lightbox store**

Create `src/lib/stores/lightbox.ts`:

```ts
import { writable } from 'svelte/store';
import type { Work } from '$lib/data/works';

type LightboxState = {
	isOpen: boolean;
	works: Work[];
	index: number;
};

const initial: LightboxState = { isOpen: false, works: [], index: 0 };

function createLightboxStore() {
	const { subscribe, set, update } = writable<LightboxState>(initial);

	return {
		subscribe,
		open(works: Work[], index: number) {
			set({ isOpen: true, works, index });
		},
		close() {
			update((s) => ({ ...s, isOpen: false }));
		},
		next() {
			update((s) => ({ ...s, index: (s.index + 1) % s.works.length }));
		},
		prev() {
			update((s) => ({ ...s, index: (s.index - 1 + s.works.length) % s.works.length }));
		}
	};
}

export const lightboxStore = createLightboxStore();
```

- [ ] **Step 2: Create Lightbox.svelte**

Create `src/lib/components/Lightbox.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { lightboxStore } from '$lib/stores/lightbox';
	import type { Work } from '$lib/data/works';

	let state: { isOpen: boolean; works: Work[]; index: number } = { isOpen: false, works: [], index: 0 };

	const unsub = lightboxStore.subscribe((s) => (state = s));

	$: current = state.works[state.index];

	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			if (!state.isOpen) return;
			if (e.key === 'Escape') lightboxStore.close();
			if (e.key === 'ArrowRight') lightboxStore.next();
			if (e.key === 'ArrowLeft') lightboxStore.prev();
		}
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('keydown', handleKey);
			unsub();
		};
	});
</script>

<div
	class="lightbox"
	class:open={state.isOpen}
	on:click|self={() => lightboxStore.close()}
	on:keydown={(e) => e.key === 'Enter' && lightboxStore.close()}
	role="dialog"
	aria-modal="true"
	aria-hidden={!state.isOpen}
	tabindex="-1"
>
	{#if current}
		<div class="lb-inner">
			<div class="lb-art">
				<div class="canvas-holder">
					<img src={current.src} alt={current.alt} />
				</div>
			</div>
			<div class="lb-meta">
				<div class="lb-counter">{state.index + 1} / {state.works.length}</div>
				<div class="kk">Selected Work</div>
				<h3>{current.title}</h3>
				{#if current.medium || current.size}
					<dl class="lb-spec">
						{#if current.medium}
							<div><dt>Medium</dt><dd>{current.medium}</dd></div>
						{/if}
						{#if current.size}
							<div><dt>Size</dt><dd>{current.size}</dd></div>
						{/if}
						{#if current.year}
							<div><dt>Year</dt><dd>{current.year}</dd></div>
						{/if}
						{#if current.sold}
							<div><dt>Status</dt><dd>Sold</dd></div>
						{/if}
					</dl>
				{/if}
				<div class="lb-nav">
					<button type="button" on:click={() => lightboxStore.prev()}>← Prev</button>
					<button type="button" on:click={() => lightboxStore.next()}>Next →</button>
				</div>
			</div>
			<button
				class="lb-close"
				type="button"
				on:click={() => lightboxStore.close()}
				aria-label="Close"
			>
				✕
			</button>
		</div>
	{/if}
</div>

<style>
	.lb-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.lb-inner {
		position: relative;
	}
</style>
```

Note: the `<style>` block adds only what `portfolio.css` doesn't already cover. The `.lightbox`, `.lb-inner`, `.lb-art`, `.lb-meta`, `.lb-close`, `.lb-spec`, `.lb-nav`, `.lb-counter`, `.kk`, `.canvas-holder` classes are all styled by `portfolio.css`.

- [ ] **Step 3: Verify**

Run: `npm run check`
Expected: no errors. The Lightbox isn't mounted anywhere yet — that happens in gallery/sketch pages.

- [ ] **Step 4: Commit**

```
git add src/lib/stores/lightbox.ts src/lib/components/Lightbox.svelte
git commit -m "feat(components): add Lightbox component with store"
```

---

## Task 7: Create the WorksGrid component

**Files:**
- Create: `src/lib/components/WorksGrid.svelte`

- [ ] **Step 1: Write WorksGrid.svelte**

Create `src/lib/components/WorksGrid.svelte`:

```svelte
<script lang="ts">
	import type { Work } from '$lib/data/works';
	import { lightboxStore } from '$lib/stores/lightbox';

	export let works: Work[] = [];
	export let limit: number | null = null;

	// Cycle through w-1..w-7 span classes for visual rhythm
	const spanPattern = ['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-7'];

	$: visible = limit ? works.slice(0, limit) : works;

	function openLightbox(index: number) {
		lightboxStore.open(visible, index);
	}
</script>

<div class="works">
	{#each visible as work, i}
		<button
			type="button"
			class="work {spanPattern[i % spanPattern.length]}"
			on:click={() => openLightbox(i)}
			aria-label="View {work.title}"
		>
			<div class="frame">
				<img src={work.src} alt={work.alt} />
			</div>
			<div class="label">
				<span class="t">{work.title}</span>
				{#if work.year}
					<span class="y">{work.year}</span>
				{/if}
			</div>
			{#if work.medium || work.sold}
				<div class="meta">
					{work.medium}
					{#if work.sold}<span class="sold">Sold</span>{/if}
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.work {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
	}
	.frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
```

The `.works`, `.work`, `.frame`, `.label`, `.meta`, `.sold`, `.w-1..w-7` classes are all styled by `portfolio.css`. The `<style>` block here only resets button defaults and forces `<img>` to fill the frame.

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```
git add src/lib/components/WorksGrid.svelte
git commit -m "feat(components): add WorksGrid component"
```

---

## Task 8: Rebuild the home page

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Replace the home page**

Replace `src/routes/+page.svelte` full contents with:

```svelte
<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { galleryWorks } from '$lib/data/works';
	import profilePic from '$lib/assets/pro.jpg';

	const tickerPhrases = ['油畫 · Paintings', '素描 · Sketches', '展覽 · Exhibitions', '工作室 · Studio'];
</script>

<section class="hero">
	<div class="hero-text reveal">
		<div class="hero-eyebrow">Painter · Taipei</div>
		<h1>The hour <em>before</em> the light forgets the room.</h1>
		<p class="hero-deck">
			Oil on linen — slow, considered surfaces of weather, water, and interior thresholds. Painted from life, then revisited from memory.
		</p>
		<div class="hero-actions">
			<a class="btn primary" href="/gallery">View Selected Works <span class="arrow"></span></a>
			<a class="btn" href="/about">關於 · About</a>
		</div>
	</div>
	<div class="hero-canvas">
		<div class="slot">
			<img src={profilePic} alt="Featured painting" style="width:100%;height:100%;object-fit:cover;" />
		</div>
		<div class="hero-caption">
			<span>Featured</span>
			<span class="title">Recent work · Studio</span>
			<span>2026</span>
		</div>
		<span class="signature">Achin</span>
	</div>
</section>

<div class="ticker">
	<div class="ticker-track">
		{#each [...tickerPhrases, ...tickerPhrases, ...tickerPhrases] as phrase}
			<span>{phrase}</span>
		{/each}
	</div>
</div>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">01 · Selected</span>
			<h2 class="section-title">Recent <em>works</em></h2>
		</div>
		<div class="section-aside">A small preview · See all on /gallery</div>
	</header>
	<WorksGrid works={galleryWorks} limit={4} />
</section>

<section class="band statement-band">
	<header class="section-head">
		<div>
			<span class="section-num">02 · Notes</span>
			<h2 class="section-title">From the <em>studio</em></h2>
		</div>
		<div class="section-aside">Continued on /about</div>
	</header>
	<div class="statement">
		<div class="statement-portrait">
			<img src={profilePic} alt="The artist at work" style="width:100%;height:100%;object-fit:cover;" />
		</div>
		<div>
			<p class="pq">
				我不在家就在去咖啡館的路上 — 雙叟 · 左岸 · 巴黎 · 花街 — 黃金海岸的比基尼 — 可憐我一雙 Ferragamo 的高跟鞋。
			</p>
			<p>A practice built on slow looking — light, weather, and the corners of rooms held still long enough to draw out the hour.</p>
			<div class="statement-meta">
				<div><span class="k">Born</span><span class="v">Taipei</span></div>
				<div><span class="k">Based</span><span class="v">Studio · Taipei</span></div>
				<div><span class="k">Medium</span><span class="v">Oil · Graphite</span></div>
			</div>
		</div>
	</div>
</section>

<Lightbox />
```

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: no errors. (Note: if `import profilePic from '$lib/assets/pro.jpg';` shows a TS error about untyped image imports, add to `src/app.d.ts` inside the existing declaration block — but typically SvelteKit's default config handles this. Verify by running the next step first.)

Run: `npm run dev` and visit `/`.

Expected:
- Hero band at top: eyebrow tag, large serif h1 with italic accent, deck paragraph, two buttons (one filled dark, one outlined), profile pic in mat-framed canvas right side with "Achin" signature scrawl bottom-left
- Ticker band scrolling left
- Section 01: "Recent works" — small grid of 4 paintings from gallery folder
- Section 02 (dark): "From the studio" — portrait left, blockquote + meta right
- Click any work → lightbox opens with image, title, prev/next buttons; ESC closes; arrow keys navigate

- [ ] **Step 3: Commit**

```
git add src/routes/+page.svelte
git commit -m "feat(home): rebuild home page with hero, ticker, preview grid, statement"
```

---

## Task 9: Rebuild the gallery page

**Files:**
- Modify: `src/routes/gallery/+page.svelte`

- [ ] **Step 1: Replace the gallery page**

Replace `src/routes/gallery/+page.svelte` full contents with:

```svelte
<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { galleryWorks } from '$lib/data/works';
</script>

<svelte:head>
	<title>油畫 · Paintings — Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">油畫 · Paintings</span>
			<h1 class="section-title">Selected <em>works</em></h1>
		</div>
		<div class="section-aside">
			{galleryWorks.length} {galleryWorks.length === 1 ? 'work' : 'works'} · Oil on linen
		</div>
	</header>

	{#if galleryWorks.length === 0}
		<p style="font-family: var(--serif); font-style: italic; color: var(--ink-3); text-align: center; padding: 80px 0;">
			No works to show yet. Add images to <code>src/lib/assets/gallery/</code> to populate this page.
		</p>
	{:else}
		<WorksGrid works={galleryWorks} />
	{/if}
</section>

<Lightbox />
```

- [ ] **Step 2: Verify**

Run: `npm run dev` and visit `/gallery`.

Expected:
- Page title in tab: "油畫 · Paintings — Achin"
- Section head with "油畫 · Paintings" eyebrow, "Selected works" title, count on right
- Asymmetric grid of all images in `$lib/assets/gallery/`
- Click any tile → lightbox opens
- If gallery folder is empty: italic "No works to show yet" message instead

- [ ] **Step 3: Commit**

```
git add src/routes/gallery/+page.svelte
git commit -m "feat(gallery): rebuild as works grid with lightbox"
```

---

## Task 10: Rebuild the sketch page

**Files:**
- Modify: `src/routes/sketch/+page.svelte`

- [ ] **Step 1: Replace the sketch page**

Replace `src/routes/sketch/+page.svelte` full contents with:

```svelte
<script lang="ts">
	import WorksGrid from '$lib/components/WorksGrid.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { sketchWorks } from '$lib/data/works';
</script>

<svelte:head>
	<title>素描 · Sketches — Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">素描 · Sketches</span>
			<h1 class="section-title">Drawings <em>and studies</em></h1>
		</div>
		<div class="section-aside">
			{sketchWorks.length} {sketchWorks.length === 1 ? 'sketch' : 'sketches'} · Graphite on paper
		</div>
	</header>

	{#if sketchWorks.length === 0}
		<p style="font-family: var(--serif); font-style: italic; color: var(--ink-3); text-align: center; padding: 80px 0;">
			No sketches to show yet. Add images to <code>src/lib/assets/sketch/</code> to populate this page.
		</p>
	{:else}
		<WorksGrid works={sketchWorks} />
	{/if}
</section>

<Lightbox />
```

- [ ] **Step 2: Verify**

Run: `npm run dev` and visit `/sketch`.

Expected: same shape as `/gallery` but pulls from `$lib/assets/sketch/`. Click → lightbox works.

- [ ] **Step 3: Commit**

```
git add src/routes/sketch/+page.svelte
git commit -m "feat(sketch): rebuild as sketch grid with lightbox"
```

---

## Task 11: Rebuild the about page

**Files:**
- Modify: `src/routes/about/+page.svelte`

- [ ] **Step 1: Replace the about page**

Replace `src/routes/about/+page.svelte` full contents with:

```svelte
<script lang="ts">
	import profilePic from '$lib/assets/pro.jpg';
</script>

<svelte:head>
	<title>關於 · About — Achin</title>
</svelte:head>

<section class="band statement-band">
	<header class="section-head">
		<div>
			<span class="section-num">關於 · About</span>
			<h1 class="section-title">Notes on a <em>practice</em></h1>
		</div>
		<div class="section-aside">Studio · Taipei</div>
	</header>

	<div class="statement">
		<div class="statement-portrait">
			<img src={profilePic} alt="The artist" style="width:100%;height:100%;object-fit:cover;" />
		</div>
		<div>
			<p class="pq">
				我不在家就在去咖啡館的路上 — 雙叟 · 左岸 · 巴黎 · 花街 — 黃金海岸的比基尼 — 可憐我一雙 Ferragamo 的高跟鞋。
			</p>
			<p>
				A practice built on slow looking. Oil on linen, graphite on paper, and the long hours between. Light, weather, and the corners of rooms held still long enough to draw out the hour before the room forgets itself.
			</p>
			<p>
				Working from life and from memory. Sittings at the café, drawings in the morning, paintings revisited in the studio after the day has cooled. Solo and collaborative shows in Taipei and abroad — see <a href="/events" style="color: oklch(0.85 0.10 35); border-bottom: 1px solid currentColor;">展覽</a> for current and forthcoming.
			</p>
			<div class="statement-meta">
				<div><span class="k">Born</span><span class="v">Taipei</span></div>
				<div><span class="k">Based</span><span class="v">Studio · Taipei</span></div>
				<div><span class="k">Medium</span><span class="v">Oil · Graphite</span></div>
			</div>
		</div>
	</div>

	<div class="page-cta">
		<p>Studio visits and acquisitions by appointment.</p>
		<a href="/contact">合作 · Get in touch →</a>
	</div>
</section>
```

- [ ] **Step 2: Verify**

Run: `npm run dev` and visit `/about`.

Expected:
- Dark statement band fills the page
- Section head with "關於 · About" eyebrow, "Notes on a practice" h1, "Studio · Taipei" right-aligned
- Two-column body: portrait left in mat frame, blockquote + paragraphs + 3-col meta right
- Footer CTA section at bottom with link to /contact

- [ ] **Step 3: Commit**

```
git add src/routes/about/+page.svelte
git commit -m "feat(about): rebuild as statement band"
```

---

## Task 12: Rebuild the contact page

**Files:**
- Modify: `src/routes/contact/+page.svelte`
- Delete (if exists): `src/routes/contact/article.js`

- [ ] **Step 1: Replace the contact page**

Replace `src/routes/contact/+page.svelte` full contents with:

```svelte
<script lang="ts">
	let name = '';
	let email = '';
	let message = '';
	let submitted = false;

	function handleSubmit() {
		// Wire this up to your form backend (Netlify Forms, Formspree, etc.)
		// For now, just acknowledge in-page.
		submitted = true;
	}
</script>

<svelte:head>
	<title>合作 · Contact — Achin</title>
</svelte:head>

<section class="band visit-band">
	<header class="section-head">
		<div>
			<span class="section-num">合作 · Contact</span>
			<h1 class="section-title">Studio <em>visits</em></h1>
		</div>
		<div class="section-aside">By appointment</div>
	</header>

	<div class="visit">
		<div class="visit-text">
			<h2>Quiet hours, <em>open door</em>.</h2>
			<p>
				The studio is open by appointment for visitors, collectors, and curators. Acquisitions, commissions, and press inquiries — please write directly.
			</p>
			<div class="hours">
				<div class="hours-row"><span>Mon · Tue</span><span>10—18h</span></div>
				<div class="hours-row"><span>Wed · Thu</span><span>10—18h</span></div>
				<div class="hours-row"><span>Fri</span><span>12—19h</span></div>
				<div class="hours-row closed"><span>Sat · Sun</span><span>By request</span></div>
			</div>
		</div>

		<div class="visit-card">
			<h3>Studio Achin</h3>
			<div class="addr">
				Taipei · Studio<br />
				By appointment
			</div>
			<div class="row"><span class="k">Email</span><span class="v">studio@achin.example</span></div>
			<div class="row"><span class="k">Press</span><span class="v">press@achin.example</span></div>
			<div class="row"><span class="k">Instagram</span><span class="v">@achin.studio</span></div>

			{#if !submitted}
				<form on:submit|preventDefault={handleSubmit} style="margin-top: 24px; display: flex; flex-direction: column; gap: 14px;">
					<input
						type="text"
						bind:value={name}
						placeholder="Your name"
						required
						style="background: transparent; border: 0; border-bottom: 1px solid var(--rule); padding: 8px 0; font-family: var(--serif); font-size: 16px; color: var(--ink); outline: none;"
					/>
					<input
						type="email"
						bind:value={email}
						placeholder="Your email"
						required
						style="background: transparent; border: 0; border-bottom: 1px solid var(--rule); padding: 8px 0; font-family: var(--serif); font-size: 16px; color: var(--ink); outline: none;"
					/>
					<textarea
						bind:value={message}
						placeholder="Message"
						required
						rows="4"
						style="background: transparent; border: 0; border-bottom: 1px solid var(--rule); padding: 8px 0; font-family: var(--serif); font-size: 16px; color: var(--ink); outline: none; resize: vertical;"
					></textarea>
					<button type="submit" class="btn primary" style="align-self: flex-start;">
						Send <span class="arrow"></span>
					</button>
				</form>
			{:else}
				<p style="margin-top: 24px; font-family: var(--serif); font-style: italic; color: var(--oxblood-ink);">
					Thank you — your message has been noted. A reply will follow within a few days.
				</p>
			{/if}
		</div>
	</div>
</section>
```

- [ ] **Step 2: Delete the article.js helper if present**

If `src/routes/contact/article.js` exists (left over from the old debug code), delete it. The Read tool can't list — try opening it; if not present, skip this step.

- [ ] **Step 3: Verify**

Run: `npm run dev` and visit `/contact`.

Expected:
- Light visit-band background
- Section head with "合作 · Contact"
- Two-column body: left has h2 + paragraph + hours table; right has visit-card with address, email rows, contact form
- Submitting the form shows the thank-you message (no actual send yet)

- [ ] **Step 4: Commit**

```
git add src/routes/contact/+page.svelte
# also stage the article.js deletion if applicable: git rm src/routes/contact/article.js
git commit -m "feat(contact): rebuild as visit card + form"
```

---

## Task 13: Rebuild the events page

**Files:**
- Modify: `src/routes/events/+page.svelte`

- [ ] **Step 1: Replace the events page**

Replace `src/routes/events/+page.svelte` full contents with:

```svelte
<svelte:head>
	<title>展覽 · Exhibitions — Achin</title>
</svelte:head>

<section class="band">
	<header class="section-head">
		<div>
			<span class="section-num">展覽 · Exhibitions</span>
			<h1 class="section-title">Current and <em>forthcoming</em></h1>
		</div>
		<div class="section-aside">Solo · Group · Studio openings</div>
	</header>

	<div style="text-align: center; padding: 80px 0;">
		<p style="font-family: var(--serif); font-style: italic; font-size: 24px; color: var(--ink-2); margin: 0 0 16px; text-wrap: balance;">
			展覽 · Coming soon
		</p>
		<p style="font-family: var(--serif); font-size: 17px; color: var(--ink-3); max-width: 42ch; margin: 0 auto;">
			Exhibition listings will appear here. For studio visits and press inquiries in the meantime, see <a href="/contact" style="color: var(--oxblood); border-bottom: 1px solid currentColor;">合作</a>.
		</p>
	</div>
</section>
```

- [ ] **Step 2: Verify**

Run: `npm run dev` and visit `/events`.

Expected:
- Section head chrome with "展覽 · Exhibitions" eyebrow, "Current and forthcoming" h1
- Centered "展覽 · Coming soon" italic + small paragraph linking to /contact

- [ ] **Step 3: Commit**

```
git add src/routes/events/+page.svelte
git commit -m "feat(events): styled coming-soon placeholder"
```

---

## Task 14: Final type-check, build, and visual sweep

**Files:**
- None (verification only)

- [ ] **Step 1: Run svelte-check**

Run: `npm run check`
Expected: no TypeScript or Svelte errors across the project.

If errors appear about `$lib/assets/pro.jpg` or `$lib/assets/IMG_3811.jpeg` not having type declarations, add this to `src/app.d.ts` (inside the existing global declaration):

```ts
declare module '*.jpg' {
	const src: string;
	export default src;
}
declare module '*.jpeg' {
	const src: string;
	export default src;
}
```

If you have to add this, commit it: `git commit -m "chore(types): declare image module types"`.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: build completes without errors. Output appears in `.svelte-kit/output/`.

- [ ] **Step 3: Visual sweep — desktop**

With `npm run dev` running, walk through each route in the browser at desktop width (≥ 1200px):

- `/` — hero with two columns, ticker scrolling, 4-up preview grid, dark statement band
- `/gallery` — full asymmetric grid; click → lightbox opens; arrow keys navigate; ESC closes
- `/sketch` — same shape, sketch assets
- `/about` — dark statement band with portrait + quote + 3-col meta + CTA
- `/contact` — visit-band with hours table left, visit-card + form right
- `/events` — section head + centered coming-soon placeholder

For each: footer renders dark with 4 columns and bottom-bar.

- [ ] **Step 4: Visual sweep — mobile**

Resize the browser to ≤ 760px (or use devtools mobile view):

- Topbar: meta-left and meta-right hide, wordmark left-aligned, hamburger menu button right
- Click hamburger → nav drops down vertically
- Click a nav item → menu closes (because we wired `closeMenu` to nav clicks)
- All grids collapse to single column
- Lightbox stacks image above meta

- [ ] **Step 5: Commit anything from Step 1 fix-up**

If Step 1 required the `app.d.ts` change, commit it now. Otherwise skip.

- [ ] **Step 6: Final cleanup commit (optional)**

If you spot any residual Skeleton UI `bg-surface-*-token` or `variant-filled` classes in the visited routes, remove them and commit:

```
git commit -m "chore(cleanup): drop residual skeleton ui token references"
```

---

## After all tasks

The site now wears the static design while keeping the Achin identity, Chinese routes, and existing assets. The four open items from the spec remain for the user to decide as content rather than code:

1. Works metadata: filename-as-title is the current fallback. To enrich, add a `src/lib/data/works-meta.json` sidecar keyed by filename and merge it inside `buildWorks()` in `src/lib/data/works.ts`.
2. Donation flow: `DonationCard.svelte` is still in `$lib/components/` but unused. Decide a home for it (new `/support` route? footer section?) or delete.
3. Chrome copy: `meta-left` / `meta-right` / ticker / footer strings in `+layout.svelte` and `+page.svelte` are reasonable defaults — adjust as desired.
4. Wordmark: "Achin" in the topbar and footer-mark. Replace with longer/multilingual form by editing two strings in `+layout.svelte`.
