<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	// Import at the top
	import profilePic from '$lib/assets/pro.jpg';
	import DonationCard from '$lib/components/DonationCard.svelte';
  
  function handleDonation(event) {
    const { amount, name, email, message } = event.detail;
    console.log('Donation received:', { amount, name, email, message });
    
    // Here you would integrate with payment processor
    // Stripe, PayPal, etc.
  }
</script>
<div class="container mx-auto p-4">
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
				</a>
			</div>
		</div>
	</div>	
	<!-- Your existing content -->
	
	<!-- Donation Section -->
	<section class="py-12">
	  <DonationCard on:donate={handleDonation} />
	</section>
  </div>
