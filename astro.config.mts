import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://communitas.xyz',
  integrations: [
    starlight({
      title: 'Communitas',
      description:
        'Building better communities. Tools, research, and guidance for intentional community design.',
      social: {
        github: 'https://github.com/communitas-xyz',
      },

      sidebar: [
        {
          label: 'Overview',
          autogenerate: { directory: 'overview' },
        },
        {
          label: 'Research',
          autogenerate: { directory: 'research' },
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Governance',
          autogenerate: { directory: 'governance' },
        },
      ],
    }),
  ],
});
