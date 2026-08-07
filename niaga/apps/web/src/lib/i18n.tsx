import { localeSchema, type Locale } from '@niaga/contracts';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'niaga.locale';

/**
 * Bahasa Indonesia is the default and the source of truth; English is a
 * first-class toggle rather than an afterthought, because foreign buyers are a
 * launch target (DECISIONS.md §2).
 *
 * Deliberately hand-rolled: at this size a dictionary and a `t()` beat pulling
 * in i18next, and the flat key shape is what a real i18n library would want if
 * we ever migrate.
 */
const id = {
  'nav.browse': 'Telusuri',
  'nav.post': 'Pasang penawaran',
  'nav.signIn': 'Masuk',
  'nav.signUp': 'Daftar',
  'nav.theme': 'Ganti tema',
  'nav.locale': 'Ganti bahasa',
  'nav.menu': 'Menu',

  'hero.title.1': 'Cari pembeli.',
  'hero.title.2': 'Cari pemasok.',
  'hero.title.3': 'Tanpa menebak-nebak siapa yang nyata.',
  'hero.lede':
    'Niaga menghubungkan eksportir Indonesia dengan pembeli, dan importir dengan pemasok. Status verifikasi perusahaan terlihat di setiap listing — termasuk yang belum terverifikasi.',
  'hero.ctaPost': 'Pasang penawaran',
  'hero.ctaBrowse': 'Telusuri {count} listing',
  'hero.vertical': 'Mulai dari komoditas pertanian: kopi, kakao, rempah, kelapa, rumput laut.',

  'manifest.title': 'Manifest · Langsung',
  'manifest.subtitle': '{count} listing aktif',
  'manifest.loading': 'Memuat manifest…',
  'manifest.error': 'Manifest tidak dapat dimuat. Coba muat ulang halaman.',
  'manifest.empty': 'Belum ada listing aktif.',
  'manifest.colCode': 'Kode',
  'manifest.colCommodity': 'Komoditas',
  'manifest.colRoute': 'Rute',
  'manifest.colQty': 'Jumlah',
  'manifest.colLane': 'Jalur',

  'lane.green': 'Jalur Hijau',
  'lane.amber': 'Jalur Kuning',
  'lane.red': 'Jalur Merah',
  'lane.green.meaning': 'NIB, NPWP, dan API sudah diperiksa. Identitas perusahaan terkonfirmasi.',
  'lane.amber.meaning': 'Sebagian dokumen terverifikasi. Sebagian belum diunggah atau kedaluwarsa.',
  'lane.red.meaning': 'Belum ada dokumen terverifikasi. Kami tampilkan, bukan sembunyikan.',
  'lane.section.title': 'Sistem jalur verifikasi',
  'lane.section.lede':
    'Bea Cukai memilah kiriman ke jalur hijau, kuning, dan merah. Niaga memakai kosakata yang sama untuk status perusahaan, karena setiap pedagang sudah tahu artinya.',

  'listing.offer': 'Penawaran',
  'listing.request': 'Permintaan',
  'listing.moq': 'Minimum',
  'listing.leadTime': 'Siap kirim',
  'listing.leadTimeDays': '{days} hari',
  'listing.priceOnRequest': 'Harga atas permintaan',
  'listing.openInquiry': 'Ajukan pertanyaan',
  'listing.viewCompany': 'Lihat perusahaan',

  'recent.title': 'Listing terbaru',
  'recent.lede': 'Setiap kartu membawa blok tanda kirim: kode HS, pelabuhan, incoterm, jumlah.',
  'recent.viewAll': 'Lihat semua',

  'browse.title': 'Telusuri listing',
  'browse.filters': 'Saringan',
  'browse.kind': 'Jenis',
  'browse.kind.all': 'Semua',
  'browse.lane': 'Jalur verifikasi',
  'browse.lane.all': 'Semua jalur',
  'browse.incoterm': 'Incoterm',
  'browse.incoterm.all': 'Semua incoterm',
  'browse.province': 'Provinsi',
  'browse.province.all': 'Semua provinsi',
  'browse.search': 'Cari komoditas atau kode HS',
  'browse.searchPlaceholder': 'kopi arabika, 0901…',
  'browse.results': '{count} hasil',
  'browse.clear': 'Bersihkan saringan',
  'browse.empty.title': 'Tidak ada listing yang cocok dengan saringan ini.',
  'browse.empty.action': 'Bersihkan saringan pelabuhan, atau pasang permintaan.',
  'browse.loading': 'Memuat listing…',
  'browse.error': 'Listing tidak dapat dimuat. Coba muat ulang halaman.',

  'footer.tagline': 'Pasar ekspor impor Indonesia dengan verifikasi yang terlihat.',
  'footer.product': 'Produk',
  'footer.trust': 'Kepercayaan',
  'footer.verification': 'Cara verifikasi bekerja',
  'footer.report': 'Laporkan listing',
  'footer.terms': 'Ketentuan layanan',
  'footer.privacy': 'Kebijakan privasi',
  'footer.disclaimer':
    'Niaga bukan pialang kepabeanan, bukan perusahaan ekspedisi, dan bukan pihak dalam kontrak antar pengguna. Informasi LARTAS bersifat informatif, bukan nasihat kepabeanan.',
  'footer.api.ok': 'API tersambung',
  'footer.api.degraded': 'API bermasalah',
  'footer.api.down': 'API tidak tersambung',

  'time.justNow': 'baru saja',
  'time.minutes': '{count} menit lalu',
  'time.hours': '{count} jam lalu',
  'time.days': '{count} hari lalu',
} as const;

type CopyKey = keyof typeof id;

const en: Record<CopyKey, string> = {
  'nav.browse': 'Browse',
  'nav.post': 'Post an offer',
  'nav.signIn': 'Sign in',
  'nav.signUp': 'Sign up',
  'nav.theme': 'Switch theme',
  'nav.locale': 'Switch language',
  'nav.menu': 'Menu',

  'hero.title.1': 'Find buyers.',
  'hero.title.2': 'Find suppliers.',
  'hero.title.3': "Without guessing who's real.",
  'hero.lede':
    'Niaga connects Indonesian exporters with buyers, and importers with suppliers. Company verification status is visible on every listing — including the ones that are unverified.',
  'hero.ctaPost': 'Post an offer',
  'hero.ctaBrowse': 'Browse {count} listings',
  'hero.vertical': 'Starting with agri-commodities: coffee, cocoa, spices, coconut, seaweed.',

  'manifest.title': 'Manifest · Live',
  'manifest.subtitle': '{count} active listings',
  'manifest.loading': 'Loading manifest…',
  'manifest.error': 'The manifest could not be loaded. Reload the page.',
  'manifest.empty': 'No active listings yet.',
  'manifest.colCode': 'Code',
  'manifest.colCommodity': 'Commodity',
  'manifest.colRoute': 'Route',
  'manifest.colQty': 'Qty',
  'manifest.colLane': 'Lane',

  'lane.green': 'Green Lane',
  'lane.amber': 'Yellow Lane',
  'lane.red': 'Red Lane',
  'lane.green.meaning': 'NIB, NPWP and API checked. Company identity confirmed.',
  'lane.amber.meaning': 'Some documents verified. Others not yet uploaded, or expired.',
  'lane.red.meaning': 'No verified documents. We show this rather than hide it.',
  'lane.section.title': 'The verification lane system',
  'lane.section.lede':
    'Indonesian customs sorts consignments into green, yellow and red lanes. Niaga borrows the same vocabulary for company status, because every trader already reads those colours.',

  'listing.offer': 'Offer',
  'listing.request': 'Request',
  'listing.moq': 'MOQ',
  'listing.leadTime': 'Lead time',
  'listing.leadTimeDays': '{days} days',
  'listing.priceOnRequest': 'Price on request',
  'listing.openInquiry': 'Send an inquiry',
  'listing.viewCompany': 'View company',

  'recent.title': 'Latest listings',
  'recent.lede': 'Every card wears a shipping mark: HS code, port, incoterm, quantity.',
  'recent.viewAll': 'View all',

  'browse.title': 'Browse listings',
  'browse.filters': 'Filters',
  'browse.kind': 'Type',
  'browse.kind.all': 'All',
  'browse.lane': 'Verification lane',
  'browse.lane.all': 'All lanes',
  'browse.incoterm': 'Incoterm',
  'browse.incoterm.all': 'All incoterms',
  'browse.province': 'Province',
  'browse.province.all': 'All provinces',
  'browse.search': 'Search commodity or HS code',
  'browse.searchPlaceholder': 'arabica coffee, 0901…',
  'browse.results': '{count} results',
  'browse.clear': 'Clear filters',
  'browse.empty.title': 'No listings match these filters.',
  'browse.empty.action': 'Clear the port filter, or post a request instead.',
  'browse.loading': 'Loading listings…',
  'browse.error': 'Listings could not be loaded. Reload the page.',

  'footer.tagline': 'The Indonesian import/export marketplace where verification is visible.',
  'footer.product': 'Product',
  'footer.trust': 'Trust',
  'footer.verification': 'How verification works',
  'footer.report': 'Report a listing',
  'footer.terms': 'Terms of service',
  'footer.privacy': 'Privacy policy',
  'footer.disclaimer':
    'Niaga is not a customs broker, not a freight forwarder, and not a party to any contract between users. LARTAS information is informational, not customs advice.',
  'footer.api.ok': 'API connected',
  'footer.api.degraded': 'API degraded',
  'footer.api.down': 'API unreachable',

  'time.justNow': 'just now',
  'time.minutes': '{count} min ago',
  'time.hours': '{count} h ago',
  'time.days': '{count} d ago',
};

const DICTIONARIES: Record<Locale, Record<CopyKey, string>> = { id, en };

export type Translate = (key: CopyKey, vars?: Record<string, string | number>) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Translate;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLocale(): Locale {
  const stored = localeSchema.safeParse(localStorage.getItem(STORAGE_KEY));
  if (stored.success) return stored.data;
  // First visit follows the browser; an explicit choice wins from then on.
  return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback<Translate>(
    (key, vars) => {
      const template = DICTIONARIES[locale][key];
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      );
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
