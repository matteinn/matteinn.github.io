// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://matteinn.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // Dual themes: switched via the `data-theme` attribute (see global.css)
      themes: {
        light: 'github-light',
        dark: 'dracula',
      },
    },
  },
});
