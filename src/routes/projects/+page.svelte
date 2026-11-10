<script lang="ts">
	import PixelPlanet from '$lib/components/space/PixelPlanet.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Screen from '$lib/components/ui/Screen.svelte';
	import SectionNav from '$lib/components/ui/SectionNav.svelte';
	import type { Surface } from '$lib/components/space/pixel';

	const projects: {
		id: string;
		short: string;
		title: string;
		tag: string;
		description: string;
		link?: { href: string; label: string };
		world: { palette: string[]; surface: Surface; seed: number };
	}[] = [
		{
			id: 'star-shooter',
			short: 'Star Shooter',
			title: 'Star Shooter',
			tag: 'Game',
			description:
				'The pixel-art space shooter on the home console. Blast asteroids for points, or shoot a planet to travel around the site.',
			link: { href: '/?play', label: 'Play it' },
			world: { palette: ['#2a0a18', '#6b1a3a', '#b8365e', '#ff6b8f', '#ffc4d3'], surface: 'craters', seed: 41 }
		},
		{
			id: 'portfolio',
			short: 'This portfolio',
			title: 'This portfolio',
			tag: 'Website',
			description:
				'Built with SvelteKit. The starfield, planets and sprites are drawn in code with noise and dithering, no image files.',
			link: { href: 'https://github.com/anzaeee/portfolio', label: 'View source' },
			world: { palette: ['#0c0840', '#2a1aa0', '#4b32e0', '#7a62ff', '#b9a8ff'], surface: 'bands', seed: 8 }
		},
		{
			id: 'testing-framework',
			short: 'Testing framework',
			title: 'End-to-end testing framework',
			tag: 'Work',
			description: 'An end-to-end testing framework built on Playwright from the core, as QA Delivery Manager.',
			world: { palette: ['#061f1a', '#0f4d3f', '#1f8a6f', '#4fd1a5', '#bff5e1'], surface: 'bands', seed: 17 }
		},
		{
			id: 'final-year-project',
			short: 'Final year project',
			title: 'Final year project',
			tag: 'University',
			description: 'Natural language processing and digital image processing, for my BS in Computer Science at FAST-NUCES.',
			world: { palette: ['#2a1a05', '#6b4310', '#b8781e', '#f0b44f', '#ffe7b8'], surface: 'craters', seed: 29 }
		}
	];

	const isExternal = (href: string) => href.startsWith('http');

	const sections = projects.map((p) => ({ id: p.id, label: p.short }));
</script>

<svelte:head>
	<title>Projects | Shanzay Asad</title>
</svelte:head>

<div class="px-shell">
	<SectionNav destination="Projects" {sections} />

<div class="px-page">
	<PageHeader destination="Projects" title="Projects">
		<p>Things I've built, at work, at university and for fun.</p>
	</PageHeader>

	<div class="grid">
		{#each projects as project, i}
			<article class="cartridge px-select" id={project.id}>
				<Screen power={false}>
					<div class="top">
						<span class="world" aria-hidden="true">
							<PixelPlanet palette={project.world.palette} surface={project.world.surface} seed={project.world.seed} resolution={40} />
						</span>
						<div class="meta">
							<span class="px-label">Level {String(i + 1).padStart(2, '0')}</span>
							<span class="px-chip">{project.tag}</span>
						</div>
					</div>
					<h2>{project.title}</h2>
					<p>{project.description}</p>
					{#if project.link}
						<a
							class="px-btn primary link"
							href={project.link.href}
							target={isExternal(project.link.href) ? '_blank' : undefined}
							rel={isExternal(project.link.href) ? 'noopener noreferrer' : undefined}
						>
							<b>A</b> {project.link.label} {isExternal(project.link.href) ? '↗' : ''}
						</a>
					{:else}
						<span class="px-label locked">Not public</span>
					{/if}
				</Screen>
			</article>
		{/each}
	</div>
</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.75rem;
	}

	.cartridge :global(.crt) {
		display: flex;
		flex-direction: column;
	}

	.top {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.1rem;
	}

	.world {
		width: 56px;
		height: 56px;
		flex-shrink: 0;
	}

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.4rem;
	}

	.cartridge h2 {
		margin-bottom: 0.6rem;
		font-size: 1.5rem;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.cartridge p {
		flex: 1;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
	}

	.link {
		align-self: flex-start;
		margin-top: 1.4rem;
	}

	.locked {
		margin-top: 1.4rem;
		color: var(--text-muted);
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
