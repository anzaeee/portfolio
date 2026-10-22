<script lang="ts">
	import contactData from '$lib/contact-data.json';
	import { educationJourney, skillGroups } from '$lib/profile';
	import PixelSprite from '$lib/components/space/PixelSprite.svelte';
	import { rocket } from '$lib/components/space/sprites';

	const info = contactData.personalInfo;

	const facts = [
		{ icon: '✍️', title: 'Published writer', text: 'My fiction on AO3 has passed 100,000 hits and kudos.' },
		{ icon: '🎤', title: 'Debater', text: 'Three honorable mentions in school debate.' },
		{ icon: '🏆', title: 'GDSC Tech Idea', text: 'Top 10 finalist, finished in the top 5.' },
		{ icon: '🔀', title: 'Changed course', text: 'Started on a pre-medical track before switching to engineering.' },
		{ icon: '🐝', title: 'Spelling Bee', text: 'Competed back in my O Level days.' }
	];
</script>

<svelte:head>
	<title>About | Shanzay Asad</title>
</svelte:head>

<div class="about-page">
	<section class="hero">
		<div class="hero-text">
			<h1>About Me</h1>
			<p class="role">{info.profession} · {info.company}</p>
			<p>
				I lead QA delivery at {info.company}, where we're building Voice AI solutions meant to scale.
			</p>
			<p>
				I studied computer science at FAST-NUCES and have worked across operations, engineering and
				product: automating workflows and hiring at Foretheta, and advocating for accessible design at AIO.
				I built an end-to-end testing framework on Playwright from the core, and I've mentored 5+ interns in
				product management, Figma and rapid prototyping.
			</p>
			<p>Outside of work I write. My fiction on AO3 has passed 100,000 hits.</p>
		</div>
		<div class="avatar" aria-hidden="true">
			<PixelSprite {...rocket} pixel={8} />
		</div>
	</section>

	<section>
		<h2>Skills</h2>
		<div class="skills">
			{#each skillGroups as group}
				<div class="skill-group">
					<h3>{group.category}</h3>
					<ul>
						{#each group.skills as skill}
							<li>{skill}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Journey</h2>
		<ol class="timeline">
			{#each [...educationJourney].reverse() as stage}
				<li>
					<span class="period">{stage.period}</span>
					<div class="stage">
						<h3>{stage.icon} {stage.title}</h3>
						<p class="institution">{stage.institution}</p>
						<p>{stage.achievements[0]}</p>
					</div>
				</li>
			{/each}
		</ol>
		<a class="more" href="/resume">See the full journey →</a>
	</section>

	<section>
		<h2>Beyond work</h2>
		<div class="facts">
			{#each facts as fact}
				<div class="fact">
					<span class="fact-icon">{fact.icon}</span>
					<h3>{fact.title}</h3>
					<p>{fact.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="cta">
		<h2>Let's talk</h2>
		<p>Happy to chat about QA, Voice AI, roles or side projects.</p>
		<div class="cta-buttons">
			<a href="/contact" class="btn">Get in touch</a>
			<a href="/resume" class="btn btn-outline">View resume</a>
		</div>
	</section>
</div>

<style>
	.about-page {
		display: flex;
		flex-direction: column;
		gap: 4.5rem;
		max-width: 1040px;
		margin: 0 auto;
		padding: 2.5rem 2rem 3rem;
	}

	section h2 {
		margin-bottom: 1.5rem;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 3rem;
	}

	.hero-text p {
		max-width: 640px;
		font-size: 1.05rem;
		line-height: 1.75;
	}

	.hero-text .role {
		margin: -0.25rem 0 1.5rem;
		font-family: var(--pixel);
		font-size: 0.9rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-cyan);
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 220px;
		height: 220px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #3423a8, #120c3a 70%);
		box-shadow: 0 0 0 8px rgba(114, 98, 255, 0.15), 0 0 60px rgba(114, 98, 255, 0.35);
		animation: float 3s ease-in-out infinite;
	}

	.skills {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.skill-group,
	.fact,
	.stage {
		padding: 1.25rem 1.4rem;
		background: rgba(16, 16, 22, 0.88);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		backdrop-filter: blur(6px);
	}

	.skill-group h3 {
		margin-bottom: 0.9rem;
		font-family: var(--pixel);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.skill-group ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
	}

	.skill-group li {
		padding: 0.3rem 0.75rem;
		border: 1px solid #2f2a55;
		border-radius: 999px;
		background: #17142b;
		font-size: 0.88rem;
		color: var(--text-primary);
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		list-style: none;
		border-left: 2px dashed #3423a8;
		padding-left: 1.5rem;
	}

	.timeline li {
		display: grid;
		grid-template-columns: 120px minmax(0, 1fr);
		gap: 1.25rem;
		align-items: start;
	}

	.period {
		padding-top: 1.3rem;
		font-family: var(--pixel);
		font-size: 0.8rem;
		color: var(--accent-cyan);
	}

	.stage h3 {
		margin-bottom: 0.2rem;
		font-size: 1.1rem;
		color: #fff;
	}

	.stage p {
		margin: 0;
		font-size: 0.95rem;
	}

	.stage .institution {
		margin-bottom: 0.5rem;
		color: var(--accent-cyan);
	}

	.more {
		display: inline-block;
		margin-top: 1.25rem;
		font-weight: 500;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 1rem;
	}

	.fact-icon {
		font-size: 1.6rem;
	}

	.fact h3 {
		margin: 0.6rem 0 0.3rem;
		font-size: 1rem;
		color: #fff;
	}

	.fact p {
		margin: 0;
		font-size: 0.9rem;
	}

	.cta {
		padding: 2.5rem;
		text-align: center;
		background: rgba(16, 16, 22, 0.88);
		border: 1px solid var(--border-color);
		border-radius: 16px;
	}

	.cta h2 {
		margin-bottom: 0.75rem;
	}

	.cta-buttons {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	@media (max-width: 760px) {
		.about-page {
			gap: 3.5rem;
			padding: 1.5rem 1rem 2rem;
		}

		.hero {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.avatar {
			order: -1;
			width: 150px;
			height: 150px;
		}

		.avatar :global(svg) {
			width: 70px;
			height: auto;
		}

		.timeline li {
			grid-template-columns: 1fr;
			gap: 0.4rem;
		}

		.period {
			padding-top: 0;
		}

		.cta {
			padding: 1.75rem 1.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.avatar {
			animation: none;
		}
	}
</style>
