import { LANES } from '@niaga/contracts';
import { Button, LaneLegend } from '@niaga/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { ListingCard } from '../components/listing-card.js';
import { ManifestBoard } from '../components/manifest-board.js';
import { api, queryKeys } from '../lib/api.js';
import { useI18n } from '../lib/i18n.js';
import { laneLabel, laneMeaning } from '../lib/lanes.js';

export function LandingPage() {
  const { locale, t } = useI18n();

  const manifest = useQuery({
    queryKey: queryKeys.manifest(locale),
    queryFn: () => api.manifest(locale, 12),
    staleTime: 60_000,
  });

  const recent = useQuery({
    queryKey: queryKeys.recentListings(),
    queryFn: () => api.recentListings(3),
    staleTime: 60_000,
  });

  const totalActive = manifest.data?.totalActive ?? 0;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <div className="flex flex-col justify-center">
            {/* 64px only once the column is wide enough to hold a line of
                expanded Archivo; below that the display size steps down rather
                than wrapping into three ragged lines. */}
            <h1 className="signage text-2xl text-balance text-ink 2xl:text-3xl">
              <span className="block">{t('hero.title.1')}</span>
              <span className="block">{t('hero.title.2')}</span>
              <span className="block text-lane-green">{t('hero.title.3')}</span>
            </h1>

            <p className="mt-5 max-w-prose text-base text-ink-muted">{t('hero.lede')}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg">{t('hero.ctaPost')}</Button>
              <Link to="/telusuri">
                <Button variant="secondary" size="lg">
                  {t('hero.ctaBrowse', { count: totalActive })}
                </Button>
              </Link>
            </div>

            <p className="stencil mt-6 text-[0.6875rem] text-ink-faint">{t('hero.vertical')}</p>
          </div>

          <ManifestBoard className="self-start" />
        </div>
      </section>

      <section className="hairline-t bg-surface-sunk">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="signage text-xl text-ink">{t('lane.section.title')}</h2>
          <p className="mt-3 max-w-prose text-base text-ink-muted">{t('lane.section.lede')}</p>

          <LaneLegend
            className="mt-6 border border-rule"
            items={LANES.map((lane) => ({
              lane,
              label: laneLabel(lane, t),
              meaning: laneMeaning(lane, t),
            }))}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="signage text-xl text-ink">{t('recent.title')}</h2>
            <p className="mt-2 max-w-prose text-base text-ink-muted">{t('recent.lede')}</p>
          </div>
          <Link to="/telusuri" className="text-sm text-lane-green underline underline-offset-4">
            {t('recent.viewAll')}
          </Link>
        </div>

        {recent.isPending ? (
          <p className="stencil mt-6 text-xs text-ink-faint">{t('browse.loading')}</p>
        ) : recent.isError ? (
          <p className="mt-6 text-sm text-lane-red">{t('browse.error')}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.data.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
