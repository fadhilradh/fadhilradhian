import type { Currency, Locale, Unit } from '@niaga/contracts';

import type { Translate } from './i18n.js';

const LOCALE_TAG: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };

/** Quantities read as "18 MT", "2 TEU" — unit stays uppercase and unlocalised
 *  because it is trade shorthand, not a word. */
export function formatQuantity(
  locale: Locale,
  quantity: number | null,
  unit: Unit | null,
): string | null {
  if (quantity === null || unit === null) return null;
  const value = new Intl.NumberFormat(LOCALE_TAG[locale], {
    maximumFractionDigits: quantity < 10 ? 2 : 0,
  }).format(quantity);
  return `${value} ${unit}`;
}

/**
 * Price ranges. USD gets two decimals for per-kg pricing; IDR gets none,
 * because rupiah cents do not exist in practice.
 */
export function formatPriceRange(
  locale: Locale,
  min: number | null,
  max: number | null,
  currency: Currency | null,
): string | null {
  if (min === null && max === null) return null;
  if (!currency) return null;

  const fractionDigits = currency === 'IDR' ? 0 : min !== null && min < 100 ? 2 : 0;
  const format = new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  if (min !== null && max !== null && min !== max) {
    return `${format.format(min)} – ${format.format(max)}`;
  }
  return format.format(min ?? max ?? 0);
}

/** Coarse relative time. Nothing on this platform needs second precision. */
export function formatRelativeTime(isoDate: string, t: Translate): string {
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - Date.parse(isoDate)) / 60_000));

  if (elapsedMinutes < 2) return t('time.justNow');
  if (elapsedMinutes < 60) return t('time.minutes', { count: elapsedMinutes });

  const hours = Math.round(elapsedMinutes / 60);
  if (hours < 24) return t('time.hours', { count: hours });

  return t('time.days', { count: Math.round(hours / 24) });
}
