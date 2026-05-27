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
