import type { Locale } from '../data/site';

export type SiteTheme = 'light' | 'dark';

const localeStorageKey = 'portfolio-locale';
const themeStorageKey = 'portfolio-theme';

export function readLocale(): Locale {
  if (typeof document === 'undefined') {
    return 'zh';
  }

  return document.documentElement.dataset.locale === 'en' ? 'en' : 'zh';
}

export function applyLocale(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  const next = locale === 'en' ? 'en' : 'zh';
  const root = document.documentElement;

  root.dataset.locale = next;
  root.lang = next === 'en' ? 'en-US' : 'zh-CN';

  try {
    localStorage.setItem(localeStorageKey, next);
  } catch {}

  window.dispatchEvent(new CustomEvent('portfolio:locale-change', { detail: next }));
}

export function readTheme(): SiteTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: SiteTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  const next = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;

  root.dataset.theme = next;
  root.classList.toggle('dark', next === 'dark');

  try {
    localStorage.setItem(themeStorageKey, next);
  } catch {}

  window.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: next }));
}

export function resolveInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const storedTheme = localStorage.getItem(themeStorageKey);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch {}

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
