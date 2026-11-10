<script lang="ts">
	import contactData from '$lib/contact-data.json';
	import { educationJourney, skillGroups } from '$lib/profile';
	import PixelSprite from '$lib/components/space/PixelSprite.svelte';
	import { rocket, star } from '$lib/components/space/sprites';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Screen from '$lib/components/ui/Screen.svelte';
	import SectionNav from '$lib/components/ui/SectionNav.svelte';

	const info = contactData.personalInfo;

	const facts = [
		{ title: 'Published writer', text: 'My fiction on AO3 has passed 100,000 hits and kudos.' },
		{ title: 'Debater', text: 'Three honorable mentions in school debate.' },
		{ title: 'GDSC Tech Idea', text: 'Top 10 finalist, finished in the top 5.' },
		{ title: 'Changed course', text: 'Started on a pre-medical track before switching to engineering.' },
		{ title: 'Spelling Bee', text: 'Competed back in my O Level days.' }
	];

	const sections = [
		{ id: 'intro', label: 'Intro' },
		{ id: 'inventory', label: 'Inventory' },
		{ id: 'journey', label: 'Journey' },
		{ id: 'achievements', label: 'Achievements' },
		{ id: 'talk', label: "Let's talk" }
	];
</script>

<svelte:head>
	<title>About | Shanzay Asad</title>
</svelte:head>

<div class="px-shell">
	<SectionNav destination="About" {sections} />

<div class="px-page">
	<PageHeader destination="About" title="About me">
		<p class="px-label role">{info.profession} · {info.company}</p>
	</PageHeader>

	<section class="hero" id="intro">
		<div class="hero-text">
			<p>I lead QA delivery at {info.company}, where we're building Voice AI solutions meant to scale.</p>
			<p>
				I studied computer science at FAST-NUCES and have worked across operations, engineering and
				product: automating workflows and hiring at Foretheta, and advocating for accessible design at AIO.
				I built an end-to-end testing framework on Playwright from the core, and I've mentored 5+ interns in
				product management, Figma and rapid prototyping.
			</p>
			<p>Outside of work I write. My fiction on AO3 has passed 100,000 hits.</p>
		</div>

		<Screen glow class="player">
			<div class="player-card">
				<span class="px-label">Player 1</span>
				<span class="mascot"><PixelSprite {...rocket} pixel={6} /></span>
				<span class="player-name">{info.name.split(' ')[0]}</span>
				<span class="px-label stat">Class · QA</span>
				<span class="px-label stat">Base · {info.location.split(',')[0]}</span>
			</div>
		</Screen>
	</section>

	<section id="inventory">
		<h2 class="px-section-title">Inventory</h2>
		<div class="skills">
			{#each skillGroups as group}
				<Screen power={false}>
					<span class="px-label group-title">{group.category}</span>
					<ul class="chips">
						{#each group.skills as skill}
							<li class="px-chip">{skill}</li>
						{/each}
					</ul>
				</Screen>
			{/each}
		</div>
	</section>

	<section id="journey">
		<h2 class="px-section-title">Journey</h2>
		<ol class="timeline">
			{#each [...educationJourney].reverse() as stage, i}
				<li>
					<span class="node" class:now={i === 0} aria-hidden="true"></span>
					<div class="stage px-select">
						<span class="px-label">{stage.period}</span>
						<h3>{stage.title}</h3>
						<p class="institution">{stage.institution}</p>
						<p>{stage.achievements[0]}</p>
					</div>
				</li>
			{/each}
		</ol>
		<a class="px-btn more" href="/resume"><b>A</b> Full journey</a>
	</section>

	<section id="achievements">
		<h2 class="px-section-title">Achievements unlocked</h2>
		<div class="facts">
			{#each facts as fact}
				<div class="fact px-select">
					<PixelSprite {...star} pixel={3} />
					<span class="px-label unlocked">Unlocked</span>
					<h3>{fact.title}</h3>
					<p>{fact.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<section id="talk">
	<Screen glow class="cta-screen">
		<div class="cta">
			<h2>Let's talk</h2>
			<p>Happy to chat about QA, Voice AI, roles or side projects.</p>
			<div class="actions">
				<a href="/contact" class="px-btn primary"><b>A</b> Get in touch</a>
				<a href="/resume" class="px-btn"><b>B</b> View resume</a>
			</div>
		</div>
	</Screen>
	</section>
</div>
</div>

<style>
	.role {
		font-size: 0.9rem;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		align-items: start;
		gap: 3rem;
	}

	.hero-text p {
		max-width: 640px;
		font-size: 1.05rem;
		line-height: 1.75;
	}

	.player-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-align: center;
	}

	.mascot {
		margin: 0.75rem 0 0.25rem;
		animation: px-bob 2.4s ease-in-out infinite;
	}

	.player-name {
		font-family: var(--pixel-display);
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.1;
		color: #fff;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.stat {
		color: #d4d0e8;
	}

	.skills {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.25rem;
	}

	.group-title {
		margin-bottom: 0.9rem;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
	}

	.timeline {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		list-style: none;
		padding-left: 2.25rem;
	}

	.timeline::before {
		content: '';
		position: absolute;
		top: 0.5rem;
		bottom: 0.5rem;
		left: 7px;
		border-left: 2px dashed #4b3bd1;
	}

	.timeline li {
		position: relative;
	}

	/* Square pixel node on the line */
	.node {
		position: absolute;
		top: 1.35rem;
		left: calc(-2.25rem + 1px);
		width: 14px;
		height: 14px;
		background: #3423a8;
		box-shadow: 0 0 0 3px #050508;
	}

	.node.now {
		background: var(--violet);
		box-shadow: 0 0 0 3px #050508, 0 0 16px rgba(114, 98, 255, 0.8);
	}

	.stage,
	.fact {
		padding: 1.25rem 1.4rem;
		background: rgba(0, 0, 0, 0.75);
		border: 2px solid #34344a;
		border-radius: 6px;
		transition: border-color 0.15s ease;
	}

	.stage:hover,
	.fact:hover {
		border-color: #5a4ae0;
	}

	.stage h3 {
		margin: 0.4rem 0 0.2rem;
		font-family: var(--pixel-display);
		font-size: 1.35rem;
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
		margin-top: 1.75rem;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1.25rem;
	}

	.unlocked {
		margin-top: 0.75rem;
		font-size: 0.65rem;
		color: #ffd25e;
	}

	.fact h3 {
		margin: 0.3rem 0 0.3rem;
		font-size: 1rem;
		color: #fff;
	}

	.fact p {
		margin: 0;
		font-size: 0.9rem;
	}

	.cta {
		padding: 1rem 0.5rem;
		text-align: center;
	}

	.cta h2 {
		margin-bottom: 0.5rem;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.actions {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	@media (max-width: 960px) {
		.facts {
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		}
	}

	@media (max-width: 760px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mascot {
			animation: none;
		}
	}
</style>
