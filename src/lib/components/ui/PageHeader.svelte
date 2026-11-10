<script lang="ts">
	import type { Snippet } from 'svelte';
	import PixelPlanet from '$lib/components/space/PixelPlanet.svelte';
	import PixelSprite from '$lib/components/space/PixelSprite.svelte';
	import { rocket } from '$lib/components/space/sprites';
	import { planet } from '$lib/destinations';

	/** Page header built around the page's planet from the home console, with the rocket parked beneath it. */
	let {
		destination,
		kicker = 'Planet reached',
		title,
		children
	}: {
		/** The planet's label on the home console, e.g. "About" */
		destination: string;
		kicker?: string;
		title: string;
		children?: Snippet;
	} = $props();

	const world = $derived(planet(destination));
</script>

<header class="page-header">
	<div class="orb px-select selected" aria-hidden="true">
		<PixelPlanet palette={world.palette} surface={world.surface} seed={world.seed} />
		<span class="pilot"><PixelSprite {...rocket} pixel={3} /></span>
	</div>
	<div class="text">
		<span class="px-label kicker"><span class="px-blink">▶</span> {kicker}</span>
		<h1>{title}</h1>
		{#if children}<div class="intro">{@render children()}</div>{/if}
	</div>
</header>

<style>
	.page-header {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 2.5rem;
		animation: px-power-on 0.35s ease-out;
	}

	.orb {
		width: 132px;
		height: 132px;
	}

	.pilot {
		position: absolute;
		left: 50%;
		bottom: -26px;
		transform: translateX(-50%);
		animation: px-bob 1.6s ease-in-out infinite;
	}

	.pilot :global(.px-O),
	.pilot :global(.px-Y) {
		animation: flame 0.18s steps(2) infinite;
	}

	.kicker {
		margin-bottom: 0.6rem;
	}

	h1 {
		margin-bottom: 0.75rem;
	}

	.intro :global(p) {
		max-width: 640px;
		font-size: 1.05rem;
		line-height: 1.75;
	}

	.intro :global(p:last-child) {
		margin-bottom: 0;
	}

	@keyframes flame {
		0% { opacity: 1; }
		100% { opacity: 0.35; }
	}

	@media (max-width: 640px) {
		.page-header {
			grid-template-columns: 1fr;
			gap: 2.25rem;
		}

		.orb {
			width: 96px;
			height: 96px;
		}

		.pilot {
			bottom: -22px;
			scale: 0.8;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-header,
		.pilot,
		.pilot :global(.px-O),
		.pilot :global(.px-Y) {
			animation: none;
		}
	}
</style>
