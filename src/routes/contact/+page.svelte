<script lang="ts">
	let name = '';
	let email = '';
	let message = '';
	let submitted = false;

	function handleSubmit() {
		// TODO: wire to your backend (Netlify Forms / Formspree / etc.)
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
				<form class="contact-form" on:submit|preventDefault={handleSubmit}>
					<label class="field">
						<span class="field-label">Name</span>
						<input type="text" bind:value={name} required autocomplete="name" />
					</label>
					<label class="field">
						<span class="field-label">Email</span>
						<input type="email" bind:value={email} required autocomplete="email" />
					</label>
					<label class="field">
						<span class="field-label">Message</span>
						<textarea bind:value={message} required rows="4"></textarea>
					</label>
					<button type="submit" class="btn primary">
						Send <span class="arrow"></span>
					</button>
				</form>
			{:else}
				<p class="thanks">
					Thank you — your note has been received. A reply will follow within a few days.
				</p>
			{/if}
		</div>
	</div>
</section>

<style>
	.contact-form {
		margin-top: 28px;
		padding-top: 24px;
		border-top: 1px solid rgba(201, 191, 168, 0.5);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.field-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-3);
	}
	.field input,
	.field textarea {
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--rule);
		padding: 6px 0;
		font-family: var(--serif);
		font-size: 16px;
		color: var(--ink);
		outline: none;
		transition: border-color 0.2s ease;
	}
	.field input:focus,
	.field textarea:focus {
		border-bottom-color: var(--oxblood);
	}
	.field textarea {
		resize: vertical;
		font-family: var(--serif);
		line-height: 1.55;
	}
	.thanks {
		margin-top: 28px;
		padding-top: 24px;
		border-top: 1px solid rgba(201, 191, 168, 0.5);
		font-family: var(--serif);
		font-style: italic;
		font-size: 17px;
		color: var(--oxblood-ink);
	}
</style>
