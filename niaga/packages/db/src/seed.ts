import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';

import { CATEGORIES, COMPANIES, HS_CODES, LISTINGS, PORTS } from './fixtures.js';
import { createDatabase } from './index.js';
import { categories, companies, hsCodes, listings, ports } from './schema/index.js';

/**
 * Idempotent seed of the launch vertical's reference data plus a demo feed.
 * Safe to re-run: reference tables upsert on their natural key and listings are
 * matched on (company, title) so a re-run updates rather than duplicates.
 */
config({ path: '../../.env', quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL must be set to seed.');
  process.exit(1);
}

const db = createDatabase({ url, max: 1 });

for (const row of PORTS) {
  await db
    .insert(ports)
    .values(row)
    .onConflictDoUpdate({
      target: ports.unlocode,
      set: { name: row.name, province: row.province, type: row.type },
    });
}

for (const row of HS_CODES) {
  const values = {
    code: row.code,
    chapter: row.chapter,
    heading: row.heading,
    descriptionId: row.descriptionId,
    descriptionEn: row.descriptionEn,
    lartas: row.lartas,
    dutyNote: row.dutyNote ?? null,
  };
  await db.insert(hsCodes).values(values).onConflictDoUpdate({
    target: hsCodes.code,
    set: values,
  });
}

// Parents first: `categories.parent_id` points back at the same table.
const orderedCategories = [...CATEGORIES].sort(
  (a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)),
);

for (const row of orderedCategories) {
  await db
    .insert(categories)
    .values(row)
    .onConflictDoUpdate({
      target: categories.id,
      set: { nameId: row.nameId, nameEn: row.nameEn, sort: row.sort, parentId: row.parentId },
    });
}

const companyIdBySlug = new Map<string, string>();

for (const row of COMPANIES) {
  const values = {
    slug: row.slug,
    legalName: row.legalName,
    brandName: row.brandName,
    entityType: row.entityType,
    nib: row.nib,
    npwp: row.npwp,
    apiType: row.apiType,
    province: row.province,
    city: row.city,
    aboutId: row.aboutId,
    aboutEn: row.aboutEn,
    employeeRange: row.employeeRange,
    yearEstablished: row.yearEstablished,
    verificationLane: row.verificationLane,
    verifiedAt: row.verificationLane === 'red' ? null : new Date(),
  };

  const [upserted] = await db
    .insert(companies)
    .values(values)
    .onConflictDoUpdate({
      target: companies.slug,
      set: { ...values, updatedAt: new Date() },
    })
    .returning({ id: companies.id });

  if (upserted) companyIdBySlug.set(row.slug, upserted.id);
}

const now = Date.now();

for (const row of LISTINGS) {
  const companyId = companyIdBySlug.get(row.companySlug);
  if (!companyId) {
    console.error(`seed: no company for slug "${row.companySlug}" — skipping listing`);
    continue;
  }

  const publishedAt = new Date(now - row.publishedMinutesAgo * 60_000);

  const values = {
    companyId,
    kind: row.kind,
    titleId: row.titleId,
    titleEn: row.titleEn,
    descriptionId: row.descriptionId,
    descriptionEn: row.descriptionEn,
    hsCode: row.hsCode,
    categoryId: row.categoryId,
    quantity: row.quantity,
    unit: row.unit,
    moq: row.moq,
    moqUnit: row.moqUnit,
    capacityPerMonth: row.capacityPerMonth,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    currency: row.currency,
    priceBasis: row.priceBasis,
    incoterm: row.incoterm,
    originPort: row.originPort,
    destinationPort: row.destinationPort,
    leadTimeDays: row.leadTimeDays,
    certifications: [...row.certifications] as string[],
    packagingNote: row.packagingNote,
    status: 'active' as const,
    publishedAt,
    // 90-day shelf life; the expiry sweep in apps/worker enforces it.
    expiresAt: new Date(publishedAt.getTime() + 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.companyId, companyId), eq(listings.titleId, row.titleId)))
    .limit(1);

  if (existing) {
    await db.update(listings).set(values).where(eq(listings.id, existing.id));
  } else {
    await db.insert(listings).values(values);
  }
}

console.warn(
  `seed: ${PORTS.length} ports · ${HS_CODES.length} HS codes · ${CATEGORIES.length} categories · ` +
    `${COMPANIES.length} companies · ${LISTINGS.length} listings`,
);

process.exit(0);
