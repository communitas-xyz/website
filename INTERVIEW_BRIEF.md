# Interview Brief — Communitas.xyz Content Rewrite

**Purpose:** Working document for the content rewrite of Communitas.xyz. Contains interview answers from the founder, content analysis, and the rewrite plan.

**Status:** Interview complete. Ready for content rewrite.

**Created:** 2026-02-01

---

## 1. Interview answers

### Founder identity and origin

The founder is a technology industry veteran — Silicon Valley, startups, scale-ups. Self-described "armchair anthropologist." Not someone who had a community collapse, but someone who spent a career inside the machine that builds network analysis, community detection, and engagement tooling for enterprises. The insight came from working with customers and partners around the globe who were proficient in these skills: the tools that enterprise teams use to understand networks are powerful, but completely inaccessible to the people who actually build and maintain communities.

Two convictions emerged:

1. **These tools should be in the hands of common people.** Network science, graph analytics, community health metrics — they exist, they work, and they're locked behind academic paywalls and engineering complexity.
2. **Healthy communities are vitally important.** Not a nice-to-have. A societal necessity, especially now.

### The urgency argument

Three forces converge to make this urgent:

1. **Structural loneliness.** Robert Putnam's _Bowling Alone_ thesis — social capital has been declining for decades. People are lonelier and more isolated. The Surgeon General's advisory on loneliness confirms this is a public health crisis.
2. **Platform failure.** Social networks promised connection but optimized for engagement. They built enormous networks where people feel more isolated, not less. Content is rampant with fictitious or erroneous material.
3. **AI's double edge.** AI platforms introduce a whole new world of complexity — synthetic content, bot participation, algorithmic manipulation. The same technology that could help communities also makes authentic connection harder to find and harder to trust.

The paradox: technology makes it easier to get information from around the globe, but harder for people to make close groups of friends.

### The name

"Communitas" comes from Victor Turner's anthropological concept (1940s/1960s) — a state of intense social togetherness that emerges when people step outside normal social structures. Turner was writing about cities and physical communities. The founder is taking this metaphor into the modern digital world: intentional design of shared spaces where real connection happens.

This origin story is not on the site anywhere. It should be.

### Key reframe

**"Building better communities" → "Building intelligent communities."**

"Better" is vague. "Intelligent" implies the community itself gains capability — it can see its own structure, understand its own health, and make informed decisions about its own growth. The introduction of technological advancements (network science, AI, graph analytics) into community building is what makes communities "intelligent."

### What exists today

| Layer                    | What it is                                                                                                                                                                                                                                               | Status             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Publishing platform**  | Research site (communitas.xyz) — community science made accessible                                                                                                                                                                                       | Live               |
| **Content distribution** | Reddit and Substack as outposts for research and insights                                                                                                                                                                                                | Planned            |
| **Open-source agent**    | "Community anthropologist" on GitHub — trained on Easley & Kleinberg, arXiv papers, and the broader community science corpus. Can build a local graph of a community's network, answer research questions, and guide decisions about community structure | Exists             |
| **Paid concierge agent** | Active community participant — invites new members, guides interactions, helps people grow and make connections                                                                                                                                          | Planned, not built |
| **Enhanced analytics**   | Dashboards, platform integrations, advanced metrics                                                                                                                                                                                                      | Planned, not built |

### The open-source agent

The GitHub agent today is a knowledgeable research assistant trained on network science literature. It acts as a "community anthropologist" — it studies a community the way an anthropologist studies a culture: observing patterns, mapping relationships, surfacing structure invisible to people inside it.

Current capabilities:

- Answer questions about network science, community health, and research
- Build a local graph of a community's network
- Guide decisions about community structure using its knowledge base

Simple today, designed to grow.

### Two user personas

1. **Existing community manager** — Has an active community. Wants to understand its structure, find problems, and improve health. First touch: connects the audit agent → sees their community's real structure for the first time. Output: visualization of connections, centrality metrics, information flow patterns, most trafficked content, users who are "conduits" for information traversal (bridges).

2. **Aspiring community builder** — Wants to create a new community. First touch: reads the research and guidance → learns the principles → starts building with a framework. Communitas provides guiding principles, platform guidance (where users hang out), and community design patterns.

### Content-to-tool pipeline

The natural progression: reading and learning → using the knowledge in the form of an AI tool. Content is the front door. The tool is what they came for without knowing it.

Six-month vision: frequent content creation, users discover content → learn more → navigate to GitHub → access the tools.

### Communitas as publishing house

Communitas should be a publishing house for distributing the most up-to-date research and providing insights on social networks, community science, and related news. The site is not just a product page — it's a media property.

### Agent naming

"The Anthropologist" was rejected — too clinical. Preference is for something warmer: guide, sage, or a unique proper name (like Alexa — a name that becomes associated with the product, not a description of its function). Character: wise, guiding, approachable. Not clinical or academic.

Naming is deferred. Two agents need names eventually:

- **Free/open-source agent** — the community anthropologist / auditor
- **Paid agent** — the community concierge / guide

### The elevator pitch

The founder consistently answers "what is Communitas?" with the mission rather than the product. This is authentic — the mission _is_ the product for this founder. The tools serve the mission.

**Working synthesis:**

> Communitas is a research platform and open-source toolkit that brings network science to community builders. We publish the research, build the tools, and help people be intentional about how their communities connect, grow, and stay healthy.

**Tagline:** "Building intelligent communities."

**Subline:** Being intentional about our online communities and spaces — taking the wealth of tools and research and making the best use of them for encouraging healthy human interaction.

### Product ladder

Learn → Diagnose → Treat.

1. **Learn** — Read the research, understand community science exists as a discipline
2. **Diagnose** — Use the free agent to audit your community, see its real structure
3. **Treat** — Use the paid concierge to actively improve community health (future)

---

## 2. Primary reference: Easley & Kleinberg

**Networks, Crowds, and Markets: Reasoning About a Highly Connected World**
David Easley and Jon Kleinberg, Cambridge University Press (2010)
https://www.cs.cornell.edu/home/kleinber/networks-book/

Full pre-publication draft freely available from Cornell. This is the founder's primary reference for the metrics and models Communitas tracks.

### Key chapters mapping to Communitas features

| Chapter | Topic                               | Maps to                                                                     |
| ------- | ----------------------------------- | --------------------------------------------------------------------------- |
| Ch. 3   | Strong and Weak Ties                | Bridge detection, structural holes, social capital → bridge scarcity metric |
| Ch. 4   | Homophily, Affiliation              | Clique formation and lock-in → clique lock-in metric                        |
| Ch. 5   | Positive and Negative Relationships | Structural balance, conflict patterns → moderation hotspots                 |
| Ch. 16  | Information Cascades                | Following the crowd, herding behavior → information flow analysis           |
| Ch. 19  | Cascading Behavior in Networks      | Diffusion, thresholds, role of weak ties → information flow gaps metric     |
| Ch. 20  | Small-World Phenomenon              | Core-periphery structure, decentralized search → fragmentation risk metric  |
| Ch. 18  | Power Laws, Rich-Get-Richer         | Preferential attachment → participation concentration metric                |

This book should be referenced in the docs as an accessible entry point for community builders who want to understand the science. It's freely available and written at an introductory undergraduate level — no formal prerequisites.

---

## 3. Current content inventory

The site has 10 public-facing documentation pages across 7 sidebar sections, plus a standalone landing page. All content was generated from BRIEF.md in a research-outward direction — concepts first, user value second.

### Landing page (`/`)

Standalone Astro page with Three.js network visualization. Seven sections: hero, problem statement, four moves, what you get, three experiments, audience segments, CTA. Copy is condensed from the docs.

### Documentation pages

| Section         | Page                    | Lines | Focus                                                         |
| --------------- | ----------------------- | ----- | ------------------------------------------------------------- |
| Overview        | What is Communitas?     | 35    | Product definition, four loops, open/private split            |
| Overview        | Why Communities         | 51    | Problem framing, network science argument, AI ethics position |
| Research        | Research Foundations    | 49    | Six research families, practical implications of each         |
| Getting Started | Pilot in Your Community | 54    | Four-step DIY guide (name, map, try, review)                  |
| Models          | Community Graph Model   | 76    | 8 entity types, 10 edge types, 3 internal models              |
| Models          | Health Metrics          | 71    | 7 health signals, what/why/action for each                    |
| Models          | Intervention Taxonomy   | 93    | 5 categories, 15 specific interventions                       |
| Experiments     | Experiment Registry     | 112   | 3 planned experiments with full methodology                   |
| Agents          | Agent Design Principles | 74    | 4 agent roles, constraints, intervention engine               |
| Governance      | Governance and Safety   | 45    | 8 governance principles as system constraints                 |

**Total public content:** ~660 lines of prose across 11 pages.

---

## 4. Content strengths to preserve

### Research grounding is specific, not decorative

The content cites specific research families (bridge theory, linguistic style matching, GraphRAG, dynamic community detection) and explains the practical mechanism behind each one. Most community tools cite no research at all. The research page translates findings into "what this means in practice."

### The four-loops framework is clear and memorable

Understand → Spot → Try → Learn. Consistent across Overview, Landing Page, and Getting Started guide. Gives the product a conceptual spine.

### The governance position is unusually concrete

Framed as engineering constraints, not aspirations: "these are not guidelines, they are system constraints." Short, direct, specific. Deliberately non-aspirational language.

### The models section has real technical depth

Entity types, edge types, weight algorithms, experiment designs with randomization protocols and ethical guardrails. Signals seriousness to a technical audience.

### The tone is honest about stage

Acknowledges early status: "designed but not yet completed," "we are early." This is a strength — overclaiming would undermine the transparency positioning.

---

## 5. Content gaps the rewrite must address

### The writing direction is inverted

Current pattern: research finding → explanation → Communitas application.
Needed pattern: reader's pain → structural insight → how Communitas helps → research link for depth.

The research should support the value proposition, not be the value proposition.

### No human story

No origin story, no founder voice. The Why Communities page tells other people's stories but not the founder's. The interview revealed a compelling origin: tech industry insider who saw the asymmetry between enterprise network tools and what community builders get.

### No product clarity

A reader finishes the site unsure whether they can use something today. The interview clarified: the research site is live, the open-source agent exists on GitHub, paid tools are planned. The copy should state this directly.

### No primary audience

Four audience segments listed, none prioritized. The interview revealed two clear personas (existing community manager, aspiring community builder) but didn't narrow to one primary. Content should serve both but lead with the existing manager (they have the most immediate pain).

### The name origin is missing

Victor Turner's _Communitas_ concept — intentional design of shared spaces where real connection happens, applied to digital communities — is not mentioned anywhere on the site. It's the most distinctive thing about the brand.

### The Three.js visualization is disconnected from the product

The network graph on the landing page is essentially a preview of the product's core output (a living map of community connections). This connection is not made explicit in the copy.

---

## 6. Content rewrite plan

### Phase 1: Core concept pages

Rewrite the Overview section (What is Communitas?, Why Communities) to lead with the founder's story and the user's pain, supported by research.

Key changes:

- Open with the founder's insight (enterprise tools exist, community builders get nothing)
- Introduce the name origin (Turner's communitas concept)
- Frame "intelligent communities" as the core idea
- Lead with pain, support with research
- Be explicit about what exists today vs. what's planned

### Phase 2: Landing page

Rewrite using interview answers. Current structure is sound; copy needs grounding in product reality.

Key changes:

- Hero: "Building intelligent communities." with a description that explains what Communitas actually is
- Problem section: The loneliness/platform failure/AI complexity urgency stack
- What you get: Three layers (publishing, open-source agent, paid tools) with honest status
- CTA: Link to GitHub for the agent, link to docs for the research, mention Substack/Reddit for content
- Connect the Three.js visualization to the product ("this is what your community looks like")

### Phase 3: Supporting pages

Review and tighten Research, Models, Experiments, Agents, and Governance pages. Add Easley & Kleinberg references where appropriate. Adjust examples if a primary audience is chosen.

### Phase 4: Writing review (Five Cs)

Separate pass focused on prose quality. Requires explicit permission to proceed.

---

## 7. Questions still open

These were not answered in the interview and may need follow-up:

1. **Who is the first customer?** Two personas identified but no primary chosen. Recommendation: lead with existing community managers (more immediate pain, clearer "aha moment" with the audit agent).

2. **Competitive differentiation.** How is Communitas different from Orbit, Common Room, Discourse analytics? The research grounding and governance-first approach are likely differentiators but aren't framed that way.

3. **Red lines.** What would Communitas refuse to build? The governance page states principles but lacks concrete examples.

4. **Funding model.** VC, grants, bootstrapping? Affects credibility framing.

5. **Agent names.** Deferred. Two agents need names: the free auditor and the paid concierge. Character: wise, guiding, approachable. Not clinical.

---

## 8. Session context for future pickup

### What was built this session

- **Split architecture**: Standalone landing page (`src/pages/index.astro`) + Starlight docs
- **Three.js canvas**: Fixed stacking context issue by moving canvas to `<body>` level in the standalone page
- **Internal docs**: 5 pages in the Internals section (local development, configuration reference, site architecture, network visualization, ADR)
- **Navigation**: Landing page has "Docs" link; Starlight header has "Home" link via `navLinks`
- **Fixes**: AGENTS.md drift corrected, .gitignore updated with .env patterns
- **Interview**: Conducted and documented in this file

### What needs to happen next

1. **Content rewrite**: Phases 1-4 as described in section 6
2. **Writing review**: Five Cs pass on all public content (separate phase, needs explicit permission)
3. **Commit and deploy**: All changes are uncommitted — commit once content is finalized

### Dev server

Runs in tmux session `astro-dev` at `http://server:4321` (also accessible via `server.tail14a7e5.ts.net:4321`).

### Build status

All checks pass: `build`, `lint`, `typecheck`, `format`. 17 pages compile (1 landing + 15 Starlight docs + 1 404).

### Key files

| File                           | What it is                                         |
| ------------------------------ | -------------------------------------------------- |
| `INTERVIEW_BRIEF.md`           | This document — interview answers and rewrite plan |
| `BRIEF.md`                     | Original product/research briefing document        |
| `AGENTS.md`                    | Agent coding instructions                          |
| `src/pages/index.astro`        | Landing page (standalone, outside Starlight)       |
| `src/content/docs/**/*.mdx`    | All documentation pages                            |
| `src/scripts/network-scene.ts` | Three.js visualization (~1,200 lines)              |
| `src/styles/global.css`        | Starlight brand tokens                             |
| `astro.config.mts`             | Astro + Starlight + Vite configuration             |
