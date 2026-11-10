<script lang="ts">
	import { educationJourney } from '$lib/profile';
	import contactData from '$lib/contact-data.json';
	import PixelSprite from '$lib/components/space/PixelSprite.svelte';
	import { rocket } from '$lib/components/space/sprites';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Screen from '$lib/components/ui/Screen.svelte';
	import SectionNav from '$lib/components/ui/SectionNav.svelte';

	// Career started in 2022 (Foretheta)
	const yearsInIndustry = new Date().getFullYear() - 2022;
	const last = educationJourney.length - 1;

	let current = $state(0);
	const stage = $derived(educationJourney[current]);

	const stats = [
		{ value: String(yearsInIndustry), label: 'Years in industry' },
		{ value: '5+', label: 'Interns mentored' },
		{ value: '100k+', label: 'AO3 hits' }
	];

	const notes = [
		{ title: 'Current focus', text: 'Leading development of scalable client-server architecture by ensuring timely delivery without compromising on software quality.' },
		{ title: 'Philosophy', text: 'Continuous learning, clean code, and user-centered development drive everything I do.' },
		{ title: 'Future goals', text: 'Expanding into AI/ML powered development and deployment to make solutions meant to last a lifetime.' }
	];

	const go = (index: number) => (current = Math.max(0, Math.min(last, index)));

	// Arrow keys move between levels, like the home console
	function onKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
		if (event.key === 'ArrowLeft') go(current - 1);
		else if (event.key === 'ArrowRight') go(current + 1);
		else return;
		event.preventDefault();
	}

	const sections = [
		{ id: 'levels', label: 'Journey' },
		{ id: 'full-picture', label: 'Full picture' },
		{ id: 'notes', label: 'Notes' }
	];
</script>

<svelte:head>
	<title>Resume | Shanzay Asad</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="px-shell">
	<SectionNav destination="Resume" {sections} />

<div class="px-page">
	<PageHeader destination="Resume" kicker="Career log" title="My journey">
		<p>From first lines of code to professional software development. Pick a level, or use the arrow keys.</p>
	</PageHeader>

	<section id="levels" aria-label="Journey">
		<nav class="levels" aria-label="Journey stages">
			{#each educationJourney as item, i}
				<button
					type="button"
					class="level px-select"
					class:selected={i === current}
					class:cleared={i < current}
					aria-current={i === current ? 'step' : undefined}
					onclick={() => go(i)}
				>
					<span class="px-label">Lv {String(i + 1).padStart(2, '0')}</span>
					<span class="level-title">{item.title}</span>
					<span class="level-period">{item.period}</span>
					{#if i === current}
						<span class="pilot" aria-hidden="true"><PixelSprite {...rocket} pixel={2} /></span>
					{/if}
				</button>
			{/each}
		</nav>

		<Screen glow power={false}>
			{#key current}
				<article class="stage">
					<span class="px-label">Lv {String(current + 1).padStart(2, '0')} · {stage.period}</span>
					<h2>{stage.title}</h2>
					<p class="institution">{stage.institution}</p>
					<p class="description">{stage.description}</p>

					<span class="px-label loot">Achievements</span>
					<ul class="achievements">
						{#each stage.achievements as achievement, i}
							<li style="animation-delay: {i * 0.08}s"><span class="bullet" aria-hidden="true">▶</span>{achievement}</li>
						{/each}
					</ul>
				</article>
			{/key}
		</Screen>

		<div class="controls">
			<button class="px-btn" type="button" onclick={() => go(current - 1)} disabled={current === 0}><b>B</b> Previous</button>

			<div class="progress" role="img" aria-label="Stage {current + 1} of {educationJourney.length}">
				<span class="px-label">Progress {current + 1}/{educationJourney.length}</span>
				<span class="segments">
					{#each educationJourney as _, i}
						<span class="segment" class:filled={i <= current}></span>
					{/each}
				</span>
			</div>

			<button class="px-btn primary" type="button" onclick={() => go(current + 1)} disabled={current === last}><b>A</b> Next</button>
		</div>
	</section>

	<section id="full-picture">
	<Screen glow>
		<div class="full-picture">
			<h2>Want the full picture?</h2>
			<p>My complete work history and recommendations live on LinkedIn. Or get in touch and I'll send my resume over.</p>
			<div class="actions">
				<a class="px-btn primary" href={contactData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><b>A</b> View on LinkedIn ↗</a>
				<a class="px-btn" href="/contact"><b>B</b> Get in touch</a>
			</div>
			<div class="hud">
				{#each stats as stat}
					<div class="hud-stat">
						<span class="hud-value">{stat.value}</span>
						<span class="px-label">{stat.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</Screen>
	</section>

	<section id="notes">
		<h2 class="px-section-title">Notes</h2>
		<div class="notes">
			{#each notes as note}
				<div class="note px-select">
					<span class="px-label">{note.title}</span>
					<p>{note.text}</p>
				</div>
			{/each}
		</div>
	</section>
</div>
</div>

<style>
	.levels {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.25rem;
		margin-bottom: 2.25rem;
	}

	.level {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
		padding: 1rem 1.1rem 1.1rem;
		background: rgba(0, 0, 0, 0.75);
		border: 2px solid #34344a;
		border-radius: 6px;
		color: #fff;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: border-color 0.15s ease, background 0.15s ease;
	}

	.level:hover {
		border-color: #5a4ae0;
	}

	.level.selected {
		border-color: #8f7dff;
		background: rgba(52, 35, 168, 0.25);
		box-shadow: 0 0 24px rgba(114, 98, 255, 0.35);
	}

	.level.cleared .px-label::after {
		content: ' ✓';
		color: #4fd1a5;
	}

	.level-title {
		font-family: var(--pixel-display);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.15;
	}

	.level-period {
		font-family: var(--pixel);
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.pilot {
		position: absolute;
		left: 50%;
		bottom: -18px;
		transform: translateX(-50%);
		animation: px-bob 1.6s ease-in-out infinite;
	}

	.stage {
		padding: 0.75rem 0.5rem;
		animation: px-power-on 0.3s ease-out;
	}

	.stage h2 {
		margin: 0.4rem 0 0.2rem;
		font-size: 2.2rem;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.institution {
		margin-bottom: 1rem;
		font-family: var(--pixel);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: #d4d0e8;
	}

	.description {
		font-size: 1.05rem;
		line-height: 1.75;
	}

	.loot {
		margin: 1.75rem 0 0.9rem;
	}

	.achievements {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		list-style: none;
	}

	.achievements li {
		display: flex;
		gap: 0.75rem;
		line-height: 1.6;
		color: var(--text-primary);
		opacity: 0;
		animation: appear 0.35s ease-out forwards;
	}

	.bullet {
		flex-shrink: 0;
		padding-top: 0.2rem;
		font-family: var(--pixel);
		font-size: 0.7rem;
		color: var(--violet);
	}

	.controls {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1.5rem;
		margin-top: 1.75rem;
	}

	.progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	/* Segmented bar, like a health bar */
	.segments {
		display: flex;
		gap: 6px;
		width: 100%;
		max-width: 320px;
		padding: 4px;
		border: 2px solid #5a4ae0;
		border-radius: 3px;
	}

	.segment {
		flex: 1;
		height: 12px;
		background: #17142b;
		transition: background 0.2s ease;
	}

	.segment.filled {
		background: var(--violet);
		box-shadow: 0 0 10px rgba(114, 98, 255, 0.6);
	}

	.full-picture {
		padding: 1rem 0.5rem;
		text-align: center;
	}

	.full-picture h2 {
		margin-bottom: 0.5rem;
		text-shadow: 0 0.06em 0 #3423a8;
	}

	.full-picture p {
		max-width: 560px;
		margin: 0 auto;
		line-height: 1.75;
	}

	.actions {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.hud {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem 3rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px dashed #4b3bd1;
	}

	.hud-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	/* Silkscreen at regular weight: Pixelify's 5 reads like an S/8, and bold Silkscreen fills in the 4 */
	.hud-value {
		font-family: var(--pixel);
		font-size: 2.1rem;
		font-weight: 400;
		line-height: 1;
		color: #fff;
		text-shadow: 0 0.08em 0 #3423a8;
	}

	.notes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.25rem;
	}

	.note {
		padding: 1.25rem 1.4rem;
		background: rgba(0, 0, 0, 0.75);
		border: 2px solid #34344a;
		border-radius: 6px;
		transition: border-color 0.15s ease;
	}

	.note:hover {
		border-color: #5a4ae0;
	}

	.note p {
		margin: 0.6rem 0 0;
		line-height: 1.65;
	}

	@keyframes appear {
		from { opacity: 0; transform: translateX(-12px); }
		to { opacity: 1; transform: none; }
	}

	@media (max-width: 760px) {
		.levels {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem 1rem;
		}

		.controls {
			grid-template-columns: 1fr 1fr;
		}

		.progress {
			grid-column: 1 / -1;
			grid-row: 1;
		}

		.controls .px-btn {
			justify-content: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pilot,
		.stage {
			animation: none;
		}

		.achievements li {
			opacity: 1;
			animation: none;
		}
	}
</style>
