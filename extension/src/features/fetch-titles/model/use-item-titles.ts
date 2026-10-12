import { useEffect, useRef } from 'react';
import type { SavedItem } from '@/entities/saved';
import { fillTitles, pendingTitleUrls } from './fetch-titles';

/**
 * Заголовки вкладок одной записи, пока она развёрнута на странице «Сохранённые»
 * (docs/extension/specification.md, раздел 2.1). Без доступа к сайтам ничего не загружается.
 */
export function useItemTitles(item: SavedItem, access: boolean | undefined, onTitle: (url: string, title: string) => void): void {
  const itemRef = useRef(item);
  itemRef.current = item;
  const onTitleRef = useRef(onTitle);
  onTitleRef.current = onTitle;

  useEffect(() => {
    if (!access) return;
    const controller = new AbortController();
    void pendingTitleUrls([itemRef.current]).then((urls) => {
      if (controller.signal.aborted || urls.length === 0) return;
      return fillTitles(
        urls,
        [itemRef.current],
        (url, title) => {
          if (title) onTitleRef.current(url, title);
        },
        controller.signal,
      );
    });
    return () => controller.abort();
  }, [access, item.id]);
}
