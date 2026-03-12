import { useEffect, useState } from 'react';
import type { Locale } from '../data/site';
import { readLocale } from '../utils/site-preferences';

export function useSiteLocale() {
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    function handleLocaleChange(event: Event) {
      const next = (event as CustomEvent<Locale>).detail;
      setLocale(next === 'en' ? 'en' : 'zh');
    }

    setLocale(readLocale());
    window.addEventListener('portfolio:locale-change', handleLocaleChange as EventListener);

    return () => {
      window.removeEventListener('portfolio:locale-change', handleLocaleChange as EventListener);
    };
  }, []);

  return locale;
}
