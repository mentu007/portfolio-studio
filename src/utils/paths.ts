export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!base || base === '/') {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`.replace(/\/{2,}/gu, '/');
}
