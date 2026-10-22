<script lang="ts">
	import Console from '$lib/components/space/Console.svelte';
</script>

<section class="home">
	<h1 class="visually-hidden">Shanzay Asad</h1>
	<Console />
</section>

<style>
	.home {
		padding: 3.5rem 1.5rem 2rem;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.home {
			padding: 1.5rem 1rem 1rem;
		}
	}
</style>
