'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, isLocale, translate, type Locale } from '../i18n/src';

const key = 'aurum-locale';
const LocaleContext = createContext<{ locale: Locale; change: (next: Locale) => void } | null>(null);
function saveCookie(locale: Locale) {
  document.cookie = `${key}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
/** Presentation preference only; never use it to infer identity or tenant access. */
export function LocaleProvider({ initialLocale, hasLocaleCookie, application, children }: { initialLocale: Locale; hasLocaleCookie: boolean; application: 'admin' | 'shop'; children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    if (hasLocaleCookie) {
      try { window.localStorage.setItem(key, initialLocale); } catch { /* Cookie remains authoritative. */ }
    } else {
      try {
        const saved = window.localStorage.getItem(key);
        if (isLocale(saved)) { setLocale(saved); saveCookie(saved); }
      } catch { /* Local storage may be unavailable. */ }
    }
    const update = (event: StorageEvent) => {
      if (event.key !== key) return;
      const cookie = document.cookie.split(';').map(item => item.trim()).find(item => item.startsWith(`${key}=`))?.slice(key.length + 1);
      const next = isLocale(cookie) ? cookie : isLocale(event.newValue) ? event.newValue : DEFAULT_LOCALE;
      setLocale(next);
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [hasLocaleCookie, initialLocale]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => {
    document.title = translate(locale, `metadata.${application}.title`);
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', translate(locale, `metadata.${application}.description`));
  }, [application, locale]);
  function change(next: Locale) {
    setLocale(next);
    saveCookie(next);
    try { window.localStorage.setItem(key, next); } catch { /* UI still changes for this session. */ }
  }
  return <LocaleContext.Provider value={{ locale, change }}>{children}</LocaleContext.Provider>;
}
export function useLocalePreference() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('LocaleProvider is required');
  return context;
}
export function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  const label = translate(locale, 'common.language');
  return <label className="aurum-language"><span>{label}</span><select value={locale} onChange={event => { if (isLocale(event.target.value)) onChange(event.target.value); }} aria-label={label}><option value="vi">Tiếng Việt · VI</option><option value="en">English · EN</option></select></label>;
}
