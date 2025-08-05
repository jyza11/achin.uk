<script>
	import { onMount } from 'svelte';
	
	// Dynamically import all images from the gallery folder
	const imageModules = import.meta.glob('$lib/assets/*.{png,jpg,jpeg,gif,webp,svg}', {
		eager: true,
		as: 'url'
	});
	
	// Convert the modules object to a clean array
	const galleryImages = Object.entries(imageModules).map(([path, url]) => {
		// Extract filename without extension for alt text
		const filename = path.split('/').pop().split('.')[0];
		const cleanName = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
		
		return {
			src: url,
			alt: cleanName,
			filename: filename
		};
	});
	
	let selectedImage = null;
	let isLoading = true;
	let imageError = false;
	
	// Function to get a random image
	function getRandomImage() {
		const randomIndex = Math.floor(Math.random() * galleryImages.length);
		return galleryImages[randomIndex];
	}
	
	// Function to load a new random image
	function loadRandomImage() {
		isLoading = true;
		imageError = false;
		selectedImage = getRandomImage();
	}
	
	// Handle image load success
	function handleImageLoad() {
		isLoading = false;
	}
	
	// Handle image load error
	function handleImageError() {
		isLoading = false;
		imageError = true;
	}
	
	// Load initial random image on component mount
	onMount(() => {
		loadRandomImage();
	});
</script>

<div class="gallery-container">
	{#if isLoading}
		<div class="skeleton-loader" aria-label="Loading image...">
			<div class="skeleton-shimmer"></div>
		</div>
	{/if}
	
	{#if selectedImage && !imageError}
		<img
			src={selectedImage.src}
			alt={selectedImage.alt}
			class="gallery-image"
			class:hidden={isLoading}
			on:load={handleImageLoad}
			on:error={handleImageError}
		/>
	{/if}
	
	{#if imageError}
		<div class="error-state">
			<p>Failed to load image</p>
			<button on:click={loadRandomImage} class="retry-btn">
				Try Another Image
			</button>
		</div>
	{/if}
	
	<button 
		on:click={loadRandomImage} 
		class="random-btn"
		disabled={isLoading}
	>
		{isLoading ? 'Loading...' : 'Show Random Image'}
	</button>
</div>

<style>
	.gallery-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	.gallery-image {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: opacity 0.3s ease;
	}
	
	.gallery-image.hidden {
		opacity: 0;
	}
	
	.skeleton-loader {
		width: 100%;
		max-width: 600px;
		height: 400px;
		background: #f0f0f0;
		border-radius: 8px;
		position: relative;
		overflow: hidden;
	}
	
	.skeleton-shimmer {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.6),
			transparent
		);
		animation: shimmer 1.5s infinite;
	}
	
	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}
	
	.error-state {
		text-align: center;
		padding: 2rem;
		color: #666;
	}
	
	.retry-btn,
	.random-btn {
		background: #007bff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease;
	}
	
	.retry-btn:hover,
	.random-btn:hover:not(:disabled) {
		background: #0056b3;
	}
	
	.random-btn:disabled {
		background: #6d7d6c;
		cursor: not-allowed;
	}
</style>