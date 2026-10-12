import { useEffect, useRef, useState } from 'react';
import { SavedMatches, type SavedMatch } from '@/entities/saved';
import { openSavedItem, type BannerFrameMessage } from '@/features/saved-banner';

function readMatches(): SavedMatch[] {
  try {
    return JSON.parse(new URLSearchParams(location.search).get('matches') ?? '[]') as SavedMatch[];
  } catch {
    return [];
  }
}

function post(message: BannerFrameMessage) {
  parent.postMessage(message, '*');
}

/** Плашка «Уже сохранено» в iframe на сайте (docs/extension/specification.md, раздел 2.1); найденные записи — в `?matches=`. */
export function SavedBannerPage() {
  const [matches] = useState<SavedMatch[]>(readMatches);
  const box = useRef<HTMLDivElement>(null);

  // Высота iframe — по содержимому; без совпадений плашка закрывается.
  useEffect(() => {
    if (matches.length === 0) return post({ tabsurd: 'banner-close' });
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => post({ tabsurd: 'banner-height', height: Math.ceil(el.getBoundingClientRect().height) }));
    observer.observe(el);
    return () => observer.disconnect();
  }, [matches]);

  return (
    <div ref={box}>
      <SavedMatches
        matches={matches}
        onOpen={(id) => void openSavedItem(id)}
        onClose={() => post({ tabsurd: 'banner-close' })}
      />
    </div>
  );
}
