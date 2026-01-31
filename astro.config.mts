import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://communitas.xyz',
  integrations: [
    starlight({
      title: 'Communitas',
      description:
        'Building better communities. Tools, research, and guidance for intentional community design.',
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/communitas-xyz' },
      ],
      customCss: ['./src/styles/custom.css'],
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
