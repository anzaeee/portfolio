<script lang="ts">
	import contactData from '$lib/contact-data.json';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Screen from '$lib/components/ui/Screen.svelte';
	import SectionNav from '$lib/components/ui/SectionNav.svelte';

	const info = contactData.personalInfo;
	const links = contactData.socialLinks;

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(info.email);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			window.location.href = `mailto:${info.email}`;
		}
	}

	const sections = [
		{ id: 'email', label: 'Email' },
		{ id: 'channels', label: 'Channels' }
	];
</script>

<svelte:head>
	<title>Contact | Shanzay Asad</title>
</svelte:head>

<div class="px-shell">
	<SectionNav destination="Contact" {sections} />

<div class="px-page contact">
	<PageHeader destination="Contact" kicker="Open channel" title="Contact">
		<p>Happy to talk about QA, Voice AI, roles or side projects. Email is the fastest way to reach me.</p>
	</PageHeader>

	<section id="email">
	<Screen glow>
		<div class="email-screen">
			<span class="px-label"><span class="signal" aria-hidden="true"></span> Email</span>
			<a class="email" href="mailto:{info.email}">{info.email}</a>
			<div class="actions">
				<a class="px-btn primary" href="mailto:{info.email}"><b>A</b> Send an email</a>
				<button class="px-btn" type="button" onclick={copyEmail}>
					<b>B</b> {copied ? 'Copied ✓' : 'Copy address'}
				</button>
			</div>
		</div>
	</Screen>
	</section>

	<div class="channels" id="channels">
		<a class="channel px-select" href={links.linkedin} target="_blank" rel="noopener noreferrer">
			<span class="px-label">LinkedIn</span>
			<span class="value">{info.linkedin}</span>
			<span class="arrow" aria-hidden="true">↗</span>
		</a>
		<a class="channel px-select" href={links.github} target="_blank" rel="noopener noreferrer">
			<span class="px-label">GitHub</span>
			<span class="value">{info.github}</span>
			<span class="arrow" aria-hidden="true">↗</span>
		</a>
		<div class="channel">
			<span class="px-label">Based in</span>
			<span class="value">{info.location}</span>
		</div>
	</div>
</div>
</div>

<style>
	.contact {
		max-width: 820px;
		gap: 3rem;
	}

	.email-screen {
		padding: 0.75rem 0.5rem;
	}

	/* Blinking "on air" pixel */
	.signal {
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-right: 0.35rem;
		background: #4fd1a5;
		box-shadow: 0 0 8px #4fd1a5;
		vertical-align: 1px;
		animation: px-blink 1.1s steps(1) infinite;
	}

	.email {
		display: block;
		margin: 0.6rem 0 1.6rem;
		font-family: var(--pixel-display);
		font-size: clamp(1.4rem, 4.8vw, 2.3rem);
		font-weight: 700;
		color: #fff;
		text-shadow: 0 0.06em 0 #3423a8;
		word-break: break-all;
	}

	.email:hover {
		color: var(--accent-cyan);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.channels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 1.25rem;
	}

	.channel {
		display: block;
		padding: 1.25rem 1.4rem;
		background: rgba(0, 0, 0, 0.75);
		border: 2px solid #34344a;
		border-radius: 6px;
		color: var(--text-primary);
		transition: border-color 0.15s ease;
	}

	a.channel:hover {
		color: var(--text-primary);
		border-color: #5a4ae0;
	}

	.value {
		display: block;
		margin-top: 0.5rem;
		font-weight: 500;
	}

	.arrow {
		position: absolute;
		top: 1.1rem;
		right: 1.2rem;
		font-family: var(--pixel);
		color: var(--accent-cyan);
	}

	@media (prefers-reduced-motion: reduce) {
		.signal {
			animation: none;
		}
	}
</style>
