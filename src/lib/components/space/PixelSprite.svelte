<script lang="ts">
	let {
		rows,
		colors,
		pixel = 4,
		class: className = ''
	}: {
		/** One string per row; each character is a key into `colors`, '.' is transparent */
		rows: string[];
		colors: Record<string, string>;
		pixel?: number;
		class?: string;
	} = $props();

	const width = $derived(Math.max(...rows.map((r) => r.length)));
	const cells = $derived(
		rows.flatMap((row, y) =>
			[...row].flatMap((char, x) => (colors[char] ? [{ x, y, fill: colors[char], key: char }] : []))
		)
	);
</script>

<svg
	class={className}
	width={width * pixel}
	height={rows.length * pixel}
	viewBox="0 0 {width} {rows.length}"
	shape-rendering="crispEdges"
	aria-hidden="true"
>
	{#each cells as cell}
		<rect x={cell.x} y={cell.y} width="1" height="1" fill={cell.fill} class="px-{cell.key}" />
	{/each}
</svg>
