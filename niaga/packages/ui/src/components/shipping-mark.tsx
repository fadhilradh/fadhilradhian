import { formatHsCode, type ShippingMark as ShippingMarkData } from '@niaga/contracts';

import { cn } from '../lib/cn.js';

/**
 * The second signature element, carried through the whole app.
 *
 * Real cargo is marked with a stencilled block: code, port, terms, quantity.
 * Every listing card wears one, which is the reason a Niaga card cannot be
 * mistaken for a generic marketplace card.
 */
export type ShippingMarkProps = {
  mark: ShippingMarkData;
  /** Localised quantity string, e.g. "18 MT". Passed in so number formatting
   *  stays with the locale-aware caller. */
  quantityLabel?: string | null;
  className?: string;
};

export function ShippingMark({ mark, quantityLabel, className }: ShippingMarkProps) {
  const route = [mark.originPort, mark.destinationPort].filter(Boolean).join(' → ');

  return (
    <div
      className={cn(
        'inline-block border-y-2 border-rule-strong px-2 py-1.5 text-ink-muted select-none',
        className,
      )}
      aria-label={`Shipping mark: HS ${formatHsCode(mark.hsCode)}${route ? `, ${route}` : ''}`}
    >
      <div className="stencil text-xs text-ink">{formatHsCode(mark.hsCode)}</div>
      <div className="stencil mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.6875rem]">
        {route ? <span>{route || '—'}</span> : <span className="text-ink-faint">NO PORT</span>}
        {mark.incoterm ? <span>{mark.incoterm}</span> : null}
        {quantityLabel ? <span className="tally text-ink">{quantityLabel}</span> : null}
      </div>
    </div>
  );
}
