import { useCallback, useEffect, useRef, useState } from 'react';
import { hostOf } from '@/shared/lib';
import { cachedIcons, fillIcons, missingIconSites } from './site-icons';

/**
 * Our own site icons (by domain). Loaded only for addresses passed to `load` (tabs of expanded
 * records), and only with site access; each site once while the page is open. `load` returns
 * a cancel function: sites not finished loading are loaded again on the next call.
 */
export function useSiteIcons(access: boolean | undefined): {
  icons: ReadonlyMap<string, string>;
  load: (urls: readonly string[]) => () => void;
} {
  const [icons, setIcons] = useState<ReadonlyMap<string, string>>(new Map());
  const requested = useRef(new Set<string>());

  useEffect(() => {
    void cachedIcons().then((cached) => setIcons((prev) => new Map([...cached, ...prev])));
  }, []);

  const load = useCallback(
    (urls: readonly string[]) => {
      if (!access) return () => {};
      const fresh = urls.filter((u) => {
        const host = hostOf(u);
        if (!host || requested.current.has(host)) return false;
        requested.current.add(host);
        return true;
      });
      if (fresh.length === 0) return () => {};
      const controller = new AbortController();
      let done = false;
      void missingIconSites(fresh, controller.signal)
        .then((sites) =>
          fillIcons(
            sites,
            (host, data) => {
              if (data) setIcons((prev) => new Map(prev).set(host, data));
            },
            controller.signal,
          ),
        )
        .then(() => (done = true));
      return () => {
        if (done) return;
        controller.abort();
        for (const u of fresh) requested.current.delete(hostOf(u));
      };
    },
    [access],
  );

  return { icons, load };
}
