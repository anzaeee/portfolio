<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import contactData from '$lib/contact-data.json';
	import PixelPlanet from './PixelPlanet.svelte';
	import PixelSprite from './PixelSprite.svelte';
	import { heart, rocket, sparkle } from './sprites';
	import { ShooterGame, type Destination } from './shooter';

	const info = contactData.personalInfo;
	const links = contactData.socialLinks;

	const destinations: Destination[] = [
		{ label: 'About', href: '/about', palette: ['#1a1030', '#3b2a63', '#6b5a9e', '#a291d6', '#d9cff5'], surface: 'craters', seed: 3 },
		{ label: 'Projects', href: '/projects', palette: ['#0c0840', '#2a1aa0', '#4b32e0', '#7a62ff', '#b9a8ff'], surface: 'bands', seed: 8 },
		{ label: 'Resume', href: '/resume', palette: ['#1b1b22', '#4a4a55', '#85858f', '#bdbdc6', '#ececf1'], surface: 'craters', seed: 12 },
		{ label: 'Contact', href: '/contact', palette: ['#0d1a3a', '#24407e', '#4f7cc4', '#94b9ec', '#dbe9ff'], surface: 'bands', seed: 21 },
		{ label: 'GitHub', href: links.github, palette: ['#2a0f3d', '#5b2185', '#9445c9', '#c98af0', '#f1d6ff'], surface: 'bands', seed: 34 },
		{ label: 'LinkedIn', href: links.linkedin, palette: ['#05063a', '#10149a', '#2a33e6', '#5d6bff', '#a9b2ff'], surface: 'bands', seed: 55 }
	];

	const BEST_KEY = 'star-shooter-best';

	type Screen = 'title' | 'menu' | 'playing' | 'paused' | 'prompt' | 'over';

	/** Menu slots: one per destination planet, then the Play option */
	const PLAY = destinations.length;

	let screen = $state<Screen>('title');
	let selected = $state(0);
	let columns = $state(3);
	let lastColumn = 0;
	let score = $state(0);
	let lives = $state(3);
	let best = $state(0);
	let target = $state<Destination | null>(null);
	let warping = $state(false);
	let showIntro = $state(false);
	let touch = $state(false);

	let canvas: HTMLCanvasElement | undefined = $state();
	let planetLabel: HTMLElement | undefined = $state();
	let game: ShooterGame | null = null;
	let introTimer: ReturnType<typeof setTimeout>;

	const isExternal = (href: string) => /^https?:/.test(href);
	const inGame = $derived(screen !== 'title' && screen !== 'menu');

	function readBest() {
		try {
			return Number(localStorage.getItem(BEST_KEY)) || 0;
		} catch {
			return 0;
		}
	}

	function saveBest(value: number) {
		best = Math.max(best, value);
		try {
			localStorage.setItem(BEST_KEY, String(best));
		} catch {
			// Storage can be unavailable (private mode); the best score just won't persist
		}
	}

	function openMenu() {
		game?.stop();
		releaseInput();
		// The canvas unmounts with the playfield, so the next game builds a fresh one
		game = null;
		screen = 'menu';
	}

	/** Arrow/D-pad movement around the planet grid and the Play bar below it */
	function move(dx: number, dy: number) {
		const rows = Math.ceil(PLAY / columns);
		if (selected === PLAY) {
			if (dy !== 0) selected = Math.min(PLAY - 1, (dy < 0 ? rows - 1 : 0) * columns + lastColumn);
			return;
		}
		const col = selected % columns;
		const row = Math.floor(selected / columns);
		if ((dy > 0 && row === rows - 1) || (dy < 0 && row === 0)) {
			lastColumn = col;
			selected = PLAY;
			return;
		}
		const nextCol = (col + dx + columns) % columns;
		selected = Math.min(PLAY - 1, (row + dy) * columns + nextCol);
	}

	/** Activate a menu slot: travel to a planet or start the game */
	function choose(index = selected) {
		selected = index;
		if (index === PLAY) return startGame();
		const { href } = destinations[index];
		if (isExternal(href)) {
			window.open(href, '_blank', 'noopener');
			return;
		}
		warping = true;
		setTimeout(() => goto(href), 450);
	}

	async function startGame() {
		screen = 'playing';
		await tick();
		if (!canvas || !planetLabel) return;
		if (!game) {
			game = new ShooterGame(canvas, destinations, planetLabel, {
				onScore: (value) => (score = value),
				onLives: (value) => (lives = value),
				onGameOver: (value) => {
					saveBest(value);
					screen = 'over';
				},
				onPlanetHit: (index) => {
					target = destinations[index];
					screen = 'prompt';
				}
			});
		} else {
			game.resize();
			game.reset();
		}
		game.start();
		showIntro = true;
		clearTimeout(introTimer);
		introTimer = setTimeout(() => (showIntro = false), 3500);
	}

	function togglePause() {
		if (screen === 'playing') {
			game?.stop();
			releaseInput();
			screen = 'paused';
		} else if (screen === 'paused') {
			screen = 'playing';
			game?.start();
		}
	}

	function land() {
		if (!target) return;
		const { href } = target;
		if (isExternal(href)) {
			// Runs inside a key or click handler, so the browser allows the new tab
			window.open(href, '_blank', 'noopener');
			keepFlying();
			return;
		}
		game?.stop();
		warping = true;
		setTimeout(() => goto(href), 450);
	}

	function keepFlying() {
		game?.dismissPlanet();
		target = null;
		screen = 'playing';
	}

	function releaseInput() {
		if (!game) return;
		game.input.left = game.input.right = game.input.fire = false;
		game.input.pointerX = null;
	}

	/** A / Start-style confirm, depending on which screen is showing */
	function confirm() {
		if (screen === 'title') screen = 'menu';
		else if (screen === 'menu') choose();
		else if (screen === 'prompt') land();
		else if (screen === 'over') startGame();
		else if (screen === 'paused') togglePause();
	}

	/** B-style back: game → menu → title */
	function back() {
		if (screen === 'prompt') keepFlying();
		else if (screen === 'menu') screen = 'title';
		else if (screen !== 'title') openMenu();
	}

	function setFire(on: boolean) {
		if (screen === 'playing' && game) game.input.fire = on;
		else if (on) confirm();
	}

	function setDirection(direction: 'left' | 'right' | 'up' | 'down', on: boolean) {
		if (screen === 'playing' && game) {
			if (direction === 'left' || direction === 'right') game.input[direction] = on;
		} else if (on && screen === 'menu') {
			move(direction === 'left' ? -1 : direction === 'right' ? 1 : 0, direction === 'up' ? -1 : direction === 'down' ? 1 : 0);
		} else if (on && screen === 'title') {
			screen = 'menu';
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		const element = event.target as HTMLElement;
		if (element.closest('input, textarea, select, [contenteditable]')) return;
		const key = event.key.toLowerCase();
		// Let Enter/Space press a focused link or button (e.g. the prompt buttons) normally
		if ((key === 'enter' || key === ' ') && element.closest('a, button')) return;

		let handled = true;
		if (key === 'arrowleft') setDirection('left', true);
		else if (key === 'arrowright') setDirection('right', true);
		else if (key === 'arrowup' && screen !== 'title') setDirection('up', true);
		else if (key === 'arrowdown' && screen !== 'title') setDirection('down', true);
		else if ([' ', 'a', 'z', 'enter'].includes(key)) {
			if (!event.repeat || screen === 'playing') setFire(true);
		} else if (['b', 'x', 'escape'].includes(key)) back();
		else if (key === 'p' && inGame) togglePause();
		else handled = false;

		if (handled) event.preventDefault();
	}

	function onKeyup(event: KeyboardEvent) {
		if (!game) return;
		const key = event.key.toLowerCase();
		if (key === 'arrowleft') game.input.left = false;
		else if (key === 'arrowright') game.input.right = false;
		else if ([' ', 'a', 'z', 'enter'].includes(key)) game.input.fire = false;
	}

	// Mouse and touch on the screen: the ship follows the pointer, pressing fires
	function onPointerMove(event: PointerEvent) {
		if (screen !== 'playing' || !game) return;
		if (event.pointerType === 'mouse' || event.buttons) game.input.pointerX = game.toGameX(event.clientX);
	}

	function onPointerDown(event: PointerEvent) {
		if (screen !== 'playing' || !game) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		game.input.pointerX = game.toGameX(event.clientX);
		game.input.fire = true;
	}

	function onPointerUp(event: PointerEvent) {
		if (!game) return;
		game.input.fire = false;
		if (event.pointerType !== 'mouse') game.input.pointerX = null;
	}

	function onPointerLeave(event: PointerEvent) {
		if (game && event.pointerType === 'mouse') game.input.pointerX = null;
	}

	/** Hold-to-press handlers for the on-console buttons */
	function hold(press: () => void, release?: () => void) {
		return {
			onpointerdown: (event: PointerEvent) => {
				event.preventDefault();
				press();
			},
			onpointerup: () => release?.(),
			onpointerleave: () => release?.(),
			onpointercancel: () => release?.()
		};
	}

	onMount(() => {
		best = readBest();
		touch = matchMedia('(pointer: coarse)').matches;
		const narrow = matchMedia('(max-width: 640px)');
		const updateColumns = () => (columns = narrow.matches ? 2 : 3);
		updateColumns();
		narrow.addEventListener('change', updateColumns);

		// Deep link from the Projects page straight into the game
		if (new URLSearchParams(window.location.search).has('play')) startGame();

		const onResize = () => game?.resize();
		const onVisibility = () => {
			if (document.hidden && screen === 'playing') togglePause();
		};
		window.addEventListener('resize', onResize);
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			game?.stop();
			clearTimeout(introTimer);
			window.removeEventListener('resize', onResize);
			document.removeEventListener('visibilitychange', onVisibility);
			narrow.removeEventListener('change', updateColumns);
		};
	});
</script>

<svelte:window onkeydown={onKeydown} onkeyup={onKeyup} />

<!-- Plain links for screen readers and anyone without JavaScript -->
<nav class="visually-hidden" aria-label="Site sections">
	<ul>
		{#each destinations as destination}
			<li><a href={destination.href}>{destination.label}</a></li>
		{/each}
	</ul>
</nav>

<div class="console">
	<div class="bezel">
		<div class="screen" class:warping>
			{#if screen === 'title'}
				<button class="title-screen" type="button" onclick={() => (screen = 'menu')} aria-label="Press start">
					<span class="wordmark">
						<PixelSprite {...sparkle} pixel={6} class="wordmark-icon" />
						<span>{info.name.split(' ')[0]}</span>
					</span>
					<span class="mascot">
						<PixelSprite {...rocket} pixel={7} />
					</span>
					<span class="role">{info.profession} · {info.company}</span>
					<span class="press-start">{touch ? 'Tap to start' : 'Click to start'}</span>
					<span class="hint">{touch ? 'Tap to choose' : 'Arrows + A&B  /  Mouse + Click'}</span>
				</button>
			{:else if screen === 'menu'}
				<div class="level-select">
					<nav class="planets" aria-label="Choose a destination">
						{#each destinations as destination, i}
							<a
								class="planet"
								class:selected={i === selected}
								href={destination.href}
								target={isExternal(destination.href) ? '_blank' : undefined}
								rel={isExternal(destination.href) ? 'noopener noreferrer' : undefined}
								onmouseenter={() => (selected = i)}
								onfocus={() => (selected = i)}
								onclick={(event) => {
									event.preventDefault();
									choose(i);
								}}
							>
								<span class="orb">
									<PixelPlanet palette={destination.palette} surface={destination.surface} seed={destination.seed} />
									<span class="label">{destination.label}</span>
									{#if i === selected}
										<span class="corner tl"></span>
										<span class="corner tr"></span>
										<span class="corner bl"></span>
										<span class="corner br"></span>
										<span class="pilot"><PixelSprite {...rocket} pixel={3} /></span>
									{/if}
								</span>
							</a>
						{/each}
					</nav>
					<button
						type="button"
						class="play-bar"
						class:selected={selected === PLAY}
						onmouseenter={() => (selected = PLAY)}
						onfocus={() => (selected = PLAY)}
						onclick={() => choose(PLAY)}
					>
						<span class="play-arrow">▶</span> Play Star Shooter
						{#if best > 0}<span class="play-best">Best {best}</span>{/if}
					</button>
				</div>
			{:else}
				<div
					class="playfield"
					role="application"
					aria-label="Star Shooter. Shoot asteroids for points; shoot a planet to travel to that page."
					onpointermove={onPointerMove}
					onpointerdown={onPointerDown}
					onpointerup={onPointerUp}
					onpointercancel={onPointerUp}
					onpointerleave={onPointerLeave}
				>
					<canvas bind:this={canvas}></canvas>
					<span class="planet-label" bind:this={planetLabel} hidden></span>

					<div class="hud" aria-live="polite">
						<span>Score {String(score).padStart(5, '0')}</span>
						<span class="lives" aria-label="{lives} lives left">
							{#each Array(Math.max(0, lives)) as _}
								<PixelSprite {...heart} pixel={2} />
							{/each}
						</span>
					</div>

					{#if showIntro && screen === 'playing'}
						<div class="banner">Shoot a planet to travel</div>
					{/if}

					{#if screen === 'prompt' && target}
						<div class="overlay">
							<span class="overlay-kicker">Planet reached</span>
							<span class="overlay-title">{target.label}</span>
							<div class="overlay-actions">
								<button type="button" class="overlay-btn primary" onclick={land}>
									<b>A</b> {isExternal(target.href) ? 'Open' : 'Land'}
								</button>
								<button type="button" class="overlay-btn" onclick={keepFlying}><b>B</b> Keep flying</button>
							</div>
						</div>
					{:else if screen === 'over'}
						<div class="overlay">
							<span class="overlay-title">Game over</span>
							<span class="overlay-kicker">Score {score} · Best {best}</span>
							<div class="overlay-actions">
								<button type="button" class="overlay-btn primary" onclick={startGame}><b>A</b> Play again</button>
								<button type="button" class="overlay-btn" onclick={openMenu}><b>B</b> Menu</button>
							</div>
						</div>
					{:else if screen === 'paused'}
						<div class="overlay">
							<span class="overlay-title">Paused</span>
							<div class="overlay-actions">
								<button type="button" class="overlay-btn primary" onclick={togglePause}><b>A</b> Resume</button>
								<button type="button" class="overlay-btn" onclick={openMenu}><b>B</b> Menu</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}
			<div class="scanlines" aria-hidden="true"></div>
		</div>
	</div>

	<!-- On-console controls mirror the keyboard, so they stay out of the tab order -->
	<div class="controls">
		<div class="dpad" role="group" aria-label="Direction pad">
			<button type="button" tabindex="-1" class="up" aria-label="Up" {...hold(() => setDirection('up', true))}><span>▲</span></button>
			<button type="button" tabindex="-1" class="left" aria-label="Left" {...hold(() => setDirection('left', true), () => setDirection('left', false))}><span>◀</span></button>
			<span class="hub" aria-hidden="true"></span>
			<button type="button" tabindex="-1" class="right" aria-label="Right" {...hold(() => setDirection('right', true), () => setDirection('right', false))}><span>▶</span></button>
			<button type="button" tabindex="-1" class="down" aria-label="Down" {...hold(() => setDirection('down', true))}><span>▼</span></button>
		</div>

		<div class="ab" role="group" aria-label="Action buttons">
			<button type="button" tabindex="-1" class="b" aria-label="B: back" {...hold(back)}>B</button>
			<button type="button" tabindex="-1" class="a" aria-label="A: fire / select" {...hold(() => setFire(true), () => setFire(false))}>A</button>
		</div>

		<div class="pills">
			<button type="button" tabindex="-1" aria-label="Select: back" {...hold(back)}>
				<span class="pill"></span>Select
			</button>
			<button type="button" tabindex="-1" aria-label="Start: start or pause" {...hold(() => (inGame && screen !== 'over' && screen !== 'prompt' ? togglePause() : confirm()))}>
				<span class="pill"></span>Start
			</button>
		</div>
	</div>
</div>

<style>
	.console {
		--shell: #d8d6d0;
		--shell-dark: #b9b6ae;
		width: min(100%, 760px);
		margin: 0 auto;
		padding: 22px 22px 34px;
		border-radius: 28px 28px 64px 28px;
		background:
			radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1.2px) 0 0 / 4px 4px,
			linear-gradient(180deg, #e4e2dc, var(--shell) 40%, #cfccc5);
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.7),
			inset 0 -6px 0 var(--shell-dark),
			0 30px 80px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(0, 0, 0, 0.35);
		user-select: none;
		-webkit-user-select: none;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.bezel {
		padding: 14px;
		border-radius: 18px;
		background: #121214;
		box-shadow: inset 0 0 0 2px #000, inset 0 6px 18px rgba(0, 0, 0, 0.8);
	}

	.screen {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: 12px;
		background: #000;
		transition: transform 0.45s ease-in, filter 0.45s ease-in;
	}

	/* Glossy reflection in the top-right corner */
	.screen::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(ellipse 55% 45% at 82% 6%, rgba(255, 255, 255, 0.16), transparent 70%);
	}

	.screen.warping {
		transform: scale(1.06);
		filter: brightness(3) blur(2px);
	}

	.scanlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 3px);
	}

	/* Title screen */
	.title-screen {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		border: none;
		background: transparent;
		color: #fff;
		cursor: pointer;
		font: inherit;
	}

	.wordmark {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.25em;
		font-family: var(--pixel-display);
		font-weight: 700;
		font-size: clamp(44px, 11vw, 104px);
		line-height: 1;
		letter-spacing: 0.01em;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.wordmark :global(.wordmark-icon) {
		width: 0.5em;
		height: 0.5em;
	}

	.mascot {
		margin-top: -14px;
		animation: bob 2.4s ease-in-out infinite;
	}

	.mascot :global(.px-O),
	.mascot :global(.px-Y) {
		animation: flicker 0.18s steps(2) infinite;
	}

	.role {
		margin-top: 6px;
		font-family: var(--pixel);
		font-size: clamp(10px, 1.8vw, 14px);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a99fff;
	}

	.press-start {
		margin-top: 18px;
		font-family: var(--pixel);
		font-weight: 700;
		font-size: clamp(16px, 3.4vw, 28px);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #fff;
		animation: blink 1.1s steps(1) infinite;
	}

	.hint {
		font-family: var(--pixel);
		font-size: clamp(9px, 1.6vw, 13px);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: pre;
		color: #d4d0e8;
	}

	/* Planet menu */
	.level-select {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		padding: 3% 3% 3.5%;
		animation: power-on 0.35s ease-out;
	}

	.planets {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}

	.planet {
		display: grid;
		place-items: center;
		min-width: 0;
		min-height: 0;
		color: #fff;
		outline: none;
	}

	.orb {
		position: relative;
		height: 76%;
		aspect-ratio: 1;
		max-width: 88%;
		transition: transform 0.2s ease;
	}

	.planet.selected .orb {
		transform: scale(1.05);
	}

	.label {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--pixel);
		font-weight: 700;
		font-size: clamp(10px, 2vw, 17px);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-shadow:
			2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000,
			2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
	}

	.corner {
		position: absolute;
		width: 22%;
		height: 22%;
		border: 0 solid #8f7dff;
		animation: pulse-corner 1s ease-in-out infinite;
	}

	.tl { top: -9%; left: -9%; border-top-width: 4px; border-left-width: 4px; }
	.tr { top: -9%; right: -9%; border-top-width: 4px; border-right-width: 4px; }
	.bl { bottom: -9%; left: -9%; border-bottom-width: 4px; border-left-width: 4px; }
	.br { bottom: -9%; right: -9%; border-bottom-width: 4px; border-right-width: 4px; }

	.pilot {
		position: absolute;
		left: 50%;
		bottom: -16%;
		transform: translateX(-50%);
		animation: bob 1.6s ease-in-out infinite;
	}

	.pilot :global(.px-O),
	.pilot :global(.px-Y) {
		animation: flicker 0.18s steps(2) infinite;
	}

	.play-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.7em;
		margin: 1% 4% 0;
		padding: 0.75em 1em;
		border: 3px solid #3423a8;
		border-radius: 4px;
		background: rgba(52, 35, 168, 0.25);
		color: #fff;
		font-family: var(--pixel);
		font-weight: 700;
		font-size: clamp(11px, 2.1vw, 18px);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		outline: none;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.play-bar.selected {
		border-color: #8f7dff;
		background: #7262ff;
		box-shadow: 0 0 24px rgba(114, 98, 255, 0.55);
	}

	.play-arrow {
		animation: blink 1.1s steps(1) infinite;
	}

	.play-bar:not(.selected) .play-arrow {
		animation: none;
	}

	.play-best {
		font-weight: 400;
		font-size: 0.75em;
		color: #d4d0e8;
	}

	@keyframes pulse-corner {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.55; }
	}

	/* Game */
	.playfield {
		position: absolute;
		inset: 0;
		touch-action: none;
		cursor: crosshair;
		animation: power-on 0.35s ease-out;
	}

	.playfield canvas {
		display: block;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
	}

	.planet-label {
		position: absolute;
		transform: translateX(-50%);
		font-family: var(--pixel);
		font-weight: 700;
		font-size: clamp(9px, 1.7vw, 14px);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fff;
		white-space: nowrap;
		pointer-events: none;
		text-shadow: 2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000;
	}

	.hud {
		position: absolute;
		top: 10px;
		left: 14px;
		right: 14px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--pixel);
		font-size: clamp(10px, 1.8vw, 14px);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fff;
		pointer-events: none;
	}

	.lives {
		display: flex;
		gap: 4px;
	}

	.banner {
		position: absolute;
		left: 50%;
		bottom: 22%;
		transform: translateX(-50%);
		font-family: var(--pixel);
		font-weight: 700;
		font-size: clamp(11px, 2.2vw, 18px);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #a99fff;
		white-space: nowrap;
		pointer-events: none;
		animation: blink 1.1s steps(1) infinite;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background: rgba(0, 0, 0, 0.6);
		font-family: var(--pixel);
		text-transform: uppercase;
		color: #fff;
		animation: power-on 0.2s ease-out;
	}

	.overlay-kicker {
		font-size: clamp(10px, 1.8vw, 14px);
		letter-spacing: 0.1em;
		color: #a99fff;
	}

	.overlay-title {
		font-family: var(--pixel-display);
		font-weight: 700;
		font-size: clamp(32px, 7vw, 64px);
		line-height: 1;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.overlay-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 12px;
	}

	.overlay-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border: 2px solid #fff;
		border-radius: 4px;
		background: transparent;
		color: #fff;
		font-family: var(--pixel);
		font-size: clamp(10px, 1.8vw, 14px);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.overlay-btn b {
		display: grid;
		place-items: center;
		width: 1.6em;
		height: 1.6em;
		border-radius: 50%;
		background: #fff;
		color: #000;
	}

	.overlay-btn.primary {
		border-color: #7262ff;
		background: #7262ff;
	}

	.overlay-btn:hover,
	.overlay-btn:focus-visible {
		outline: none;
		background: #fff;
		color: #000;
	}

	.overlay-btn:hover b,
	.overlay-btn:focus-visible b {
		background: #7262ff;
		color: #fff;
	}

	/* Hardware controls */
	.controls {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-areas:
			'dpad . ab'
			'pills pills pills';
		align-items: center;
		gap: 18px 12px;
		padding: 26px 18px 0;
	}

	.controls button {
		font: inherit;
		cursor: pointer;
		touch-action: none;
		-webkit-tap-highlight-color: transparent;
	}

	.dpad {
		grid-area: dpad;
		display: grid;
		grid-template-columns: repeat(3, 44px);
		grid-template-rows: repeat(3, 44px);
		padding: 14px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.06);
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.dpad button,
	.hub {
		background: #2b2a30;
		border: none;
		color: #4a4950;
		font-size: 13px;
		box-shadow: inset 0 -3px 0 #161519;
	}

	.dpad button:active {
		box-shadow: inset 0 2px 0 #161519;
		transform: translateY(1px);
	}

	.up { grid-area: 1 / 2; border-radius: 6px 6px 0 0; }
	.left { grid-area: 2 / 1; border-radius: 6px 0 0 6px; }
	.hub { grid-area: 2 / 2; }
	.right { grid-area: 2 / 3; border-radius: 0 6px 6px 0; }
	.down { grid-area: 3 / 2; border-radius: 0 0 6px 6px; }

	.ab {
		grid-area: ab;
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 14px 20px;
		border-radius: 60px;
		background: rgba(0, 0, 0, 0.06);
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
		transform: rotate(-24deg);
	}

	.ab button {
		width: 64px;
		height: 64px;
		border: none;
		border-radius: 50%;
		background: #2b2a30;
		color: #4a4950;
		font-family: var(--pixel);
		font-weight: 700;
		font-size: 20px;
		box-shadow: inset 0 -4px 0 #161519, 0 2px 4px rgba(0, 0, 0, 0.25);
		transform: rotate(24deg);
	}

	.ab .b {
		margin-top: 36px;
	}

	.ab button:active {
		box-shadow: inset 0 3px 0 #161519;
	}

	.pills {
		grid-area: pills;
		display: flex;
		justify-content: center;
		gap: 28px;
	}

	.pills button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border: none;
		background: none;
		font-family: var(--pixel);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #7d7a72;
	}

	.pill {
		width: 54px;
		height: 13px;
		border-radius: 10px;
		background: #4a4950;
		box-shadow: inset 0 -2px 0 #2b2a30;
		transform: rotate(-24deg);
	}

	.pills button:active .pill {
		box-shadow: inset 0 2px 0 #2b2a30;
	}

	@keyframes bob {
		0%, 100% { translate: 0 0; }
		50% { translate: 0 -6px; }
	}

	@keyframes blink {
		0%, 60% { opacity: 1; }
		61%, 100% { opacity: 0.15; }
	}

	@keyframes flicker {
		0% { opacity: 1; }
		100% { opacity: 0.35; }
	}

	@keyframes power-on {
		from { opacity: 0; transform: scaleY(0.04); }
		to { opacity: 1; transform: none; }
	}

	@media (max-width: 640px) {
		.console {
			padding: 14px 14px 26px;
			border-radius: 22px 22px 48px 22px;
		}

		.bezel {
			padding: 9px;
		}

		.screen {
			aspect-ratio: 4 / 5;
		}

		.planets {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 1fr);
		}

		.label {
			font-size: 11px;
		}

		.pilot {
			bottom: -24%;
			scale: 0.7;
		}

		.controls {
			padding: 20px 4px 0;
		}

		.dpad {
			grid-template-columns: repeat(3, 40px);
			grid-template-rows: repeat(3, 40px);
			padding: 10px;
		}

		.ab {
			gap: 10px;
			padding: 10px 14px;
		}

		.ab button {
			width: 56px;
			height: 56px;
			font-size: 16px;
		}

		.ab .b {
			margin-top: 28px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mascot,
		.press-start,
		.banner,
		.level-select,
		.corner,
		.pilot,
		.play-arrow,
		.playfield,
		.overlay,
		.console :global(.px-O),
		.console :global(.px-Y) {
			animation: none;
		}
	}
</style>
