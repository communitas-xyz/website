import { defineConfig } from '@astrojs/starlight/config';

export default defineConfig({
  title: 'Communitas.xyz',
  description:
    'An AI community manager toolkit for research-grade, pro-social interventions in online and offline communities.',
  favicon: '/favicon.svg',
  social: {
    github: 'https://github.com/communitas-xyz',
  },
  lang: 'en',
  sidebar: [
    {
      label: 'Overview',
      items: [
        { label: 'Home', link: '/' },
        { label: 'What is Communitas?', link: '/overview/what-is-communitas' },
        { label: 'Who it is for', link: '/overview/who-its-for' },
        { label: 'Core loops & concepts', link: '/overview/core-loops' },
      ],
    },
    {
      label: 'Product & Features',
      items: [
        { label: 'Community graph & metrics', link: '/product/community-graph' },
        { label: 'Health dashboard', link: '/product/health-dashboard' },
        { label: 'Interventions & agents', link: '/product/interventions-and-agents' },
        { label: 'Research tap & GraphRAG', link: '/product/research-tap' },
      ],
    },
    {
      label: 'Getting Started',
      items: [
        { label: 'Pilot in your community', link: '/getting-started/pilot-in-your-community' },
      ],
    },
    {
      label: 'Experiments & Evaluation',
      items: [
        { label: 'Experiments overview', link: '/experiments/overview' },
      ],
    },
    {
      label: 'Governance & Safety',
      items: [
        { label: 'Governance & safety principles', link: '/governance/governance-and-safety-principles' },
      ],
    },
    {
      label: 'Research & Theory',
      items: [
        { label: 'Research overview', link: '/research/overview' },
      ],
    },
    {
      label: 'For Researchers',
      items: [
        { label: 'Metrics specification', link: '/for-researchers/metrics-spec' },
      ],
    },
    {
      label: 'For Developers',
      items: [
        { label: 'Architecture overview', link: '/for-developers/architecture' },
      ],
    },
    {
      label: 'Appendix',
      items: [
        { label: 'Glossary', link: '/appendix/glossary' },
        { label: 'FAQ', link: '/appendix/faq' },
      ],
    },
  ],
});
