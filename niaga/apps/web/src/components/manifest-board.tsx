import { formatHsCode, type ManifestRow } from '@niaga/contracts';
import { Card, LaneChip, SplitFlapText, cn, useReducedMotion } from '@niaga/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { api, queryKeys } from '../lib/api.js';
import { formatQuantity } from '../lib/format.js';
import { useI18n } from '../lib/i18n.js';
import { laneLabel, laneMeaning } from '../lib/lanes.js';

const VISIBLE_ROWS = 8;
const TICK_MS = 6000;
const TITLE_CHARS = 26;

/**
 * Shared by the column header and every row so they cannot drift.
 *
 * `minmax(0, 1fr)` on the commodity column is load-bearing: the title is
 * `whitespace-pre` mono, so a plain `1fr` takes its min-content width from the
 * text and pushes the quantity and lane columns out of the card.
 *
 * The lane column is a fixed width rather than `auto` for the same reason in
 * reverse — the header row has no chip in it, so an `auto` column would size to
 * nothing there and the two grids would not line up.
 */
const ROW_GRID = 'sm:grid-cols-[4.75rem_minmax(0,1fr)_4.75rem_3.5rem_7rem]';

/** The board is a fixed-width mono table; long commodity names get clipped
 *  rather than wrapped, the way a real departures board does it. */
function boardTitle(title: string): string {
  const upper = title.toUpperCase();
  return upper.length > TITLE_CHARS ? `${upper.slice(0, TITLE_CHARS - 1)}…` : upper;
}

function ManifestRowView({ row, index }: { row: ManifestRow; index: number }) {
  const { locale, t } = useI18n();
  const quantity = formatQuantity(locale, row.quantity, row.unit);
  const route = [row.originPort, row.incoterm].filter(Boolean).join('  ');

  return (
    <li className="hairline-b last:border-b-0">
      <div
        className={cn(
          'grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 px-4 py-2.5',
          ROW_GRID,
        )}
      >
        <SplitFlapText
          text={formatHsCode(row.hsCode)}
          delayMs={index * 90}
          className="order-1 text-xs text-ink-muted sm:order-none"
        />
        <SplitFlapText
          text={boardTitle(row.title)}
          delayMs={index * 90 + 120}
          // truncate as well as the character cap: the cap keeps very long names
          // from dominating the row, and the ellipsis keeps a narrow viewport
          // from clipping mid-letter.
          className="order-3 col-span-2 min-w-0 truncate text-xs text-ink sm:order-none sm:col-span-1"
        />
        <span className="stencil order-4 text-[0.6875rem] whitespace-nowrap text-ink-muted sm:order-none">
          {route || '—'}
        </span>
        <span className="stencil tally order-5 text-[0.6875rem] whitespace-nowrap text-ink sm:order-none sm:text-right">
          {quantity ?? '—'}
        </span>
        <div className="order-2 justify-self-end sm:order-none">
          <LaneChip
            lane={row.lane}
            label={laneLabel(row.lane, t)}
            title={laneMeaning(row.lane, t)}
            size="sm"
          />
        </div>
      </div>
    </li>
  );
}

/**
 * The landing hero — a live manifest board, styled after a port departures
 * board. Not a headline over a gradient with three stat cards.
 *
 * Rows flip in with a split-flap reveal on load, then the board ticks forward
 * through the manifest every few seconds. This is the *only* orchestrated motion
 * in the product; everything else on the page is still, and
 * `prefers-reduced-motion` stops both the flap and the tick.
 */
export function ManifestBoard({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.manifest(locale),
    queryFn: () => api.manifest(locale, 12),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const rows = data?.rows ?? [];

  useEffect(() => {
    if (reducedMotion || rows.length <= VISIBLE_ROWS) return;
    const timer = setInterval(() => setOffset((current) => current + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, rows.length]);

  // Wrap around so the board never shows a short page.
  const visible =
    rows.length === 0
      ? []
      : Array.from({ length: Math.min(VISIBLE_ROWS, rows.length) }, (_, index) => {
          const row = rows[(offset + index) % rows.length];
          return row!;
        });

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="hairline-b flex items-baseline justify-between px-4 py-3">
        <h2 className="stencil text-xs text-ink">{t('manifest.title')}</h2>
        <p className="stencil tally text-[0.6875rem] text-ink-faint">
          {t('manifest.subtitle', { count: data?.totalActive ?? 0 })}
        </p>
      </div>

      <div className="hairline-b hidden px-4 py-1.5 sm:block">
        <div className={cn('stencil grid gap-x-3 text-[0.625rem] text-ink-faint', ROW_GRID)}>
          <span>{t('manifest.colCode')}</span>
          <span>{t('manifest.colCommodity')}</span>
          <span>{t('manifest.colRoute')}</span>
          <span className="sm:text-right">{t('manifest.colQty')}</span>
          <span className="sr-only">{t('manifest.colLane')}</span>
        </div>
      </div>

      {isPending ? (
        <p className="stencil px-4 py-6 text-xs text-ink-faint">{t('manifest.loading')}</p>
      ) : isError ? (
        <p className="px-4 py-6 text-sm text-lane-red">{t('manifest.error')}</p>
      ) : visible.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-muted">{t('manifest.empty')}</p>
      ) : (
        <ul aria-live="off">
          {visible.map((row, index) => (
            <ManifestRowView key={row.id} row={row} index={index} />
          ))}
        </ul>
      )}
    </Card>
  );
}
