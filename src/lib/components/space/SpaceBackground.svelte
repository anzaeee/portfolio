<script lang="ts">
	import { onMount } from 'svelte';
	import { bayer, fbm, hexToRgb, prefersReducedMotion, seeded } from './pixel';

	// Each canvas pixel covers SCALE×SCALE screen pixels
	const SCALE = 3;
	const NEBULA = ['#050508', '#0d0830', '#1c1265', '#3423a8', '#5a45e6', '#8f7dff', '#c9bfff'].map(hexToRgb);

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const reduceMotion = prefersReducedMotion();
		let base: HTMLCanvasElement;
		let w = 0;
		let h = 0;
		let sparkles: { x: number; y: number; phase: number; speed: number; big: boolean }[] = [];
		let shooting: { x: number; y: number; life: number } | null = null;
		let nextShot = 0;
		let raf = 0;
		let lastFrame = 0;
		let resizeTimer: ReturnType<typeof setTimeout>;

		function spiral(nx: number, ny: number, cx: number, cy: number, radius: number, twist: number) {
			const dx = (nx - cx) / radius;
			const dy = (ny - cy) / (radius * 0.62);
			const d = Math.sqrt(dx * dx + dy * dy);
			if (d > 1.4) return 0;
			const arms = 0.5 + 0.5 * Math.cos(2 * Math.atan2(dy, dx) - Math.log(d + 0.05) * twist);
			return Math.exp(-d * 2.4) * (0.35 + 0.9 * arms) + Math.exp(-d * 9) * 0.9;
		}

		function build() {
			w = Math.ceil(window.innerWidth / SCALE);
			h = Math.ceil(window.innerHeight / SCALE);
			canvas.width = w;
			canvas.height = h;

			base = document.createElement('canvas');
			base.width = w;
			base.height = h;
			const bctx = base.getContext('2d')!;
			const image = bctx.createImageData(w, h);
			const rand = seeded(7);
			const aspect = w / h;

			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const nx = x / w;
					const ny = y / h;
					// Nebula hugs the left and right edges, leaving the middle dark
					const edge = Math.max(1 - nx / 0.3, (nx - 0.7) / 0.3, 0);
					// Domain-warped noise gives wispy streaks rather than blobs
					const warp = fbm(nx * 3 * aspect, ny * 3, 9) * 2.2;
					const cloud = fbm(nx * 4 * aspect + warp, ny * 4 - warp * 0.5, 3) * 1.2 - 0.62;
					let density = Math.max(0, cloud) * edge * 1.9;
					density += spiral(nx, ny, 0.12, 0.22, 0.1, 5) * (aspect > 1 ? 0.9 : 0.45);
					density += spiral(nx, ny, 0.9, 0.8, 0.07, -4) * 0.6;
					const level = Math.round(Math.min(1, density) * (NEBULA.length - 1) + bayer(x, y) * 1.1);
					const [r, g, b] = NEBULA[Math.max(0, Math.min(NEBULA.length - 1, level))];
					const i = (y * w + x) * 4;
					image.data[i] = r;
					image.data[i + 1] = g;
					image.data[i + 2] = b;
					image.data[i + 3] = 255;

					if (rand() < 0.0035) {
						const bright = 150 + Math.floor(rand() * 105);
						image.data[i] = bright;
						image.data[i + 1] = bright;
						image.data[i + 2] = 255;
					}
				}
			}
			bctx.putImageData(image, 0, 0);

			sparkles = Array.from({ length: Math.round((w * h) / 2600) }, () => ({
				x: Math.floor(rand() * w),
				y: Math.floor(rand() * h),
				phase: rand() * Math.PI * 2,
				speed: 0.6 + rand() * 1.6,
				big: rand() < 0.3
			}));
		}

		function drawSparkle(x: number, y: number, alpha: number, big: boolean) {
			ctx.globalAlpha = alpha;
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(x, y, 1, 1);
			ctx.fillStyle = '#c9bfff';
			ctx.fillRect(x - 1, y, 1, 1);
			ctx.fillRect(x + 1, y, 1, 1);
			ctx.fillRect(x, y - 1, 1, 1);
			ctx.fillRect(x, y + 1, 1, 1);
			if (big) {
				ctx.globalAlpha = alpha * 0.6;
				ctx.fillRect(x - 2, y, 1, 1);
				ctx.fillRect(x + 2, y, 1, 1);
				ctx.fillRect(x, y - 2, 1, 1);
				ctx.fillRect(x, y + 2, 1, 1);
			}
		}

		function draw(time: number) {
			ctx.globalAlpha = 1;
			ctx.drawImage(base, 0, 0);
			const t = time / 1000;
			for (const s of sparkles) {
				const alpha = reduceMotion ? 0.8 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
				if (alpha > 0.15) drawSparkle(s.x, s.y, alpha, s.big);
			}

			if (!reduceMotion) {
				if (!shooting && time > nextShot) {
					shooting = { x: w * (0.35 + Math.random() * 0.6), y: h * Math.random() * 0.35, life: 0 };
				}
				if (shooting) {
					shooting.life += 1;
					const head = shooting.life * 3;
					for (let i = 0; i < 18; i++) {
						ctx.globalAlpha = (1 - i / 18) * (1 - shooting.life / 40);
						ctx.fillStyle = i < 2 ? '#ffffff' : '#8f7dff';
						ctx.fillRect(Math.round(shooting.x - head + i * 1.6), Math.round(shooting.y + head * 0.45 - i * 0.72), 1, 1);
					}
					if (shooting.life > 40) {
						shooting = null;
						nextShot = time + 3500 + Math.random() * 5000;
					}
				}
			}
			ctx.globalAlpha = 1;
		}

		function loop(time: number) {
			raf = requestAnimationFrame(loop);
			// ~24fps is plenty for pixel art and keeps the CPU quiet
			if (time - lastFrame < 42) return;
			lastFrame = time;
			draw(time);
		}

		function onResize() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				build();
				draw(performance.now());
			}, 150);
		}

		build();
		draw(0);
		nextShot = 2000;
		if (!reduceMotion) raf = requestAnimationFrame(loop);
		window.addEventListener('resize', onResize);

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<canvas bind:this={canvas} class="space" aria-hidden="true"></canvas>

<style>
	.space {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		image-rendering: pixelated;
		background: #050508;
	}
</style>
