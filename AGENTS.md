## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Application architecture

- Use `src/config/index.config.ts` as the public facade for stable site constants, routes, statuses, storage keys, and behavior defaults.
- Keep fixtures in `src/data/`; pages and components must access catalog data through `src/services/`.
- Services are small functional factories (`useXService`), not classes or repositories. They must remain independent from Vue lifecycle APIs.
- External operations return `ServiceResult<T>` for expected failures and normalize transport errors to `ServiceError`.
- Never capture a user token or initialize a user store at module scope. Resolve authentication per operation/request.
- Do not mutate shared Axios authorization defaults during SSR.
- Keep reactive UI state in `src/composables/<context>/` and shared Vue behavior in `src/composables/shared/`.
- Astro pages are SSR by default. Add `prerender = true` only to routes that are intentionally static.
- Run `npm run format:check`, `npm run lint`, `npm run check`, `npm run test`, and `npm run build` before handoff.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
