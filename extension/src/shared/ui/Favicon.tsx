import Box from '@mui/material/Box';
import { browser } from '@/shared/browser';

/** `src` is our own site icon when Chrome's cache does not have it. */
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

/** Site icon from the Chrome icon cache (`favicon` permission); no requests to the internet. */
export function faviconUrl(pageUrl: string, size = 32): string {
  const base = browser.runtime.getURL('/_favicon/' as '/');
  return `${base}?pageUrl=${encodeURIComponent(pageUrl)}&size=${size}`;
}
