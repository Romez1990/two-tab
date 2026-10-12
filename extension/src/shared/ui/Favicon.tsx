import Box from '@mui/material/Box';
import { browser } from '@/shared/browser';

/** Значок сайта из кеша значков Chrome (разрешение `favicon`); в интернет запросов нет. */
export function faviconUrl(pageUrl: string, size = 32): string {
  const base = browser.runtime.getURL('/_favicon/' as '/');
  return `${base}?pageUrl=${encodeURIComponent(pageUrl)}&size=${size}`;
}

/** `src` — свой значок сайта, если в кеше Chrome его нет. */
export function Favicon({ url, size = 16, src }: { url: string; size?: number; src?: string }) {
  return (
    <Box
      component="img"
      src={src ?? faviconUrl(url, size * 2)}
      alt=""
      draggable={false}
      sx={{ width: size, height: size, flexShrink: 0, display: 'block' }}
    />
  );
}
