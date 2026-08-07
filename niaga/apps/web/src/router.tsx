import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { browseSearchSchema } from './lib/browse-search.js';
import { BrowsePage } from './routes/browse.js';
import { LandingPage } from './routes/landing.js';
import { NotFound, RootLayout } from './routes/root-route.js';

/**
 * Code-based routes rather than file-based.
 *
 * File-based routing needs a generated `routeTree.gen.ts` on disk, which means
 * `tsc --noEmit` in CI depends on a build artefact. Two routes do not justify
 * that; the types are identical either way.
 *
 * Paths are in Bahasa Indonesia because that is the default locale — `/telusuri`
 * rather than `/browse`. The URL is part of the product's voice.
 */
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/telusuri',
  validateSearch: (search: Record<string, unknown>) => browseSearchSchema.parse(search),
  component: BrowsePage,
});

const routeTree = rootRoute.addChildren([indexRoute, browseRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
