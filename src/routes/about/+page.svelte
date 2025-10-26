<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	// Import at the top
	import profilePic from '$lib/assets/pro.jpg';
</script>
<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">Achin</h2>
		<!-- Animated Logo -->
		<figure>
			<section class="img-bg" />
			<img class="w-64 h-48" src={profilePic} alt="./src/lib/assets/28114F1D-536C-4DCB-8C05-7C63B2A034A7.JPG">
		</figure>
		<!-- / -->
		<div class="flex justify-center space-x-2">
			
			<a
				class="btn variant-filled"
				href="/"
				target="_blank"
				rel="noreferrer"
			>
			用錢 支持藝術家
			
			</a>
		</div>
		<div class="space-y-2  flex flex-col ">
			我不在家就在去咖啡館的路上…… 雙叟 左岸 巴黎 花街…… 黃金海岸的比基尼…… 可憐我ㄧ雙Ferragamo的高跟鞋
		</div>
	</div>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
