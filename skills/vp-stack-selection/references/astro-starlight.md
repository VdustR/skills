# Astro and Starlight

Prefer Astro for new static websites, especially marketing and landing pages.
Prefer Astro with Starlight for documentation websites. Starlight is an Astro
integration for documentation, not a competing application framework. These are
personal defaults after explicit choices and fixed contracts, not migration
instructions or claims that one framework always performs better.

## Select by the reader's task

| Situation | Default and reason | Boundary to check |
| --- | --- | --- |
| Marketing, landing page, portfolio, blog, or mostly read-only catalog | Astro: content delivery with interactive islands when useful | Content source, publishing frequency, asset pipeline, and build budget |
| Static site with a calculator, signup form, or interactive demo | Astro with a bounded island or browser script | Hydration, form endpoint, and state ownership; a widget does not require an application framework |
| Developer docs, product guides, tutorials, FAQ, knowledge base, or runbooks published as a site | Astro with Starlight: document navigation, headings, search, code presentation, and localization facilities | Required layout, content structure, authoring workflow, and search coverage |
| Marketing site with a documentation section | Astro pages plus Starlight for the docs section | Route ownership, shared branding, base paths, and search scope |
| Static-hosted editor, offline workspace, or dashboard dominated by shared client state | Compare Svelte/SvelteKit or the required UI framework with Astro | State lifetime, routing, offline behavior, and integration cost; static hosting is not the same as content-first interaction |
| One standalone document, downloadable report, or requested Word/PDF artifact | Keep the requested format; use Astro only if a website is also a deliverable | Publication and navigation needs must justify a site |
| Collaborative wiki with browser editing, approvals, permissions, or audit history | Compare a documentation site plus a verified CMS workflow with a fitting wiki or publishing platform | Starlight's rendering and navigation do not supply the editorial or access-control system |

Astro's [islands architecture](https://docs.astro.build/en/concepts/islands/)
lets selected components hydrate independently and permits shared state. Treat
heavy coordination across islands as an integration cost to compare, not as an
unsupported capability. Reuse one fitting UI framework for islands unless a
specific dependency justifies mixing frameworks.

## When another choice may fit better

Keep an existing supported stack for a scoped change. For a new site, justify a
departure from the Astro default with a concrete constraint or cost:

- A required hosting platform, CMS theme runtime, or integration may prescribe
  another framework. Verify that contract rather than replacing it for a default.
- A tiny fixed HTML page may need no framework. Compare plain HTML/CSS when
  Astro's build tooling adds cost without useful composition or content tooling.
- For docs needing maintained release snapshots and a version selector, compare
  Starlight's verified integration against
  [Docusaurus's versioning workflow](https://docusaurus.io/docs/versioning).
  Do not assume Starlight's locale support supplies documentation versioning.
- For docs whose decisive requirement is Vue components embedded in Markdown,
  compare Astro's Vue integration with
  [VitePress](https://vitepress.dev/guide/what-is-vitepress). Required component
  behavior and publication costs matter; familiarity alone is not a reason.

Starlight supports custom Astro pages and component overrides. A bespoke
marketing layout can remain an Astro page alongside the docs; extensive docs
layout replacements need an explicit maintenance comparison with plain Astro.
See [Starlight pages](https://starlight.astro.build/guides/pages/) and
[component overrides](https://starlight.astro.build/guides/overriding-components/).

## Rendering and adoption checks

1. Decide freshness and access requirements per route. Astro prerenders by
   default; [on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
   requires a compatible server adapter. A form or authenticated area does not
   rule out Astro, but a static-only host cannot execute server routes. Keep
   secrets and per-user content out of generated pages and public assets.
2. Verify the content pipeline against the chosen versions: Markdown/MDX,
   required CMS or loaders, schema validation, localization, and rebuild or
   preview behavior. Check representative content volume rather than promising
   unlimited build scalability.
3. For Starlight, check sidebar and heading navigation, code blocks, locale
   routes, and a production build's search results. Its default
   [Pagefind search](https://starlight.astro.build/guides/site-search/) indexes
   static content at build time. Verify coverage for dynamic content and any
   replacement search service. Excluding a page from search is not access control.
4. Check direct links, reloads, history, base paths, asset URLs, and deployment
   on the actual host. Exercise hydrated widgets and their state lifetime.
   Client-side navigation, SSR, and prerendering are separate choices; follow
   the [web reference](web.md).
5. Before adoption, verify compatible Astro, Starlight, UI integration, adapter,
   and plugin versions and pin them reproducibly. Selection does not require
   installing a demo; report proposed checks separately from executed checks.

Official reference documentation reviewed on 2026-11-12. Recheck version-specific
APIs and integrations for the target project; no framework build or performance
benchmark is implied.
