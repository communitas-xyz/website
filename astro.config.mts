import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeBlack from 'starlight-theme-black';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://communitas.xyz',
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['server.tail14a7e5.ts.net', 'server'],
    },
  },
  integrations: [
    starlight({
      title: 'Communitas',
      description:
        'Building better communities. Tools, research, and guidance for intentional community design.',
      favicon: '/favicon.svg',
      plugins: [
        starlightThemeBlack({
          navLinks: [{ label: 'Home', link: '/' }],
        }),
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/communitas-xyz' }],
      customCss: ['./src/styles/global.css'],
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
          label: 'Models',
          autogenerate: { directory: 'models' },
        },
        {
          label: 'Experiments',
          autogenerate: { directory: 'experiments' },
        },
        {
          label: 'Agents',
          autogenerate: { directory: 'agents' },
        },
        {
          label: 'Governance',
          autogenerate: { directory: 'governance' },
        },
        {
          label: 'Internals',
          autogenerate: { directory: 'internals' },
        },
      ],
    }),
  ],
});
