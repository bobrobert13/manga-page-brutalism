# Astro framework basics

Use the official Astro documentation for current API examples. This reference retains the stable project and CLI concepts needed by the local skill.

## Configuration

Astro looks for one of these files at the project root:

- `astro.config.js`
- `astro.config.mjs`
- `astro.config.cjs`
- `astro.config.ts`

Pass `--config` only when the configuration is intentionally stored elsewhere. The `site` option defines the deployment URL used for canonical URLs and integrations such as sitemaps.

## CLI

| Task                    | Command                  |
| ----------------------- | ------------------------ |
| Background development  | `astro dev --background` |
| Production build        | `npx astro build`        |
| Type and content checks | `npx astro check`        |
| Add an integration      | `npx astro add`          |
| Regenerate Astro types  | `npx astro sync`         |

Run sync/check after integrations or environment schema changes.

## Project structure

- `src/pages/`: filesystem routes and endpoint handlers.
- `src/components/`: Astro and framework UI components.
- `src/layouts/`: shared page shells.
- `src/styles/`: global and reusable styles.
- `public/`: assets copied without processing.
- `astro.config.*`: integrations, adapter, output and Vite configuration.
- `tsconfig.json`: TypeScript and path alias configuration.

Files in `src/pages/` become routes. Astro components render on the server unless a framework component receives a `client:*` directive. Choose the narrowest hydration directive that supports the interaction.

## Adapters

Add an adapter through Astro's CLI, then check and build:

```bash
npx astro add node --yes
npx astro check
npx astro build
```

Equivalent official adapters exist for Cloudflare, Netlify and Vercel. This repository currently uses the Node standalone adapter; changing it affects SSR, deployment and runtime APIs and therefore requires explicit scope.

## Official references

- https://docs.astro.build
- https://docs.astro.build/en/reference/configuration-reference/
- https://docs.astro.build/en/basics/project-structure/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/integrations-guide/node/
