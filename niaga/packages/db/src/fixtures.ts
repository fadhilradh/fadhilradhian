import type { Certification, Currency, Incoterm, Lane, ListingKind, Unit } from '@niaga/contracts';

import type { LartasFlags } from './schema/trade.js';

/**
 * Launch-vertical reference data: agri-commodities (see DECISIONS.md §1).
 *
 * Used in two places on purpose — `src/seed.ts` writes it to Postgres, and the
 * API falls back to it when DATABASE_URL is unset, so `pnpm dev` shows a
 * working manifest board with no database. One source of truth for both.
 */

export type PortFixture = {
  unlocode: string;
  name: string;
  province: string;
  type: 'sea' | 'air' | 'dry';
};

export const PORTS: PortFixture[] = [
  { unlocode: 'IDJKT', name: 'Tanjung Priok', province: 'DKI Jakarta', type: 'sea' },
  { unlocode: 'IDSUB', name: 'Tanjung Perak', province: 'Jawa Timur', type: 'sea' },
  { unlocode: 'IDSRG', name: 'Tanjung Emas', province: 'Jawa Tengah', type: 'sea' },
  { unlocode: 'IDBLW', name: 'Belawan', province: 'Sumatera Utara', type: 'sea' },
  { unlocode: 'IDPDG', name: 'Teluk Bayur', province: 'Sumatera Barat', type: 'sea' },
  { unlocode: 'IDPLM', name: 'Boom Baru Palembang', province: 'Sumatera Selatan', type: 'sea' },
  { unlocode: 'IDPNJ', name: 'Panjang', province: 'Lampung', type: 'sea' },
  { unlocode: 'IDUPG', name: 'Soekarno-Hatta Makassar', province: 'Sulawesi Selatan', type: 'sea' },
  { unlocode: 'IDBIT', name: 'Bitung', province: 'Sulawesi Utara', type: 'sea' },
  { unlocode: 'IDBTM', name: 'Batu Ampar Batam', province: 'Kepulauan Riau', type: 'sea' },
  { unlocode: 'IDPNK', name: 'Dwikora Pontianak', province: 'Kalimantan Barat', type: 'sea' },
  { unlocode: 'IDBDJ', name: 'Trisakti Banjarmasin', province: 'Kalimantan Selatan', type: 'sea' },
  { unlocode: 'IDAMQ', name: 'Yos Sudarso Ambon', province: 'Maluku', type: 'sea' },
  { unlocode: 'IDKOE', name: 'Tenau Kupang', province: 'Nusa Tenggara Timur', type: 'sea' },
  { unlocode: 'IDCGK', name: 'Soekarno-Hatta (kargo udara)', province: 'Banten', type: 'air' },
];

export type HsCodeFixture = {
  code: string;
  chapter: string;
  heading: string;
  descriptionId: string;
  descriptionEn: string;
  lartas: LartasFlags | null;
  dutyNote?: string;
};

export const HS_CODES: HsCodeFixture[] = [
  {
    code: '09011100',
    chapter: '09',
    heading: '0901',
    descriptionId: 'Kopi, tidak digongseng, tidak dihilangkan kafeinnya',
    descriptionEn: 'Coffee, not roasted, not decaffeinated',
    lartas: {
      exportPermitRequired: true,
      note: 'Ekspor kopi memerlukan pengakuan Eksportir Terdaftar Kopi (ETK) / Registered Coffee Exporter recognition required.',
    },
  },
  {
    code: '09012100',
    chapter: '09',
    heading: '0901',
    descriptionId: 'Kopi, digongseng, tidak dihilangkan kafeinnya',
    descriptionEn: 'Coffee, roasted, not decaffeinated',
    lartas: null,
  },
  {
    code: '18010000',
    chapter: '18',
    heading: '1801',
    descriptionId: 'Biji kakao, utuh atau pecah, mentah atau digongseng',
    descriptionEn: 'Cocoa beans, whole or broken, raw or roasted',
    lartas: null,
    dutyNote:
      'Bea keluar berlaku sesuai harga referensi / Export duty applies per reference price.',
  },
  {
    code: '18040000',
    chapter: '18',
    heading: '1804',
    descriptionId: 'Lemak dan minyak kakao',
    descriptionEn: 'Cocoa butter, fat and oil',
    lartas: null,
  },
  {
    code: '09071000',
    chapter: '09',
    heading: '0907',
    descriptionId: 'Cengkeh, utuh (buah, bunga dan tangkai)',
    descriptionEn: 'Cloves, whole (fruit, flowers and stems)',
    lartas: null,
  },
  {
    code: '09081100',
    chapter: '09',
    heading: '0908',
    descriptionId: 'Buah pala, dalam kulit',
    descriptionEn: 'Nutmeg, in shell',
    lartas: null,
  },
  {
    code: '09061100',
    chapter: '09',
    heading: '0906',
    descriptionId: 'Kayu manis (Cinnamomum zeylanicum Blume)',
    descriptionEn: 'Cinnamon (Cinnamomum zeylanicum Blume)',
    lartas: null,
  },
  {
    code: '09041100',
    chapter: '09',
    heading: '0904',
    descriptionId: 'Lada, tidak dihancurkan atau ditumbuk',
    descriptionEn: 'Pepper, neither crushed nor ground',
    lartas: null,
  },
  {
    code: '09101100',
    chapter: '09',
    heading: '0910',
    descriptionId: 'Jahe, tidak dihancurkan atau ditumbuk',
    descriptionEn: 'Ginger, neither crushed nor ground',
    lartas: null,
  },
  {
    code: '08011100',
    chapter: '08',
    heading: '0801',
    descriptionId: 'Kelapa, dikeringkan (desiccated)',
    descriptionEn: 'Coconuts, desiccated',
    lartas: null,
  },
  {
    code: '08011900',
    chapter: '08',
    heading: '0801',
    descriptionId: 'Kelapa segar lainnya, termasuk kelapa bulat',
    descriptionEn: 'Coconuts, fresh, other (including whole coconut)',
    lartas: null,
  },
  {
    code: '15131100',
    chapter: '15',
    heading: '1513',
    descriptionId: 'Minyak kelapa mentah (crude coconut oil)',
    descriptionEn: 'Crude coconut (copra) oil',
    lartas: null,
  },
  {
    code: '12122100',
    chapter: '12',
    heading: '1212',
    descriptionId: 'Rumput laut dan alga lainnya, cocok untuk konsumsi manusia',
    descriptionEn: 'Seaweeds and other algae, fit for human consumption',
    lartas: null,
  },
  {
    code: '13023900',
    chapter: '13',
    heading: '1302',
    descriptionId: 'Bahan lendir dan pengental lainnya, termasuk karagenan',
    descriptionEn: 'Mucilages and thickeners, other (including carrageenan)',
    lartas: null,
  },
];

export type CategoryFixture = {
  id: string;
  parentId: string | null;
  nameId: string;
  nameEn: string;
  sort: number;
};

export const CATEGORIES: CategoryFixture[] = [
  {
    id: 'agri',
    parentId: null,
    nameId: 'Komoditas Pertanian',
    nameEn: 'Agri-commodities',
    sort: 0,
  },
  { id: 'agri-coffee', parentId: 'agri', nameId: 'Kopi', nameEn: 'Coffee', sort: 1 },
  { id: 'agri-cocoa', parentId: 'agri', nameId: 'Kakao', nameEn: 'Cocoa', sort: 2 },
  { id: 'agri-spices', parentId: 'agri', nameId: 'Rempah', nameEn: 'Spices', sort: 3 },
  { id: 'agri-coconut', parentId: 'agri', nameId: 'Kelapa', nameEn: 'Coconut', sort: 4 },
  { id: 'agri-seaweed', parentId: 'agri', nameId: 'Rumput Laut', nameEn: 'Seaweed', sort: 5 },
];

export type CompanyFixture = {
  slug: string;
  legalName: string;
  brandName: string;
  entityType: 'PT' | 'CV' | 'UD' | 'Koperasi' | 'Perorangan';
  nib: string | null;
  npwp: string | null;
  apiType: 'API-U' | 'API-P' | null;
  province: string;
  city: string;
  yearEstablished: number;
  employeeRange: string;
  aboutId: string;
  aboutEn: string;
  verificationLane: Lane;
};

export const COMPANIES: CompanyFixture[] = [
  {
    slug: 'kopi-gayo-mandiri',
    legalName: 'Koperasi Produsen Kopi Gayo Mandiri',
    brandName: 'Gayo Mandiri',
    entityType: 'Koperasi',
    nib: '8120114820391',
    npwp: '021456789012000',
    apiType: null,
    province: 'Aceh',
    city: 'Takengon',
    yearEstablished: 2011,
    employeeRange: '51-200',
    aboutId:
      'Koperasi 340 petani arabika di dataran tinggi Gayo. Pengolahan basah terpusat, penjemuran para-para, dan gudang berpendingin di Takengon.',
    aboutEn:
      'A 340-farmer arabica cooperative in the Gayo highlands. Centralised wet mill, raised-bed drying, and a temperature-controlled warehouse in Takengon.',
    verificationLane: 'green',
  },
  {
    slug: 'nusantara-kakao-jaya',
    legalName: 'PT Nusantara Kakao Jaya',
    brandName: 'Nusantara Kakao',
    entityType: 'PT',
    nib: '9120301472284',
    npwp: '017654321098000',
    apiType: 'API-P',
    province: 'Sulawesi Selatan',
    city: 'Makassar',
    yearEstablished: 2016,
    employeeRange: '11-50',
    aboutId:
      'Pengumpul dan pengolah biji kakao fermentasi dari Luwu dan Polman. Kapasitas fermentasi 120 MT per bulan.',
    aboutEn:
      'Aggregator and processor of fermented cocoa beans from Luwu and Polman. Fermentation capacity 120 MT per month.',
    verificationLane: 'green',
  },
  {
    slug: 'rempah-maluku-sejahtera',
    legalName: 'CV Rempah Maluku Sejahtera',
    brandName: 'Rempah Maluku',
    entityType: 'CV',
    nib: '8120117739011',
    npwp: '031122334455000',
    apiType: null,
    province: 'Maluku',
    city: 'Ambon',
    yearEstablished: 2019,
    employeeRange: '11-50',
    aboutId:
      'Cengkeh dan pala dari Seram dan Banda. Sortasi manual, kadar air terukur per lot, pengiriman via Ambon.',
    aboutEn:
      'Cloves and nutmeg from Seram and Banda. Hand-sorted, moisture measured per lot, shipped out of Ambon.',
    verificationLane: 'amber',
  },
  {
    slug: 'kelapa-sulawesi-utara',
    legalName: 'UD Kelapa Sulawesi Utara',
    brandName: 'Kelapa Bitung',
    entityType: 'UD',
    nib: null,
    npwp: '045566778899000',
    apiType: null,
    province: 'Sulawesi Utara',
    city: 'Bitung',
    yearEstablished: 2021,
    employeeRange: '1-10',
    aboutId:
      'Kelapa bulat dan minyak kelapa mentah dari Minahasa. Pengiriman kontainer dari Bitung.',
    aboutEn:
      'Whole coconuts and crude coconut oil from Minahasa. Container shipments out of Bitung.',
    verificationLane: 'amber',
  },
  {
    slug: 'samudra-rumput-laut',
    legalName: 'PT Samudra Rumput Laut Timur',
    brandName: 'Samudra Rumput Laut',
    entityType: 'PT',
    nib: null,
    npwp: null,
    apiType: null,
    province: 'Nusa Tenggara Timur',
    city: 'Kupang',
    yearEstablished: 2023,
    employeeRange: '1-10',
    aboutId:
      'Budidaya Eucheuma cottonii di perairan Rote dan Semau. Baru mendaftar, dokumen belum diunggah.',
    aboutEn:
      'Eucheuma cottonii cultivation off Rote and Semau. Newly registered, documents not yet uploaded.',
    verificationLane: 'red',
  },
  {
    slug: 'aroma-kepulauan-indonesia',
    legalName: 'PT Aroma Kepulauan Indonesia',
    brandName: 'Aroma Kepulauan',
    entityType: 'PT',
    nib: '9120204418822',
    npwp: '099887766554000',
    apiType: 'API-U',
    province: 'Jawa Timur',
    city: 'Surabaya',
    yearEstablished: 2014,
    employeeRange: '51-200',
    aboutId:
      'Rumah pengolahan rempah dan kopi untuk pasar Eropa dan Timur Tengah. Mencari pasokan tetap dari produsen terverifikasi.',
    aboutEn:
      'Spice and coffee processing house serving European and Middle Eastern buyers. Looking for steady supply from verified producers.',
    verificationLane: 'green',
  },
];

export type ListingFixture = {
  companySlug: string;
  kind: ListingKind;
  titleId: string;
  titleEn: string;
  descriptionId: string;
  descriptionEn: string;
  hsCode: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  moq: number;
  moqUnit: Unit;
  capacityPerMonth: number | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: Currency;
  priceBasis: string;
  incoterm: Incoterm;
  originPort: string | null;
  destinationPort: string | null;
  leadTimeDays: number;
  certifications: Certification[];
  packagingNote: string;
  /** Minutes before "now", so the seeded feed always looks freshly published. */
  publishedMinutesAgo: number;
};

export const LISTINGS: ListingFixture[] = [
  {
    companySlug: 'kopi-gayo-mandiri',
    kind: 'offer',
    titleId: 'Kopi Arabika Gayo — Grade 1, fully washed',
    titleEn: 'Gayo Arabica Green Beans — Grade 1, fully washed',
    descriptionId:
      'Panen 2025/2026. Kadar air 11–12%, cacat maksimal 5 per 300 g, screen 16 ke atas. Cupping score 84–86. Tersedia lot mikro dari koperasi anggota.',
    descriptionEn:
      '2025/2026 harvest. Moisture 11–12%, max 5 defects per 300 g, screen 16 up. Cupping 84–86. Micro-lots available from member cooperatives.',
    hsCode: '09011100',
    categoryId: 'agri-coffee',
    quantity: 18,
    unit: 'MT',
    moq: 1,
    moqUnit: 'MT',
    capacityPerMonth: 40,
    priceMin: 5.6,
    priceMax: 6.4,
    currency: 'USD',
    priceBasis: 'per KG, FOB Belawan',
    incoterm: 'FOB',
    originPort: 'IDBLW',
    destinationPort: null,
    leadTimeDays: 21,
    certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
    packagingNote: 'Karung goni 60 kg dengan GrainPro liner / 60 kg jute with GrainPro liner.',
    publishedMinutesAgo: 34,
  },
  {
    companySlug: 'nusantara-kakao-jaya',
    kind: 'offer',
    titleId: 'Biji Kakao Fermentasi Sulawesi — kadar air 7%',
    titleEn: 'Fermented Sulawesi Cocoa Beans — 7% moisture',
    descriptionId:
      'Fermentasi 5 hari, penjemuran matahari penuh. Bean count 95–105 per 100 g. Fat content 54%. Lot dari Luwu Utara dan Polewali Mandar.',
    descriptionEn:
      'Five-day fermentation, full sun drying. Bean count 95–105 per 100 g. Fat content 54%. Lots from Luwu Utara and Polewali Mandar.',
    hsCode: '18010000',
    categoryId: 'agri-cocoa',
    quantity: 2,
    unit: 'TEU',
    moq: 1,
    moqUnit: 'TEU',
    capacityPerMonth: 120,
    priceMin: 8200,
    priceMax: 8900,
    currency: 'USD',
    priceBasis: 'per MT, CIF Rotterdam',
    incoterm: 'CIF',
    originPort: 'IDUPG',
    destinationPort: null,
    leadTimeDays: 30,
    certifications: ['HACCP', 'ISO 22000'],
    packagingNote: 'Karung jute 62,5 kg, palletised / 62.5 kg jute bags, palletised.',
    publishedMinutesAgo: 71,
  },
  {
    companySlug: 'rempah-maluku-sejahtera',
    kind: 'offer',
    titleId: 'Cengkeh Kering Seram — sortasi tangan',
    titleEn: 'Dried Seram Cloves — hand sorted',
    descriptionId:
      'Kadar air 12%, batang maksimal 3%, kandungan minyak 17–19%. Panen Agustus. Sortasi tangan di Ambon.',
    descriptionEn:
      'Moisture 12%, max 3% stems, oil content 17–19%. August harvest. Hand sorted in Ambon.',
    hsCode: '09071000',
    categoryId: 'agri-spices',
    quantity: 12,
    unit: 'MT',
    moq: 500,
    moqUnit: 'KG',
    capacityPerMonth: 25,
    priceMin: 7.2,
    priceMax: 8.1,
    currency: 'USD',
    priceBasis: 'per KG, FOB Ambon',
    incoterm: 'FOB',
    originPort: 'IDAMQ',
    destinationPort: null,
    leadTimeDays: 28,
    certifications: ['Organic'],
    packagingNote: 'Karung PP berlapis 50 kg / 50 kg lined PP bags.',
    publishedMinutesAgo: 118,
  },
  {
    companySlug: 'kelapa-sulawesi-utara',
    kind: 'offer',
    titleId: 'Kelapa Bulat Minahasa — kupas serat',
    titleEn: 'Whole Minahasa Coconuts — husked',
    descriptionId:
      'Umur 11–12 bulan, berat 1,2–1,6 kg per butir. Muat 12.000–14.000 butir per kontainer 40 ft.',
    descriptionEn: '11–12 months old, 1.2–1.6 kg each. 12,000–14,000 nuts per 40 ft container.',
    hsCode: '08011900',
    categoryId: 'agri-coconut',
    quantity: 2,
    unit: 'TEU',
    moq: 1,
    moqUnit: 'TEU',
    capacityPerMonth: 8,
    priceMin: 0.28,
    priceMax: 0.34,
    currency: 'USD',
    priceBasis: 'per butir, CIF / per nut, CIF',
    incoterm: 'CIF',
    originPort: 'IDBIT',
    destinationPort: null,
    leadTimeDays: 18,
    certifications: [],
    packagingNote: 'Curah dalam kontainer berventilasi / Loose in ventilated container.',
    publishedMinutesAgo: 186,
  },
  {
    companySlug: 'samudra-rumput-laut',
    kind: 'offer',
    titleId: 'Rumput Laut Kering Eucheuma cottonii — Rote',
    titleEn: 'Dried Eucheuma cottonii Seaweed — Rote',
    descriptionId:
      'Kadar air 35%, kotoran maksimal 5%, karagenan 28–32%. Panen 45 hari. Belum ada sertifikasi.',
    descriptionEn:
      'Moisture 35%, max 5% impurities, carrageenan 28–32%. 45-day cycle. No certification yet.',
    hsCode: '12122100',
    categoryId: 'agri-seaweed',
    quantity: 40,
    unit: 'MT',
    moq: 5,
    moqUnit: 'MT',
    capacityPerMonth: 60,
    priceMin: 1.05,
    priceMax: 1.3,
    currency: 'USD',
    priceBasis: 'per KG, FOB Kupang',
    incoterm: 'FOB',
    originPort: 'IDKOE',
    destinationPort: null,
    leadTimeDays: 25,
    certifications: [],
    packagingNote: 'Bal terpress 100 kg / 100 kg pressed bales.',
    publishedMinutesAgo: 240,
  },
  {
    companySlug: 'kopi-gayo-mandiri',
    kind: 'offer',
    titleId: 'Kopi Arabika Gayo Natural — lot mikro 3 MT',
    titleEn: 'Gayo Natural Arabica — 3 MT micro-lot',
    descriptionId:
      'Proses natural, penjemuran 21 hari di para-para. Cupping 86,5, catatan tropis dan gula merah.',
    descriptionEn:
      'Natural process, 21 days on raised beds. Cupping 86.5, tropical fruit and palm sugar notes.',
    hsCode: '09011100',
    categoryId: 'agri-coffee',
    quantity: 3,
    unit: 'MT',
    moq: 300,
    moqUnit: 'KG',
    capacityPerMonth: 6,
    priceMin: 8.4,
    priceMax: 9.2,
    currency: 'USD',
    priceBasis: 'per KG, FOB Belawan',
    incoterm: 'FOB',
    originPort: 'IDBLW',
    destinationPort: null,
    leadTimeDays: 21,
    certifications: ['Organic'],
    packagingNote: 'Vacuum 25 kg dalam karton / 25 kg vacuum in cartons.',
    publishedMinutesAgo: 305,
  },
  {
    companySlug: 'aroma-kepulauan-indonesia',
    kind: 'request',
    titleId: 'Dicari: Lada Hitam Lampung 24 MT per bulan',
    titleEn: 'Wanted: Lampung Black Pepper, 24 MT per month',
    descriptionId:
      'Kontrak 12 bulan. Spesifikasi ASTA, kadar air maksimal 12%, bulk density 550 g/l. Pembayaran LC at sight.',
    descriptionEn:
      '12-month contract. ASTA spec, max 12% moisture, 550 g/l bulk density. Payment by LC at sight.',
    hsCode: '09041100',
    categoryId: 'agri-spices',
    quantity: 24,
    unit: 'MT',
    moq: 6,
    moqUnit: 'MT',
    capacityPerMonth: null,
    priceMin: null,
    priceMax: null,
    currency: 'USD',
    priceBasis: 'Penawaran terbuka / Open to offers',
    incoterm: 'EXW',
    originPort: 'IDPNJ',
    destinationPort: 'IDSUB',
    leadTimeDays: 14,
    certifications: ['HACCP'],
    packagingNote: 'Karung PP 50 kg / 50 kg PP bags.',
    publishedMinutesAgo: 402,
  },
  {
    companySlug: 'aroma-kepulauan-indonesia',
    kind: 'request',
    titleId: 'Dicari: Pala Banda utuh, 6 MT',
    titleEn: 'Wanted: Whole Banda Nutmeg, 6 MT',
    descriptionId:
      'Sound Whole Nutmeg, kadar air maksimal 10%, bebas aflatoksin. Butuh laporan lab per lot.',
    descriptionEn:
      'Sound Whole Nutmeg, max 10% moisture, aflatoxin free. Lab report required per lot.',
    hsCode: '09081100',
    categoryId: 'agri-spices',
    quantity: 6,
    unit: 'MT',
    moq: 2,
    moqUnit: 'MT',
    capacityPerMonth: null,
    priceMin: null,
    priceMax: null,
    currency: 'USD',
    priceBasis: 'Penawaran terbuka / Open to offers',
    incoterm: 'FOB',
    originPort: 'IDAMQ',
    destinationPort: 'IDSUB',
    leadTimeDays: 30,
    certifications: ['HACCP', 'ISO 22000'],
    packagingNote: 'Karung jute 40 kg / 40 kg jute bags.',
    publishedMinutesAgo: 511,
  },
  {
    companySlug: 'kelapa-sulawesi-utara',
    kind: 'offer',
    titleId: 'Minyak Kelapa Mentah (CNO) — 21 MT flexitank',
    titleEn: 'Crude Coconut Oil (CNO) — 21 MT flexitank',
    descriptionId: 'FFA maksimal 3%, kadar air 0,2%, IV 7–11. Pengapalan flexitank dari Bitung.',
    descriptionEn: 'FFA max 3%, moisture 0.2%, IV 7–11. Flexitank shipment out of Bitung.',
    hsCode: '15131100',
    categoryId: 'agri-coconut',
    quantity: 21,
    unit: 'MT',
    moq: 21,
    moqUnit: 'MT',
    capacityPerMonth: 42,
    priceMin: 1420,
    priceMax: 1520,
    currency: 'USD',
    priceBasis: 'per MT, FOB Bitung',
    incoterm: 'FOB',
    originPort: 'IDBIT',
    destinationPort: null,
    leadTimeDays: 24,
    certifications: [],
    packagingNote: 'Flexitank 21 MT dalam kontainer 20 ft / 21 MT flexitank in 20 ft container.',
    publishedMinutesAgo: 640,
  },
  {
    companySlug: 'rempah-maluku-sejahtera',
    kind: 'offer',
    titleId: 'Kayu Manis Kupasan AA — Sumatera Barat',
    titleEn: 'Cassia Vera AA Quills — West Sumatra',
    descriptionId:
      'Panjang 30 cm, kadar minyak 2,5%, kadar air 14%. Dikemas ulang di Ambon dari Kerinci.',
    descriptionEn:
      '30 cm length, 2.5% oil content, 14% moisture. Repacked in Ambon from Kerinci origin.',
    hsCode: '09061100',
    categoryId: 'agri-spices',
    quantity: 9,
    unit: 'MT',
    moq: 1,
    moqUnit: 'MT',
    capacityPerMonth: 18,
    priceMin: 2.9,
    priceMax: 3.4,
    currency: 'USD',
    priceBasis: 'per KG, FOB Teluk Bayur',
    incoterm: 'FOB',
    originPort: 'IDPDG',
    destinationPort: null,
    leadTimeDays: 26,
    certifications: ['Organic', 'HACCP'],
    packagingNote: 'Bal terpress 50 kg / 50 kg pressed bales.',
    publishedMinutesAgo: 795,
  },
];
