import { INCOTERMS, LANES, LISTING_KINDS } from '@niaga/contracts';
import { Button, Card, Field, Input, Select } from '@niaga/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { ListingCard } from '../components/listing-card.js';
import { api, queryKeys } from '../lib/api.js';
import { CLEARED_FILTERS, type BrowseSearch } from '../lib/browse-search.js';
import { useI18n } from '../lib/i18n.js';
import { laneLabel } from '../lib/lanes.js';

export function BrowsePage() {
  const { t } = useI18n();
  const search = useSearch({ from: '/telusuri' });
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.recentListings(),
    queryFn: () => api.recentListings(48),
    staleTime: 60_000,
  });

  const listings = data?.items ?? [];

  // Narrowing happens client-side until phase 3 moves it into Postgres with
  // real facet counts and keyset pagination.
  const filtered = listings.filter((listing) => {
    if (search.kind && listing.kind !== search.kind) return false;
    if (search.lane && listing.company.verificationLane !== search.lane) return false;
    if (search.incoterm && listing.mark.incoterm !== search.incoterm) return false;
    if (search.province && listing.company.province !== search.province) return false;

    if (search.q) {
      const needle = search.q.toLowerCase();
      const haystack = [
        listing.titleId,
        listing.titleEn ?? '',
        listing.mark.hsCode,
        listing.company.brandName,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  const provinces = [...new Set(listings.map((listing) => listing.company.province))]
    .filter((province): province is string => Boolean(province))
    .sort((a, b) => a.localeCompare(b));

  const hasFilters = Object.values(search).some(Boolean);

  /** An empty value clears the param rather than filtering on "". */
  const update = (patch: Partial<Record<keyof BrowseSearch, string | undefined>>) => {
    void navigate({
      to: '/telusuri',
      search: (previous) => {
        const next: Record<string, unknown> = { ...previous, ...patch };
        for (const [key, value] of Object.entries(next)) {
          if (!value) delete next[key];
        }
        return next as BrowseSearch;
      },
      replace: true,
    });
  };

  const clearAll = () => update(CLEARED_FILTERS);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="signage text-xl text-ink">{t('browse.title')}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside>
          <Card className="h-fit p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="stencil text-[0.6875rem] text-ink-faint">{t('browse.filters')}</h2>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-lane-green underline underline-offset-4"
                >
                  {t('browse.clear')}
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <Field label={t('browse.search')}>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    type="search"
                    value={search.q ?? ''}
                    placeholder={t('browse.searchPlaceholder')}
                    onChange={(event) => update({ q: event.target.value })}
                  />
                )}
              </Field>

              <Field label={t('browse.kind')}>
                {({ id }) => (
                  <Select
                    id={id}
                    value={search.kind ?? ''}
                    onChange={(event) => update({ kind: event.target.value })}
                  >
                    <option value="">{t('browse.kind.all')}</option>
                    {LISTING_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind === 'offer' ? t('listing.offer') : t('listing.request')}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field label={t('browse.lane')}>
                {({ id }) => (
                  <Select
                    id={id}
                    value={search.lane ?? ''}
                    onChange={(event) => update({ lane: event.target.value })}
                  >
                    <option value="">{t('browse.lane.all')}</option>
                    {LANES.map((lane) => (
                      <option key={lane} value={lane}>
                        {laneLabel(lane, t)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field label={t('browse.incoterm')}>
                {({ id }) => (
                  <Select
                    id={id}
                    value={search.incoterm ?? ''}
                    onChange={(event) => update({ incoterm: event.target.value })}
                  >
                    <option value="">{t('browse.incoterm.all')}</option>
                    {INCOTERMS.map((incoterm) => (
                      <option key={incoterm} value={incoterm}>
                        {incoterm}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field label={t('browse.province')}>
                {({ id }) => (
                  <Select
                    id={id}
                    value={search.province ?? ''}
                    onChange={(event) => update({ province: event.target.value })}
                  >
                    <option value="">{t('browse.province.all')}</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </Card>
        </aside>

        <div>
          {isPending ? (
            <p className="stencil text-xs text-ink-faint">{t('browse.loading')}</p>
          ) : isError ? (
            <p className="text-sm text-lane-red">{t('browse.error')}</p>
          ) : filtered.length === 0 ? (
            <Card className="p-8">
              <p className="text-base text-ink">{t('browse.empty.title')}</p>
              <p className="mt-2 text-sm text-ink-muted">{t('browse.empty.action')}</p>
              <Button variant="secondary" className="mt-4" onClick={clearAll}>
                {t('browse.clear')}
              </Button>
            </Card>
          ) : (
            <>
              <p className="stencil tally text-[0.6875rem] text-ink-faint">
                {t('browse.results', { count: filtered.length })}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
