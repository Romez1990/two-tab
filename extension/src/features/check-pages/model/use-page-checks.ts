import { useCallback, useRef, useState } from 'react';
import type { SavedItem } from '@/entities/saved';
import { checkPage, checkPages, getChecks, pendingCheckUrls } from './check-pages';
import type { PageCheck } from './page-status';

/**
 * Page checks for "Saved" (docs/extension/pages/saved.md, section 1). `loadItem` is for an expanded
 * record: shows stored checks and checks the unchecked ones (returns a cancel function); `recheck` is a click
 * on a badge. Found titles go to `onTitle`. Without site access only stored results are shown.
 */
export function usePageChecks(
  access: boolean | undefined,
  onTitle: (url: string, title: string) => void,
): {
  checks: ReadonlyMap<string, PageCheck>;
  loadItem: (item: SavedItem) => () => void;
  recheck: (url: string) => void;
} {
  const [checks, setChecks] = useState<ReadonlyMap<string, PageCheck>>(new Map());
  const onTitleRef = useRef(onTitle);
  onTitleRef.current = onTitle;

  const apply = useCallback((check: PageCheck | undefined, title: string) => {
    if (!check) return;
    setChecks((prev) => new Map(prev).set(check.url, check));
    if (title) onTitleRef.current(check.url, title);
  }, []);

  const loadItem = useCallback(
    (item: SavedItem) => {
      const controller = new AbortController();
      void getChecks(item.window.tabs.map((t) => t.url)).then(async (found) => {
        if (controller.signal.aborted) return;
        setChecks((prev) => new Map([...prev, ...found]));
        if (!access) return;
        const urls = await pendingCheckUrls([item]);
        if (!controller.signal.aborted) await checkPages(urls, [item], apply, controller.signal);
      });
      return () => controller.abort();
    },
    [access, apply],
  );

  const recheck = useCallback(
    (url: string) => {
      if (!access) return;
      void checkPage(url, new AbortController().signal).then(({ check, title }) => apply(check, title ?? ''));
    },
    [access, apply],
  );

  return { checks, loadItem, recheck };
}
