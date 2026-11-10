<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A CRT screen in a dark bezel, like the home console's display: scanlines, a glossy reflection and a
	 * power-on animation. Wrap any content in it.
	 */
	let {
		children,
		class: className = '',
		glow = false,
		power = true
	}: {
		children: Snippet;
		class?: string;
		/** Violet glow around the bezel, for the main screen on a page */
		glow?: boolean;
		/** Play the power-on animation when it appears */
		power?: boolean;
	} = $props();
</script>

<div class="bezel {className}" class:glow>
	<div class="crt" class:power>
		{@render children()}
		<span class="scanlines" aria-hidden="true"></span>
	</div>
</div>

<style>
	.bezel {
		height: 100%;
		padding: 8px;
		border-radius: 14px;
		background: #121214;
		box-shadow: inset 0 0 0 2px #000, inset 0 6px 18px rgba(0, 0, 0, 0.8), 0 0 0 1px #34344a;
	}

	.bezel.glow {
		box-shadow: inset 0 0 0 2px #000, inset 0 6px 18px rgba(0, 0, 0, 0.8), 0 0 0 1px #5a4ae0, 0 0 50px rgba(114, 98, 255, 0.18);
	}

	.crt {
		position: relative;
		height: 100%;
		overflow: hidden;
		padding: 1.4rem 1.5rem;
		border-radius: 9px;
		background: #000;
	}

	.crt.power {
		animation: px-power-on 0.35s ease-out;
	}

	/* Glossy reflection in the top-right corner */
	.crt::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(ellipse 55% 45% at 82% 6%, rgba(255, 255, 255, 0.1), transparent 70%);
	}

	.scanlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 3px);
	}

	@media (max-width: 600px) {
		.crt {
			padding: 1.15rem 1.1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.crt.power {
			animation: none;
		}
	}
</style>
