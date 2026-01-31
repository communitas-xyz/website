import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Communitas.xyz',
      sidebar: [
        {
          label: 'Overview',
          autogenerate: { directory: 'overview' },
        },
        {
          label: 'Product & Features',
          autogenerate: { directory: 'product' },
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Experiments & Evaluation',
          autogenerate: { directory: 'experiments' },
        },
        {
          label: 'Governance & Safety',
          autogenerate: { directory: 'governance' },
        },
        {
          label: 'Research & Theory',
          autogenerate: { directory: 'research' },
        },
        {
          label: 'For Researchers',
          autogenerate: { directory: 'for-researchers' },
        },
        {
          label: 'For Developers',
          autogenerate: { directory: 'for-developers' },
        },
        {
          label: 'Appendix',
          autogenerate: { directory: 'appendix' },
        },
      ],
    }),
  ],
});
