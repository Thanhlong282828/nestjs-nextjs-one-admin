/** Supported locales only; other languages require reviewed catalogs first. */
export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.some(locale => locale === value);
}

/** User and organization values must be supplied by a trusted server when authenticated. */
export function resolveLocale(preferences: {
  user?: unknown; branch?: unknown; company?: unknown; saved?: unknown;
}): Locale {
  for (const value of [preferences.user, preferences.company, preferences.branch, preferences.saved]) {
    if (isLocale(value)) return value;
  }
  return DEFAULT_LOCALE;
}

const vi = {
  'common.language': 'Ngôn ngữ',
  'common.vietnamese': 'Tiếng Việt',
  'common.english': 'Tiếng Anh',
  'common.unavailable': 'Chưa khả dụng',
  'common.loading': 'Đang tải dữ liệu…',
  'common.loadError': 'Không thể tải dữ liệu',
  'common.empty': 'Chưa có dữ liệu để hiển thị',
  'metadata.admin.title': 'Aurum | Không gian vận hành',
  'metadata.admin.description': 'Trung tâm điều hành doanh nghiệp Aurum ERP',
  'metadata.shop.title': 'Aurum Shop | Mua sắm tinh tế',
  'metadata.shop.description': 'Cửa hàng trực tuyến Aurum',
} as const;
type Key = keyof typeof vi;
const en: Record<Key, string> = {
  'common.language': 'Language',
  'common.vietnamese': 'Vietnamese',
  'common.english': 'English',
  'common.unavailable': 'Unavailable',
  'common.loading': 'Loading data…',
  'common.loadError': 'Unable to load data',
  'common.empty': 'No data to display',
  'metadata.admin.title': 'Aurum | Operations workspace',
  'metadata.admin.description': 'Aurum ERP enterprise operations center',
  'metadata.shop.title': 'Aurum Shop | Thoughtful shopping',
  'metadata.shop.description': 'The Aurum online shop',
};
export const catalogs: Record<Locale, Readonly<Record<Key, string>>> = { vi, en };
export type TranslationKey = Key;
export function translate(locale: Locale, key: TranslationKey): string {
  return catalogs[locale][key] ?? catalogs[DEFAULT_LOCALE][key];
}

/** Presentation only: never use these formatters for accounting arithmetic. */
export function formatNumber(value: number | bigint, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
export function formatCurrency(value: number | bigint, currency: string, locale: Locale): string {
  return formatNumber(value, locale, { style: 'currency', currency });
}
export function formatPercent(value: number, locale: Locale): string {
  return formatNumber(value, locale, { style: 'percent' });
}
export function formatDateTime(value: Date, locale: Locale, timeZone: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(value);
}
export function formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, locale: Locale): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
}
