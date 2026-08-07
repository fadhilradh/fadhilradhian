import type { Lane } from '@niaga/contracts';

import { cn } from '../lib/cn.js';

/**
 * The verification badge, drawn as a customs lane chip.
 *
 * Indonesian customs sorts consignments into jalur hijau / kuning / merah, so
 * the colour vocabulary is already known to every trader on the platform. Red
 * is displayed, never suppressed: a marketplace that hides risk transfers it to
 * the buyer.
 */

const LANE_STYLES: Record<Lane, string> = {
  green: 'bg-lane-green-soft text-lane-green border-lane-green/40',
  amber: 'bg-lane-amber-soft text-lane-amber border-lane-amber/40',
  red: 'bg-lane-red-soft text-lane-red border-lane-red/40',
};

const LANE_DOT: Record<Lane, string> = {
  green: 'bg-lane-green',
  amber: 'bg-lane-amber',
  red: 'bg-lane-red',
};

export type LaneChipProps = {
  lane: Lane;
  /** Already-localised label, e.g. "Terverifikasi" or "Verified". */
  label: string;
  /** Longer explanation shown as the accessible title. */
  title?: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function LaneChip({ lane, label, title, size = 'md', className }: LaneChipProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-crate border',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.6875rem]' : 'px-2 py-1 text-xs',
        'stencil whitespace-nowrap',
        LANE_STYLES[lane],
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', LANE_DOT[lane])} />
      {label}
    </span>
  );
}

/** The three-lane legend. Used on the landing page and above search results. */
export function LaneLegend({
  items,
  className,
}: {
  items: { lane: Lane; label: string; meaning: string }[];
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-px bg-rule sm:grid-cols-3', className)}>
      {items.map((item) => (
        <div key={item.lane} className="bg-card px-4 py-3">
          <dt>
            <LaneChip lane={item.lane} label={item.label} />
          </dt>
          <dd className="mt-2 text-sm text-ink-muted">{item.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
