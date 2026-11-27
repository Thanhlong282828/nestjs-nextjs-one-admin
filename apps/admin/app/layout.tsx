import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, translate } from '../../../packages/i18n/src';
import { LocaleProvider } from '../../../packages/ui-glass/locale';
import '../../../packages/ui-glass/glass.css';
import './style.css';
export async function generateMetadata(): Promise<Metadata> {
  const preference = (await cookies()).get('aurum-locale')?.value;
  const locale = isLocale(preference) ? preference : DEFAULT_LOCALE;
  return { title: translate(locale, 'metadata.admin.title'), description: translate(locale, 'metadata.admin.description') };
}
export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const preference = (await cookies()).get('aurum-locale')?.value;
  const locale = isLocale(preference) ? preference : DEFAULT_LOCALE;
  return <html lang={locale}><body><LocaleProvider application="admin" initialLocale={locale} hasLocaleCookie={isLocale(preference)}>{children}</LocaleProvider></body></html>;
}
