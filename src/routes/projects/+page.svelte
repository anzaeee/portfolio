<script lang="ts">
	const projects = [
		{
			icon: '🚀',
			title: 'Star Shooter',
			tag: 'Game',
			description:
				'The pixel-art space shooter on the home console. Blast asteroids for points, or shoot a planet to travel around the site.',
			link: { href: '/?play', label: 'Play it' }
		},
		{
			icon: '🪐',
			title: 'This portfolio',
			tag: 'Website',
			description:
				'Built with SvelteKit. The starfield, planets and sprites are drawn in code with noise and dithering, no image files.',
			link: { href: 'https://github.com/anzaeee/portfolio', label: 'View source' }
		},
		{
			icon: '🧪',
			title: 'End-to-end testing framework',
			tag: 'Work',
			description: 'An end-to-end testing framework built on Playwright from the core, as QA Delivery Manager.'
		},
		{
			icon: '🧠',
			title: 'Final year project',
			tag: 'University',
			description: 'Natural language processing and digital image processing, for my BS in Computer Science at FAST-NUCES.'
		}
	];

	const isExternal = (href: string) => href.startsWith('http');
</script>

<svelte:head>
	<title>Projects | Shanzay Asad</title>
</svelte:head>

<div class="projects-page">
	<header>
		<h1>Projects</h1>
		<p>Things I've built, at work, at university and for fun.</p>
	</header>

	<div class="grid">
		{#each projects as project}
			<article class="project">
				<div class="top">
					<span class="icon">{project.icon}</span>
					<span class="tag">{project.tag}</span>
				</div>
				<h2>{project.title}</h2>
				<p>{project.description}</p>
				{#if project.link}
					<a
						class="link"
						href={project.link.href}
						target={isExternal(project.link.href) ? '_blank' : undefined}
						rel={isExternal(project.link.href) ? 'noopener noreferrer' : undefined}
					>
						{project.link.label} {isExternal(project.link.href) ? '↗' : '→'}
					</a>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	.projects-page {
		max-width: 1040px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	header p {
		margin-top: 1rem;
		font-size: 1.05rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.25rem;
		margin-top: 2.5rem;
	}

	.project {
		display: flex;
		flex-direction: column;
		padding: 1.6rem;
		background: rgba(16, 16, 22, 0.88);
		border: 1px solid var(--border-color);
		border-radius: 14px;
		backdrop-filter: blur(6px);
		transition: border-color 0.15s ease, transform 0.15s ease;
	}

	.project:hover {
		border-color: var(--accent-purple);
		transform: translateY(-2px);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.icon {
		font-size: 1.8rem;
	}

	.tag {
		padding: 0.2rem 0.6rem;
		border: 1px solid #2f2a55;
		border-radius: 999px;
		background: #17142b;
		font-family: var(--pixel);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-cyan);
	}

	.project h2 {
		margin-bottom: 0.6rem;
		font-size: 1.4rem;
	}

	.project p {
		flex: 1;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
	}

	.link {
		margin-top: 1.25rem;
		font-weight: 500;
	}

	@media (max-width: 600px) {
		.projects-page {
			padding: 1.5rem 1rem 2rem;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
