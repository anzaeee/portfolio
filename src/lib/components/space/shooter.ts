import { renderAsteroid, renderPlanet, renderSprite, type Surface } from './pixel';
import { rocket } from './sprites';

export interface Destination {
	label: string;
	href: string;
	palette: readonly string[];
	surface: Surface;
	seed: number;
}

interface Callbacks {
	onScore: (score: number) => void;
	onLives: (lives: number) => void;
	onGameOver: (score: number) => void;
	onPlanetHit: (index: number) => void;
}

type Asteroid = { x: number; y: number; r: number; vx: number; vy: number; hp: number; sprite: HTMLCanvasElement };
type Planet = { index: number; x: number; y: number; vx: number; phase: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };

// The game runs at a fixed logical width; height follows the screen's aspect ratio
const W = 160;
const PLANET_SIZE = 30;
const LIVES = 3;
const FIRE_COOLDOWN = 0.2;
const BULLET_SPEED = 160;
const KEY_SPEED = 95;
const POINTER_SPEED = 220;
const SPARK = ['#ffffff', '#ffd25e', '#ff8a3d', '#a99fff'];

export class ShooterGame {
	/** Written by the host page from keyboard, touch and the on-screen buttons */
	input = { left: false, right: false, fire: false, pointerX: null as number | null };

	private ctx: CanvasRenderingContext2D;
	private h = 120;
	private raf = 0;
	private last = 0;
	private running = false;

	private ship = renderSprite(rocket.rows, rocket.colors);
	private shipNoFlame = renderSprite(rocket.rows, rocket.colors, 'OY');
	private planetFrames = new Map<string, HTMLCanvasElement>();
	private rockSprites: HTMLCanvasElement[] = [];

	private stars: { x: number; y: number; speed: number; bright: boolean }[] = [];
	private player = { x: W / 2, y: 0, invulnerable: 0 };
	private bullets: { x: number; y: number }[] = [];
	private asteroids: Asteroid[] = [];
	private planet: Planet | null = null;
	private particles: Particle[] = [];

	private score = 0;
	private lives = LIVES;
	private elapsed = 0;
	private cooldown = 0;
	private spawnIn = 1;
	private planetIn = 1.5;
	private nextPlanet = 0;
	private over = false;
	private frozen = false;

	constructor(
		private canvas: HTMLCanvasElement,
		private destinations: readonly Destination[],
		private label: HTMLElement,
		private callbacks: Callbacks
	) {
		this.ctx = canvas.getContext('2d')!;
		for (let i = 0; i < 6; i++) this.rockSprites.push(renderAsteroid(4 + (i % 3) * 2, i * 13 + 1));
		this.nextPlanet = Math.floor(Math.random() * destinations.length);
		this.resize();
		this.reset();
	}

	resize() {
		// Layout size, not getBoundingClientRect: the screen may still be mid "power-on" scale animation
		const { clientWidth, clientHeight } = this.canvas;
		const ratio = clientWidth > 0 ? clientHeight / clientWidth : 0.75;
		this.h = Math.round(W * ratio);
		this.canvas.width = W;
		this.canvas.height = this.h;
		this.player.y = this.h - 12;
		this.stars = Array.from({ length: Math.round(this.h * 0.4) }, () => ({
			x: Math.random() * W,
			y: Math.random() * this.h,
			speed: 4 + Math.random() * 14,
			bright: Math.random() < 0.25
		}));
		this.draw();
	}

	reset() {
		this.score = 0;
		this.lives = LIVES;
		this.elapsed = 0;
		this.cooldown = 0;
		this.spawnIn = 1;
		this.planetIn = 1.5;
		this.over = false;
		this.frozen = false;
		this.bullets = [];
		this.asteroids = [];
		this.particles = [];
		this.planet = null;
		this.player.x = W / 2;
		this.player.invulnerable = 0;
		this.label.hidden = true;
		this.callbacks.onScore(0);
		this.callbacks.onLives(LIVES);
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.last = performance.now();
		this.raf = requestAnimationFrame(this.loop);
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.raf);
	}

	/** Resume after the player declines to land: the planet flies off and play continues */
	dismissPlanet() {
		if (this.planet) this.burst(this.planet.x, this.planet.y, 14, ['#a99fff', '#ffffff']);
		this.planet = null;
		this.planetFrames.clear();
		this.label.hidden = true;
		this.planetIn = 3;
		this.bullets = [];
		this.frozen = false;
	}

	/** Converts a client x coordinate to the game's logical x */
	toGameX(clientX: number) {
		const rect = this.canvas.getBoundingClientRect();
		return ((clientX - rect.left) / rect.width) * W;
	}

	private loop = (time: number) => {
		if (!this.running) return;
		// Clamp so a backgrounded tab doesn't come back to a huge jump
		const dt = Math.min(0.05, (time - this.last) / 1000);
		this.last = time;
		if (!this.frozen) this.update(dt);
		this.draw();
		this.raf = requestAnimationFrame(this.loop);
	};

	private update(dt: number) {
		this.elapsed += dt;
		for (const star of this.stars) {
			star.y += star.speed * dt;
			if (star.y > this.h) {
				star.y = 0;
				star.x = Math.random() * W;
			}
		}
		this.updateParticles(dt);
		if (this.over) return;

		this.movePlayer(dt);
		this.fire(dt);
		this.updateBullets(dt);
		this.updatePlanet(dt);
		this.updateAsteroids(dt);
	}

	private movePlayer(dt: number) {
		const { input, player } = this;
		if (input.pointerX !== null) {
			const delta = input.pointerX - player.x;
			player.x += Math.sign(delta) * Math.min(Math.abs(delta), POINTER_SPEED * dt);
		} else {
			player.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * KEY_SPEED * dt;
		}
		player.x = Math.max(7, Math.min(W - 7, player.x));
		player.invulnerable = Math.max(0, player.invulnerable - dt);
	}

	private fire(dt: number) {
		this.cooldown -= dt;
		if (this.input.fire && this.cooldown <= 0) {
			this.bullets.push({ x: Math.round(this.player.x), y: this.player.y - 9 });
			this.cooldown = FIRE_COOLDOWN;
		}
	}

	private updateBullets(dt: number) {
		this.bullets = this.bullets.filter((bullet) => {
			bullet.y -= BULLET_SPEED * dt;
			if (bullet.y < -4) return false;

			for (const rock of this.asteroids) {
				if (Math.hypot(bullet.x - rock.x, bullet.y - rock.y) < rock.r + 1) {
					rock.hp--;
					this.burst(bullet.x, bullet.y, 3, ['#ffffff', '#bdb6cf']);
					return false;
				}
			}

			const planet = this.planet;
			if (planet && Math.hypot(bullet.x - planet.x, bullet.y - planet.y) < PLANET_SIZE / 2) {
				this.burst(bullet.x, bullet.y, 10, ['#ffffff', '#a99fff']);
				this.frozen = true;
				this.input.fire = false;
				this.callbacks.onPlanetHit(planet.index);
				return false;
			}
			return true;
		});
	}

	private updatePlanet(dt: number) {
		if (!this.planet) {
			this.planetIn -= dt;
			if (this.planetIn > 0) return;
			const fromLeft = Math.random() < 0.5;
			const r = PLANET_SIZE / 2;
			this.planet = {
				index: this.nextPlanet,
				x: fromLeft ? -r : W + r,
				y: r + 8 + Math.random() * (this.h * 0.4 - r),
				vx: (fromLeft ? 1 : -1) * (11 + Math.random() * 5),
				phase: Math.random() * Math.PI * 2
			};
			this.nextPlanet = (this.nextPlanet + 1) % this.destinations.length;
			this.label.textContent = this.destinations[this.planet.index].label;
			this.label.hidden = false;
		}

		const planet = this.planet;
		planet.x += planet.vx * dt;
		const r = PLANET_SIZE / 2;
		if (planet.x < -r - 2 || planet.x > W + r + 2) {
			this.planet = null;
			this.planetFrames.clear();
			this.label.hidden = true;
			this.planetIn = 1.5 + Math.random() * 2;
			return;
		}
		const y = planet.y + Math.sin(this.elapsed * 1.5 + planet.phase) * 2;
		this.label.style.left = `${(planet.x / W) * 100}%`;
		this.label.style.top = `${((y + r + 3) / this.h) * 100}%`;
	}

	private updateAsteroids(dt: number) {
		this.spawnIn -= dt;
		if (this.spawnIn <= 0) {
			// Gets busier the longer you survive
			this.spawnIn = Math.max(0.4, 1.3 - this.elapsed * 0.012) * (0.6 + Math.random() * 0.8);
			const sprite = this.rockSprites[Math.floor(Math.random() * this.rockSprites.length)];
			const r = (sprite.width - 1) / 2;
			this.asteroids.push({
				x: r + Math.random() * (W - r * 2),
				y: -r,
				r,
				vx: (Math.random() - 0.5) * 10,
				vy: Math.min(70, 16 + Math.random() * 16 + this.elapsed * 0.45),
				hp: r >= 8 ? 2 : 1,
				sprite
			});
		}

		const { player } = this;
		this.asteroids = this.asteroids.filter((rock) => {
			if (rock.hp <= 0) {
				this.score += rock.r >= 8 ? 25 : 10;
				this.callbacks.onScore(this.score);
				this.burst(rock.x, rock.y, 12, SPARK);
				return false;
			}
			rock.x += rock.vx * dt;
			rock.y += rock.vy * dt;
			if (rock.y - rock.r > this.h) return false;

			const hitX = Math.abs(rock.x - player.x) < rock.r + 4;
			const hitY = rock.y + rock.r > player.y - 7 && rock.y - rock.r < player.y + 6;
			if (hitX && hitY && player.invulnerable <= 0) {
				this.burst(rock.x, rock.y, 14, SPARK);
				this.lives--;
				this.callbacks.onLives(this.lives);
				if (this.lives <= 0) {
					this.over = true;
					this.burst(player.x, player.y, 30, SPARK);
					this.callbacks.onGameOver(this.score);
				} else {
					player.invulnerable = 1.5;
				}
				return false;
			}
			return true;
		});
	}

	private updateParticles(dt: number) {
		this.particles = this.particles.filter((p) => {
			p.life -= dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			return p.life > 0;
		});
	}

	private burst(x: number, y: number, count: number, colors: string[]) {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 15 + Math.random() * 45;
			const life = 0.3 + Math.random() * 0.5;
			this.particles.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life,
				max: life,
				color: colors[i % colors.length]
			});
		}
	}

	private planetFrame(index: number) {
		const destination = this.destinations[index];
		// Surface noise doesn't tile, so spin keeps increasing rather than looping
		const frame = Math.floor(this.elapsed * 2);
		const key = `${index}:${frame}`;
		let sprite = this.planetFrames.get(key);
		if (!sprite) {
			sprite = renderPlanet(PLANET_SIZE, destination.palette, destination.surface, destination.seed, frame * 0.02);
			this.planetFrames.set(key, sprite);
		}
		return sprite;
	}

	private draw() {
		const { ctx, h } = this;
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, W, h);

		for (const star of this.stars) {
			ctx.fillStyle = star.bright ? '#ffffff' : '#4b4470';
			ctx.fillRect(Math.round(star.x), Math.round(star.y), 1, star.speed > 14 ? 2 : 1);
		}

		if (this.planet) {
			const planet = this.planet;
			const y = planet.y + Math.sin(this.elapsed * 1.5 + planet.phase) * 2;
			ctx.drawImage(this.planetFrame(planet.index), Math.round(planet.x - PLANET_SIZE / 2), Math.round(y - PLANET_SIZE / 2));
		}

		for (const rock of this.asteroids) {
			ctx.drawImage(rock.sprite, Math.round(rock.x - rock.r), Math.round(rock.y - rock.r));
		}

		for (const bullet of this.bullets) {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(bullet.x, Math.round(bullet.y), 1, 2);
			ctx.fillStyle = '#8f7dff';
			ctx.fillRect(bullet.x, Math.round(bullet.y) + 2, 1, 2);
		}

		const { player } = this;
		const blink = player.invulnerable > 0 && Math.floor(this.elapsed * 12) % 2 === 0;
		if (!this.over && !blink) {
			const sprite = Math.floor(this.elapsed * 12) % 2 ? this.ship : this.shipNoFlame;
			ctx.drawImage(sprite, Math.round(player.x - 6), Math.round(player.y - 9));
		}

		for (const p of this.particles) {
			ctx.globalAlpha = Math.max(0, p.life / p.max);
			ctx.fillStyle = p.color;
			ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
		}
		ctx.globalAlpha = 1;
	}
}
