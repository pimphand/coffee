import { defineConfig } from 'astro/config';

export default defineConfig({
  // Static site generation for maximum simplicity & performance
  output: 'static',
  server: {
    host: true,
    port: 4321
  },
  build: {
    // Keep asset paths predictable for our copied template assets
    assets: 'assets'
  }
});
