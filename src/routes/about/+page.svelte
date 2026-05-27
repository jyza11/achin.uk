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
			<img src={profilePic} alt="The artist" />
		</div>
		<div>
			<p class="pq">
				我不在家就在去咖啡館的路上 — 雙叟 · 左岸 · 巴黎 · 花街 — 黃金海岸的比基尼 — 可憐我一雙 Ferragamo 的高跟鞋。
			</p>
			<p>
				A practice built on slow looking. Oil on linen, graphite on paper, and the long hours between — light, weather, and the corners of rooms held still long enough to draw out the hour before the room forgets itself.
			</p>
			<p>
				Working from life and from memory. Sittings at the café, drawings in the morning, paintings revisited in the studio after the day has cooled.
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
