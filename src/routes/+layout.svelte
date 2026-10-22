<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import contactData from '$lib/contact-data.json';
	import SpaceBackground from '$lib/components/space/SpaceBackground.svelte';
	import PixelSprite from '$lib/components/space/PixelSprite.svelte';
	import { sparkle } from '$lib/components/space/sprites';

	let { children } = $props();

	const links = contactData.socialLinks;

	const navItems = [
		{ name: 'About', href: '/about' },
		{ name: 'Projects', href: '/projects' },
		{ name: 'Resume', href: '/resume' },
		{ name: 'Contact', href: '/contact' }
	];
	export const prerender = true;

	let menuOpen = $state(false);
	function closeMenu() { menuOpen = false; }
</script>

<svelte:head>
	<title>Shanzay Asad | Product Engineer</title>
	<meta name="description" content="Shanzay Asad's portfolio: projects, games, resume and contact." />
</svelte:head>

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<SpaceBackground />

<div class="app">
	<header class="navbar">
		<div class="nav-inner">
			<a href="/" class="logo" aria-label="Home" onclick={closeMenu}>
				<PixelSprite {...sparkle} pixel={3} />
				<span>shanzay</span>
			</a>

			<nav class="nav-links" class:open={menuOpen} aria-label="Main">
				{#each navItems as item}
					<a
						href={item.href}
						class="nav-link"
						class:active={$page.url.pathname === item.href}
						aria-current={$page.url.pathname === item.href ? 'page' : undefined}
						onclick={closeMenu}
					>
						{item.name}
					</a>
				{/each}
				<div class="mobile-ctas">
					<a class="btn btn-outline" href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
					<a class="btn" href="/contact" onclick={closeMenu}>Get in touch</a>
				</div>
			</nav>

			<div class="ctas">
				<a class="text-link" href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
				<a class="btn btn-outline" href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
				<a class="btn" href="/contact">Get in touch</a>
			</div>

			<button
				class="mobile-menu-btn"
				class:open={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
				aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
				aria-expanded={menuOpen}
				type="button"
			>
				<span></span>
				<span></span>
			</button>
		</div>
	</header>

	<main class="main-content">
		{@render children?.()}
	</main>

	<footer class="footer">
		<div class="footer-content">
			<p>&copy; {new Date().getFullYear()} Shanzay Asad</p>
			<div class="footer-links">
				<a href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
				<a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
			</div>
		</div>
	</footer>

	{#if menuOpen}
		<button class="mobile-backdrop" onclick={closeMenu} aria-label="Close navigation" type="button"></button>
	{/if}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(8, 8, 10, 0.92);
		border-bottom: 1px solid #1f1f25;
		backdrop-filter: blur(10px);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		max-width: 1280px;
		height: 72px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--pixel-display);
		font-size: 1.6rem;
		font-weight: 700;
		color: #fff;
	}

	.logo:hover {
		color: #fff;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
	}

	.nav-link {
		padding: 0.45rem 0.8rem;
		border-radius: 6px;
		color: #e8e8ee;
		font-size: 0.95rem;
		font-weight: 500;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.nav-link:hover {
		background: #17171d;
		color: #fff;
	}

	.nav-link.active {
		color: #fff;
		background: #1c1a2e;
	}

	.ctas {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.ctas .btn,
	.mobile-ctas .btn {
		padding: 0.55rem 1.1rem;
		font-size: 0.92rem;
	}

	.text-link {
		margin-right: 0.5rem;
		color: #e8e8ee;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.text-link:hover {
		color: #fff;
	}

	.mobile-ctas {
		display: none;
	}

	.mobile-menu-btn {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 7px;
		width: 40px;
		height: 40px;
		margin-left: auto;
		padding: 0 8px;
		border: none;
		background: none;
		cursor: pointer;
	}

	.mobile-menu-btn span {
		display: block;
		height: 2px;
		background: #fff;
		transition: transform 0.2s ease;
	}

	.mobile-menu-btn.open span:first-child {
		transform: translateY(4.5px) rotate(45deg);
	}

	.mobile-menu-btn.open span:last-child {
		transform: translateY(-4.5px) rotate(-45deg);
	}

	.mobile-backdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		border: none;
		background: rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}

	.main-content {
		flex: 1;
		padding: 2rem 0;
	}

	.footer {
		border-top: 1px solid #1f1f25;
		background: rgba(8, 8, 10, 0.85);
		padding: 1.5rem 2rem;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1280px;
		margin: 0 auto;
	}

	.footer p {
		margin: 0;
		font-family: var(--pixel);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-links a {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.footer-links a:hover {
		color: #fff;
	}

	@media (max-width: 900px) {
		.nav-inner {
			height: 64px;
			padding: 0 1rem;
		}

		.ctas {
			display: none;
		}

		.mobile-menu-btn {
			display: flex;
		}

		.nav-links {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			z-index: 200;
			flex-direction: column;
			align-items: stretch;
			gap: 0.25rem;
			padding: 1rem;
			background: #08080a;
			border-bottom: 1px solid #1f1f25;
		}

		.nav-links.open {
			display: flex;
		}

		.nav-link {
			padding: 0.8rem 1rem;
			font-size: 1rem;
		}

		.mobile-ctas {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.75rem;
			margin-top: 0.75rem;
		}

		.footer-content {
			flex-direction: column;
			gap: 0.75rem;
		}
	}
</style>
