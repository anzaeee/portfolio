<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion, renderPlanet, type Surface } from './pixel';

	let {
		palette,
		surface = 'bands',
		seed = 1,
		resolution = 56,
		speed = 0.03
	}: {
		/** Colours from darkest to lightest */
		palette: readonly string[];
		surface?: Surface;
		seed?: number;
		resolution?: number;
		/** Surface rotations per second */
		speed?: number;
	} = $props();

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let raf = 0;
		let last = 0;

		function draw(spin: number) {
			ctx.clearRect(0, 0, resolution, resolution);
			ctx.drawImage(renderPlanet(resolution, palette, surface, seed, spin), 0, 0);
		}

		function loop(time: number) {
			raf = requestAnimationFrame(loop);
			if (time - last < 90) return;
			last = time;
			draw((time / 1000) * speed);
		}

		draw(0);
		if (!prefersReducedMotion()) raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

<canvas bind:this={canvas} width={resolution} height={resolution} aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
	}
</style>
