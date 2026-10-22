<script lang="ts">
	import contactData from '$lib/contact-data.json';

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
</script>

<svelte:head>
	<title>Contact | Shanzay Asad</title>
</svelte:head>

<div class="contact-page">
	<header>
		<h1>Contact</h1>
		<p>Happy to talk about QA, Voice AI, roles or side projects. Email is the fastest way to reach me.</p>
	</header>

	<div class="email-card">
		<span class="label">Email</span>
		<a class="email" href="mailto:{info.email}">{info.email}</a>
		<div class="actions">
			<a class="btn" href="mailto:{info.email}">✉️ Send an email</a>
			<button class="btn btn-outline" type="button" onclick={copyEmail}>
				{copied ? '✓ Copied' : '📋 Copy address'}
			</button>
		</div>
	</div>

	<div class="channels">
		<a class="channel" href={links.linkedin} target="_blank" rel="noopener noreferrer">
			<span class="label">LinkedIn</span>
			<span class="value">{info.linkedin}</span>
			<span class="arrow" aria-hidden="true">↗</span>
		</a>
		<a class="channel" href={links.github} target="_blank" rel="noopener noreferrer">
			<span class="label">GitHub</span>
			<span class="value">{info.github}</span>
			<span class="arrow" aria-hidden="true">↗</span>
		</a>
		<div class="channel">
			<span class="label">Based in</span>
			<span class="value">{info.location}</span>
		</div>
	</div>
</div>

<style>
	.contact-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	header p {
		margin-top: 1rem;
		font-size: 1.05rem;
	}

	.email-card,
	.channel {
		background: rgba(16, 16, 22, 0.88);
		border: 1px solid var(--border-color);
		border-radius: 14px;
		backdrop-filter: blur(6px);
	}

	.email-card {
		margin: 2.5rem 0 1rem;
		padding: 2rem;
		border-color: #3423a8;
		box-shadow: 0 0 50px rgba(114, 98, 255, 0.15);
	}

	.label {
		display: block;
		font-family: var(--pixel);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.email {
		display: block;
		margin: 0.5rem 0 1.5rem;
		font-family: var(--pixel-display);
		font-size: clamp(1.3rem, 4.5vw, 2rem);
		font-weight: 700;
		color: #fff;
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
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.channel {
		position: relative;
		display: block;
		padding: 1.25rem 1.4rem;
		color: var(--text-primary);
		transition: border-color 0.15s ease, transform 0.15s ease;
	}

	a.channel:hover {
		color: var(--text-primary);
		border-color: var(--accent-purple);
		transform: translateY(-2px);
	}

	.value {
		display: block;
		margin-top: 0.4rem;
		font-weight: 500;
	}

	.arrow {
		position: absolute;
		top: 1.1rem;
		right: 1.2rem;
		color: var(--accent-cyan);
	}

	@media (max-width: 600px) {
		.contact-page {
			padding: 1.5rem 1rem 2rem;
		}

		.email-card {
			padding: 1.5rem;
		}
	}
</style>
