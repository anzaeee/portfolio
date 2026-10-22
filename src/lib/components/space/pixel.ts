// Small deterministic noise + dithering helpers for the pixel-art canvases

export function hash(x: number, y: number, seed = 0) {
	let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)) | 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function noise(x: number, y: number, seed = 0) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const xf = x - xi;
	const yf = y - yi;
	const u = xf * xf * (3 - 2 * xf);
	const v = yf * yf * (3 - 2 * yf);
	const a = hash(xi, yi, seed);
	const b = hash(xi + 1, yi, seed);
	const c = hash(xi, yi + 1, seed);
	const d = hash(xi + 1, yi + 1, seed);
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, seed = 0, octaves = 4) {
	let value = 0;
	let amplitude = 0.5;
	for (let i = 0; i < octaves; i++) {
		value += amplitude * noise(x, y, seed + i * 17);
		x *= 2;
		y *= 2;
		amplitude *= 0.5;
	}
	return value / (1 - Math.pow(0.5, octaves));
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Ordered-dither threshold in [-0.5, 0.5) for pixel (x, y) */
export function bayer(x: number, y: number) {
	return BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
}

export function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function prefersReducedMotion() {
	return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type Surface = 'bands' | 'craters';

/** Draws a lit, dithered pixel planet into a new size×size canvas. `spin` rotates the surface. */
export function renderPlanet(size: number, palette: readonly string[], surface: Surface, seed: number, spin = 0) {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const image = ctx.createImageData(size, size);
	const colors = palette.map(hexToRgb);
	// Light from the upper left, slightly in front
	const [lx, ly, lz] = [-0.55, -0.55, 0.63];

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = ((x + 0.5) / size) * 2 - 1;
			const dy = ((y + 0.5) / size) * 2 - 1;
			const r2 = dx * dx + dy * dy;
			if (r2 > 1) continue;
			const dz = Math.sqrt(1 - r2);
			const light = Math.max(0, dx * lx + dy * ly + dz * lz);
			const lon = Math.atan2(dx, dz) / Math.PI + spin;

			let texture: number;
			if (surface === 'bands') {
				texture = 0.5 + 0.5 * Math.sin(dy * 6 + fbm(lon * 2, dy * 2, seed, 3) * 3);
			} else {
				const ground = fbm(lon * 2.5, dy * 2.5, seed, 3);
				const pits = fbm(lon * 7 + 50, dy * 7, seed + 3, 2);
				texture = ground * 0.75 + (pits > 0.66 ? -0.3 : pits > 0.6 ? 0.12 : 0);
			}

			let shade = texture * 0.38 + light * 0.85 - 0.08;
			if (dz < 0.22) shade -= 0.18; // darker rim reads as a sphere
			const level = Math.round(shade * (colors.length - 1) + bayer(x, y) * 0.7);
			const [r, g, b] = colors[Math.max(0, Math.min(colors.length - 1, level))];
			const i = (y * size + x) * 4;
			image.data[i] = r;
			image.data[i + 1] = g;
			image.data[i + 2] = b;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	return canvas;
}

const ROCK = ['#1f1b29', '#3d3749', '#625a73', '#8f88a3', '#bdb6cf'].map(hexToRgb);

/** A lumpy, shaded asteroid of the given radius */
export function renderAsteroid(radius: number, seed: number) {
	const size = radius * 2 + 1;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = x - radius;
			const dy = y - radius;
			const angle = Math.atan2(dy, dx);
			const edge = radius * (0.72 + 0.32 * noise(Math.cos(angle) * 1.5 + 5, Math.sin(angle) * 1.5 + 5, seed));
			const d = Math.hypot(dx, dy);
			if (d > edge) continue;
			const light = 1 - (dx + dy + radius) / (radius * 3.2) - (d / edge) * 0.25;
			const pit = noise(x * 0.9, y * 0.9, seed + 9) > 0.7 ? -0.25 : 0;
			const level = Math.round((light + pit) * (ROCK.length - 1) + bayer(x, y) * 0.6);
			const [r, g, b] = ROCK[Math.max(0, Math.min(ROCK.length - 1, level))];
			const i = (y * size + x) * 4;
			image.data[i] = r;
			image.data[i + 1] = g;
			image.data[i + 2] = b;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	return canvas;
}

/** Rasterises a character-grid sprite at one canvas pixel per cell. `skip` drops those keys. */
export function renderSprite(rows: string[], colors: Record<string, string>, skip = '') {
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(...rows.map((r) => r.length));
	canvas.height = rows.length;
	const ctx = canvas.getContext('2d')!;
	rows.forEach((row, y) =>
		[...row].forEach((char, x) => {
			if (!colors[char] || skip.includes(char)) return;
			ctx.fillStyle = colors[char];
			ctx.fillRect(x, y, 1, 1);
		})
	);
	return canvas;
}
