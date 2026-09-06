<!-- DonationCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Donation amounts
	const presetAmounts = [10, 25, 50, 100, 250];
	let selectedAmount: number | null = $state(null);
	let customAmount = $state('');
	let donorName = $state('');
	let donorEmail = $state('');
	let message = $state('');
	let isProcessing = $state(false);

	// Handle preset amount selection
	function selectAmount(amount: number) {
		selectedAmount = amount;
		customAmount = '';
	}

	// Handle custom amount input
	function handleCustomAmount(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		if (value && !isNaN(parseFloat(value)) && parseFloat(value) > 0) {
			selectedAmount = parseFloat(value);
			customAmount = value;
		} else {
			selectedAmount = null;
		}
	}

	// Handle donation submission
	async function handleDonate() {
		if (!selectedAmount || selectedAmount <= 0) {
			alert('Please select or enter a donation amount');
			return;
		}

		if (!donorName.trim() || !donorEmail.trim()) {
			alert('Please fill in your name and email');
			return;
		}

		isProcessing = true;

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Dispatch event to parent component
			dispatch('donate', {
				amount: selectedAmount,
				name: donorName,
				email: donorEmail,
				message: message
			});

			// Show success message
			alert(`Thank you ${donorName}! Your donation of $${selectedAmount} is being processed.`);

			// Reset form
			selectedAmount = null;
			customAmount = '';
			donorName = '';
			donorEmail = '';
			message = '';
		} catch {
			alert('Donation failed. Please try again.');
		} finally {
			isProcessing = false;
		}
	}

	let finalAmount = $derived(selectedAmount || 0);
</script>

<div
	class="donation-card bg-surface-50 dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-600 p-6 max-w-md mx-auto"
>
	<!-- Header -->
	<div class="text-center mb-6">
		<div
			class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4"
		>
			<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
				/>
			</svg>
		</div>
		<h2 class="text-2xl font-bold text-surface-800 dark:text-surface-100 mb-2">
			Support Achin's Art
		</h2>
		<p class="text-surface-600 dark:text-surface-300">
			Your donation helps us continue our work and make a difference in the community.
		</p>
	</div>

	<!-- Amount Selection -->
	<div class="mb-6">
		<label class="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-3">
			捐款金額
		</label>
		<div class="grid grid-cols-3 gap-2 mb-4">
			{#each presetAmounts as amount}
				<button
					class="py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium
						{selectedAmount === amount && !customAmount
						? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
						: 'border-surface-300 dark:border-surface-600 hover:border-primary-300 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200'}"
					onclick={() => selectAmount(amount)}
				>
					${amount}
				</button>
			{/each}
		</div>

		<!-- Custom Amount -->
		<div class="relative">
			<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500">$</span>
			<input
				type="number"
				placeholder="Custom amount"
				bind:value={customAmount}
				oninput={handleCustomAmount}
				class="w-full pl-8 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg
					focus:ring-2 focus:ring-primary-500 focus:border-primary-500
					bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-100
					placeholder-surface-500"
				min="1"
				step="0.01"
			/>
		</div>
	</div>

	<!-- Donor Information -->
	<div class="mb-6 space-y-4">
		<div>
			<label class="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">
				Full Name *
			</label>
			<input
				type="text"
				bind:value={donorName}
				placeholder="Enter your name"
				class="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg
					focus:ring-2 focus:ring-primary-500 focus:border-primary-500
					bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-100
					placeholder-surface-500"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">
				Email Address *
			</label>
			<input
				type="email"
				bind:value={donorEmail}
				placeholder="Enter your email"
				class="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg
					focus:ring-2 focus:ring-primary-500 focus:border-primary-500
					bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-100
					placeholder-surface-500"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">
				Message (Optional)
			</label>
			<textarea
				bind:value={message}
				placeholder="Leave a message..."
				rows="3"
				class="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg
					focus:ring-2 focus:ring-primary-500 focus:border-primary-500
					bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-100
					placeholder-surface-500 resize-none"
			></textarea>
		</div>
	</div>

	<!-- Donation Summary -->
	{#if finalAmount > 0}
		<div
			class="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mb-6"
		>
			<div class="flex justify-between items-center">
				<span class="text-primary-700 dark:text-primary-300 font-semibold"> Donation Amount: </span>
				<span class="text-2xl font-bold text-primary-700 dark:text-primary-300">
					${finalAmount.toFixed(2)}
				</span>
			</div>
		</div>
	{/if}

	<!-- Donate Button -->
	<button
		onclick={handleDonate}
		disabled={!finalAmount || isProcessing || !donorName.trim() || !donorEmail.trim()}
		class="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
			{isProcessing
			? 'bg-surface-400 cursor-not-allowed text-surface-600'
			: finalAmount && donorName.trim() && donorEmail.trim()
				? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
				: 'bg-surface-300 dark:bg-surface-600 cursor-not-allowed text-surface-500'}"
	>
		{#if isProcessing}
			<div class="flex items-center justify-center space-x-2">
				<svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4.354a7.646 7.646 0 110 15.292V12"
					></path>
				</svg>
				<span>Processing...</span>
			</div>
		{:else}
			Donate ${finalAmount.toFixed(2)}
		{/if}
	</button>

	<!-- Security Notice -->
	<div class="mt-4 text-center">
		<div class="flex items-center justify-center space-x-2 text-sm text-surface-500">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			<span>Secure & Encrypted Payment</span>
		</div>
	</div>
</div>
