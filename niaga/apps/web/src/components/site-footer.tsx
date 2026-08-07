import { cn } from '@niaga/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { api, queryKeys } from '../lib/api.js';
import { useI18n } from '../lib/i18n.js';

/**
 * Live API status. Present from phase 0 on purpose: the deploy pipeline is only
 * real once the browser can prove it reaches the API, and a broken backend
 * should be visible rather than inferred from an empty page.
 */
function ApiStatus() {
  const { t } = useI18n();
  const { data, isError } = useQuery({
    queryKey: queryKeys.health,
    queryFn: api.health,
    staleTime: 30_000,
    retry: 1,
  });

  const state = isError ? 'down' : data?.status === 'degraded' ? 'degraded' : data ? 'ok' : null;
  if (!state) return null;

  const dot =
    state === 'ok' ? 'bg-lane-green' : state === 'degraded' ? 'bg-lane-amber' : 'bg-lane-red';

  return (
    <p className="stencil flex items-center gap-2 text-[0.6875rem] text-ink-faint">
      <span aria-hidden className={cn('size-1.5 rounded-full', dot)} />
      {t(`footer.api.${state}` as const)}
    </p>
  );
}

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="hairline-t mt-16 bg-surface-sunk">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="signage text-base text-ink">NIAGA</p>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.product')}>
          <h2 className="stencil text-[0.6875rem] text-ink-faint">{t('footer.product')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/telusuri" className="text-ink-muted hover:text-ink">
                {t('nav.browse')}
              </Link>
            </li>
            <li>
              <Link to="/" className="text-ink-muted hover:text-ink">
                {t('nav.post')}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('footer.trust')}>
          <h2 className="stencil text-[0.6875rem] text-ink-faint">{t('footer.trust')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="text-ink-muted hover:text-ink">
                {t('footer.verification')}
              </Link>
            </li>
            <li>
              <Link to="/" className="text-ink-muted hover:text-ink">
                {t('footer.report')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="hairline-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-2xl text-xs text-ink-faint">{t('footer.disclaimer')}</p>
          <ApiStatus />
        </div>
      </div>
    </footer>
  );
}
