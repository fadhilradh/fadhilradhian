import { Outlet } from '@tanstack/react-router';

import { SiteFooter } from '../components/site-footer.js';
import { SiteHeader } from '../components/site-header.js';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Keyboard users get out of the header in one tab. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-crate focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Lewati ke konten / Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="stencil text-xs text-ink-faint">404</p>
      <h1 className="signage mt-2 text-2xl text-ink">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-prose text-base text-ink-muted">
        Tautan ini tidak mengarah ke mana pun. Coba telusuri listing yang aktif.
      </p>
    </section>
  );
}
