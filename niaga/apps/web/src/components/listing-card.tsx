import type { ListingSummary } from '@niaga/contracts';
import { Badge, Button, Card, LaneChip, ShippingMark } from '@niaga/ui';

import { formatPriceRange, formatQuantity, formatRelativeTime } from '../lib/format.js';
import { useI18n } from '../lib/i18n.js';
import { laneLabel, laneMeaning } from '../lib/lanes.js';

/**
 * The listing card.
 *
 * Two things make it unmistakable: the lane chip (verification is never hidden
 * behind a settings page) and the stencilled shipping-mark block, set the way
 * real cargo is marked. Everything else is hairlines and tabular numbers.
 */
export function ListingCard({ listing }: { listing: ListingSummary }) {
  const { locale, t } = useI18n();

  const title = locale === 'en' && listing.titleEn ? listing.titleEn : listing.titleId;
  const quantity = formatQuantity(locale, listing.mark.quantity, listing.mark.unit);
  const moq = formatQuantity(locale, listing.moq, listing.moqUnit);
  const price = formatPriceRange(locale, listing.priceMin, listing.priceMax, listing.currency);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <Badge>{listing.kind === 'offer' ? t('listing.offer') : t('listing.request')}</Badge>
        <LaneChip
          lane={listing.company.verificationLane}
          label={laneLabel(listing.company.verificationLane, t)}
          title={laneMeaning(listing.company.verificationLane, t)}
          size="sm"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-3">
        <div>
          <h3 className="text-base leading-snug font-medium text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {listing.company.brandName}
            {listing.company.city ? ` · ${listing.company.city}` : ''}
            {listing.company.province ? `, ${listing.company.province}` : ''}
          </p>
        </div>

        <ShippingMark mark={listing.mark} quantityLabel={quantity} className="self-start" />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <div className="col-span-2">
            <dt className="sr-only">{listing.priceBasis ?? t('listing.priceOnRequest')}</dt>
            <dd className="tally font-mono text-base text-ink">
              {price ?? <span className="text-ink-muted">{t('listing.priceOnRequest')}</span>}
            </dd>
            {price && listing.priceBasis ? (
              <p className="text-xs text-ink-faint">{listing.priceBasis}</p>
            ) : null}
          </div>

          {moq ? (
            <div>
              <dt className="stencil text-[0.625rem] text-ink-faint">{t('listing.moq')}</dt>
              <dd className="tally font-mono text-sm text-ink">{moq}</dd>
            </div>
          ) : null}

          {listing.leadTimeDays !== null ? (
            <div>
              <dt className="stencil text-[0.625rem] text-ink-faint">{t('listing.leadTime')}</dt>
              <dd className="tally font-mono text-sm text-ink">
                {t('listing.leadTimeDays', { days: listing.leadTimeDays })}
              </dd>
            </div>
          ) : null}
        </dl>

        {listing.certifications.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {listing.certifications.map((certification) => (
              <li key={certification}>
                <Badge>{certification}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="hairline-t flex items-center justify-between gap-2 px-4 py-2.5">
        <p className="stencil text-[0.625rem] text-ink-faint">
          {formatRelativeTime(listing.publishedAt, t)}
        </p>
        <Button variant="secondary" size="sm">
          {t('listing.openInquiry')}
        </Button>
      </div>
    </Card>
  );
}
