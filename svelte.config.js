import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    // Defaults output to build/ (pages, assets, no fallback, strict). Passing no
    // options also lets it switch to Vercel's output format when built there.
    adapter: adapter(),
  },
};

export default config;
