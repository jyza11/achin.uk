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

	<div class="events-empty">
		<p class="events-empty-line">展覽 · Coming soon</p>
		<p class="events-empty-deck">
			Exhibition listings will appear here as they're scheduled. For studio visits and press
			inquiries in the meantime, see
			<a href="/contact">合作</a>.
		</p>
	</div>
</section>

<style>
	.events-empty {
		text-align: center;
		padding: 80px 0;
	}
	.events-empty-line {
		font-family: var(--serif);
		font-style: italic;
		font-size: 28px;
		color: var(--ink-2);
		margin: 0 0 16px;
		text-wrap: balance;
	}
	.events-empty-deck {
		font-family: var(--serif);
		font-size: 17px;
		color: var(--ink-3);
		max-width: 42ch;
		margin: 0 auto;
	}
	.events-empty-deck a {
		color: var(--oxblood);
		border-bottom: 1px solid currentColor;
	}
</style>
