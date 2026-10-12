import { useEffect, useRef, useState } from 'react';
import { cachedIcons, fillIcons, missingIconSites } from './site-icons';

/**
 * Свои значки сайтов (по домену) для адресов `urls`. Сайты без значка в кеше Chrome ищутся один раз,
 * когда адреса загрузились; с доступом к сайтам их значки загружаются. `missing` — сколько сайтов ещё без значка.
 */
export function useSiteIcons(urls: readonly string[], access: boolean | undefined): { icons: ReadonlyMap<string, string>; missing: number } {
  const [icons, setIcons] = useState<ReadonlyMap<string, string>>(new Map());
  const [sites, setSites] = useState<ReadonlyMap<string, string>>(new Map());
  const [checked, setChecked] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    void cachedIcons().then(setIcons);
  }, []);

  useEffect(() => {
    if (started.current || urls.length === 0) return;
    started.current = true;
    const controller = new AbortController();
    void missingIconSites(urls, controller.signal).then(setSites);
  }, [urls]);

  useEffect(() => {
    if (!access || sites.size === 0) return;
    const controller = new AbortController();
    void fillIcons(
      sites,
      (host, data) => {
        if (data) setIcons((prev) => new Map(prev).set(host, data));
        setChecked((n) => n + 1);
      },
      controller.signal,
    );
    return () => controller.abort();
  }, [access, sites]);

  return { icons, missing: Math.max(0, sites.size - checked) };
}
