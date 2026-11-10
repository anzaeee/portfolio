<script lang="ts">
	import { onMount } from 'svelte';
	import PixelPlanet from '$lib/components/space/PixelPlanet.svelte';
	import { planet } from '$lib/destinations';

	/**
	 * "Sector map" for the sections of an inner page. A sticky sidebar on wide screens and a sticky strip of
	 * pixel tabs on narrow ones; the section in view is marked like the selected item on the home console.
	 */
	let {
		destination,
		sections
	}: {
		/** The page's planet label on the home console, e.g. "About" */
		destination: string;
		sections: { id: string; label: string }[];
	} = $props();

	const world = $derived(planet(destination));
	let active = $state(sections[0]?.id ?? '');
	let panel: HTMLElement | undefined = $state();

	// On the narrow strip, keep the active tab in view (scrolls the strip only, never the page)
	$effect(() => {
		const link = panel?.querySelector<HTMLElement>(`a[href="#${active}"]`);
		if (!panel || !link || panel.scrollWidth <= panel.clientWidth) return;
		const left = link.offsetLeft - panel.clientWidth / 2 + link.offsetWidth / 2;
		panel.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
	});

	onMount(() => {
		const elements = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
		const visible = new Set<string>();

		const pick = () => {
			// At the very bottom the last section wins, even if it's too short to reach the trigger line
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
				active = sections[sections.length - 1].id;
				return;
			}
			const first = sections.find((s) => visible.has(s.id));
			if (first) active = first.id;
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}
				pick();
			},
			{ rootMargin: '-120px 0px -55% 0px' }
		);
		elements.forEach((el) => observer.observe(el));
		window.addEventListener('scroll', pick, { passive: true });
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', pick);
		};
	});
</script>

<aside class="sector-nav" aria-label="On this page">
	<div class="panel" bind:this={panel}>
		<div class="head">
			<span class="world" aria-hidden="true">
				<PixelPlanet palette={world.palette} surface={world.surface} seed={world.seed} resolution={32} />
			</span>
			<span class="names">
				<span class="px-label">Sector map</span>
				<span class="page-name">{destination}</span>
			</span>
		</div>

		<ul>
			{#each sections as section}
				<li>
					<a
						href="#{section.id}"
						class:active={active === section.id}
						aria-current={active === section.id ? 'location' : undefined}
						onclick={() => (active = section.id)}
					>
						<span class="marker" aria-hidden="true">▶</span>{section.label}
					</a>
				</li>
			{/each}
		</ul>

		<a class="home" href="/"><b aria-hidden="true">B</b> Console</a>
	</div>
</aside>

<style>
	.sector-nav {
		position: sticky;
		top: 96px;
		align-self: start;
	}

	.panel {
		padding: 1rem;
		border: 2px solid #34344a;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.82);
		backdrop-filter: blur(6px);
	}

	.head {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding-bottom: 0.85rem;
		margin-bottom: 0.6rem;
		border-bottom: 2px dashed #4b3bd1;
	}

	.world {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
	}

	.names {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.page-name {
		font-family: var(--pixel-display);
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.1;
		color: #fff;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		list-style: none;
	}

	ul a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.6rem;
		border-left: 3px solid transparent;
		border-radius: 0 3px 3px 0;
		font-family: var(--pixel);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #d6d6e0;
		transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}

	.marker {
		font-size: 0.6rem;
		color: var(--violet);
		opacity: 0;
	}

	ul a:hover,
	ul a:focus-visible {
		outline: none;
		background: #17142b;
		color: #fff;
	}

	ul a:hover .marker,
	ul a:focus-visible .marker {
		opacity: 0.7;
	}

	ul a.active {
		border-left-color: #8f7dff;
		background: rgba(114, 98, 255, 0.22);
		color: #fff;
	}

	ul a.active .marker {
		opacity: 1;
		color: #b8b0ff;
		animation: px-blink 1.1s steps(1) infinite;
	}

	.home {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.85rem;
		padding-top: 0.85rem;
		border-top: 2px dashed #4b3bd1;
		font-family: var(--pixel);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #d6d6e0;
	}

	.home b {
		display: grid;
		place-items: center;
		width: 1.7em;
		height: 1.7em;
		border-radius: 50%;
		background: #fff;
		color: #000;
	}

	.home:hover {
		color: #fff;
	}

	.home:hover b {
		background: var(--violet);
		color: #fff;
	}

	/* Narrow screens: a sticky strip of pixel tabs under the navbar */
	@media (max-width: 1100px) {
		.sector-nav {
			top: 72px;
			z-index: 50;
			margin: 0 -2rem;
		}

		.panel {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			padding: 0.55rem 2rem;
			border: none;
			border-bottom: 2px solid #34344a;
			border-radius: 0;
			background: rgba(8, 8, 10, 0.94);
			overflow-x: auto;
			scrollbar-width: none;
		}

		.panel::-webkit-scrollbar {
			display: none;
		}

		.head {
			padding: 0;
			margin: 0;
			border: none;
		}

		.names,
		.home {
			display: none;
		}

		.world {
			width: 24px;
			height: 24px;
		}

		ul {
			flex-direction: row;
			gap: 0.4rem;
		}

		ul a {
			white-space: nowrap;
			padding: 0.4rem 0.65rem;
			border: 2px solid #34344a;
			border-radius: 3px;
			font-size: 0.72rem;
		}

		ul a.active {
			border-color: #8f7dff;
			background: var(--violet);
		}

		.marker {
			display: none;
		}
	}

	/* Match the navbar height and the page padding at each breakpoint */
	@media (max-width: 900px) {
		.sector-nav {
			top: 64px;
		}
	}

	@media (max-width: 760px) {
		.sector-nav {
			margin: 0 -1rem;
		}

		.panel {
			padding: 0.55rem 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		ul a.active .marker {
			animation: none;
		}
	}
</style>
