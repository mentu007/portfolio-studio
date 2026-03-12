import { useEffect, useState } from 'react';
import type { SiteTheme } from '../utils/site-preferences';
import { readTheme } from '../utils/site-preferences';

export function useSiteTheme() {
  const [theme, setTheme] = useState<SiteTheme>(readTheme);

  useEffect(() => {
    function handleThemeChange(event: Event) {
      const next = (event as CustomEvent<SiteTheme>).detail;
      setTheme(next === 'dark' ? 'dark' : 'light');
    }

    setTheme(readTheme());
    window.addEventListener('portfolio:theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('portfolio:theme-change', handleThemeChange as EventListener);
    };
  }, []);

  return theme;
}
