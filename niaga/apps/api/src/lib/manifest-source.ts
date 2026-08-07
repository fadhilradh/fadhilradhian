import type {
  Certification,
  Lane,
  ListingSummary,
  Locale,
  ManifestResponse,
  ManifestRow,
} from '@niaga/contracts';
import { count, desc, eq, type Database } from '@niaga/db';
import { COMPANIES, LISTINGS } from '@niaga/db/fixtures';
import { companies, listings } from '@niaga/db/schema';

/**
 * Rows for the landing page's manifest board.
 *
 * Two implementations behind one signature: live listings when a database is
 * configured, seed fixtures when it is not. The fallback exists so the hero —
 * the thing phase 0 is for — renders on a clean checkout.
 */
export async function readManifest(
  db: Database | null,
  locale: Locale,
  limit: number,
): Promise<ManifestResponse> {
  return db ? readFromDatabase(db, locale, limit) : readFromFixtures(locale, limit);
}

async function readFromDatabase(
  db: Database,
  locale: Locale,
  limit: number,
): Promise<ManifestResponse> {
  const rows = await db
    .select({
      id: listings.id,
      kind: listings.kind,
      hsCode: listings.hsCode,
      titleId: listings.titleId,
      titleEn: listings.titleEn,
      originPort: listings.originPort,
      incoterm: listings.incoterm,
      quantity: listings.quantity,
      unit: listings.unit,
      lane: companies.verificationLane,
      publishedAt: listings.publishedAt,
    })
    .from(listings)
    .innerJoin(companies, eq(listings.companyId, companies.id))
    .where(eq(listings.status, 'active'))
    .orderBy(desc(listings.publishedAt), desc(listings.id))
    .limit(limit);

  const [totals] = await db
    .select({ total: count() })
    .from(listings)
    .where(eq(listings.status, 'active'));

  return {
    rows: rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      hsCode: row.hsCode,
      title: pickTitle(locale, row.titleId, row.titleEn),
      originPort: row.originPort,
      incoterm: row.incoterm,
      quantity: row.quantity,
      unit: row.unit,
      lane: row.lane,
      // `published_at` is nullable in the schema (drafts), but the status
      // filter above guarantees it is set for anything we return.
      publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    })),
    totalActive: totals?.total ?? 0,
  };
}

function readFromFixtures(locale: Locale, limit: number): ManifestResponse {
  const laneBySlug = new Map(COMPANIES.map((company) => [company.slug, company.verificationLane]));
  const now = Date.now();

  const rows: ManifestRow[] = [...LISTINGS]
    .sort((a, b) => a.publishedMinutesAgo - b.publishedMinutesAgo)
    .slice(0, limit)
    .map((listing, index) => ({
      // Stable, obviously-synthetic ids: nothing should try to fetch these.
      id: `fixture-${index}`,
      kind: listing.kind,
      hsCode: listing.hsCode,
      title: pickTitle(locale, listing.titleId, listing.titleEn),
      originPort: listing.originPort,
      incoterm: listing.incoterm,
      quantity: listing.quantity,
      unit: listing.unit,
      lane: laneBySlug.get(listing.companySlug) ?? 'red',
      publishedAt: new Date(now - listing.publishedMinutesAgo * 60_000).toISOString(),
    }));

  return { rows, totalActive: LISTINGS.length };
}

/** Bahasa Indonesia is the source of truth; English falls back to it. */
function pickTitle(locale: Locale, titleId: string, titleEn: string | null): string {
  if (locale === 'en' && titleEn) return titleEn;
  return titleId;
}

/**
 * Full listing cards for the landing strip and the browse feed.
 *
 * Phase 3 replaces this with the faceted `GET /v1/listings` — keyset paginated,
 * filtered in Postgres. Until then this returns the newest active listings and
 * the client narrows them, which is honest at seed-data volume and keeps the
 * card design reviewable now.
 */
export async function readRecentListings(
  db: Database | null,
  limit: number,
): Promise<ListingSummary[]> {
  return db ? recentFromDatabase(db, limit) : recentFromFixtures(limit);
}

async function recentFromDatabase(db: Database, limit: number): Promise<ListingSummary[]> {
  const rows = await db
    .select({
      id: listings.id,
      kind: listings.kind,
      titleId: listings.titleId,
      titleEn: listings.titleEn,
      hsCode: listings.hsCode,
      originPort: listings.originPort,
      destinationPort: listings.destinationPort,
      incoterm: listings.incoterm,
      quantity: listings.quantity,
      unit: listings.unit,
      moq: listings.moq,
      moqUnit: listings.moqUnit,
      priceMin: listings.priceMin,
      priceMax: listings.priceMax,
      currency: listings.currency,
      priceBasis: listings.priceBasis,
      leadTimeDays: listings.leadTimeDays,
      certifications: listings.certifications,
      publishedAt: listings.publishedAt,
      companyId: companies.id,
      companySlug: companies.slug,
      brandName: companies.brandName,
      legalName: companies.legalName,
      entityType: companies.entityType,
      province: companies.province,
      city: companies.city,
      lane: companies.verificationLane,
      verifiedAt: companies.verifiedAt,
    })
    .from(listings)
    .innerJoin(companies, eq(listings.companyId, companies.id))
    .where(eq(listings.status, 'active'))
    .orderBy(desc(listings.publishedAt), desc(listings.id))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    titleId: row.titleId,
    titleEn: row.titleEn,
    mark: {
      hsCode: row.hsCode,
      originPort: row.originPort,
      destinationPort: row.destinationPort,
      incoterm: row.incoterm,
      quantity: row.quantity,
      unit: row.unit,
    },
    moq: row.moq,
    moqUnit: row.moqUnit,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    currency: row.currency,
    priceBasis: row.priceBasis,
    leadTimeDays: row.leadTimeDays,
    certifications: (row.certifications ?? []) as Certification[],
    coverImageUrl: null,
    company: {
      id: row.companyId,
      slug: row.companySlug,
      brandName: row.brandName,
      legalName: row.legalName,
      entityType: row.entityType,
      province: row.province,
      city: row.city,
      verificationLane: row.lane,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
    },
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
  }));
}

function recentFromFixtures(limit: number): ListingSummary[] {
  const companyBySlug = new Map(COMPANIES.map((company) => [company.slug, company]));
  const now = Date.now();

  return [...LISTINGS]
    .sort((a, b) => a.publishedMinutesAgo - b.publishedMinutesAgo)
    .slice(0, limit)
    .map((listing, index) => {
      const company = companyBySlug.get(listing.companySlug);
      const lane: Lane = company?.verificationLane ?? 'red';

      return {
        id: `fixture-${index}`,
        kind: listing.kind,
        titleId: listing.titleId,
        titleEn: listing.titleEn,
        mark: {
          hsCode: listing.hsCode,
          originPort: listing.originPort,
          destinationPort: listing.destinationPort,
          incoterm: listing.incoterm,
          quantity: listing.quantity,
          unit: listing.unit,
        },
        moq: listing.moq,
        moqUnit: listing.moqUnit,
        priceMin: listing.priceMin,
        priceMax: listing.priceMax,
        currency: listing.currency,
        priceBasis: listing.priceBasis,
        leadTimeDays: listing.leadTimeDays,
        certifications: [...listing.certifications],
        coverImageUrl: null,
        company: {
          id: `fixture-company-${listing.companySlug}`,
          slug: listing.companySlug,
          brandName: company?.brandName ?? listing.companySlug,
          legalName: company?.legalName ?? listing.companySlug,
          entityType: company?.entityType ?? null,
          province: company?.province ?? null,
          city: company?.city ?? null,
          verificationLane: lane,
          verifiedAt: lane === 'red' ? null : new Date(now).toISOString(),
        },
        publishedAt: new Date(now - listing.publishedMinutesAgo * 60_000).toISOString(),
      };
    });
}
