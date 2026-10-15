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

/** The "Already saved" banner in an iframe on a site (docs/extension/pages/saved.md, section 1); found records come in `?matches=`, the site address in `&url=`. */
export function SavedBannerPage() {
  const [matches] = useState<SavedMatch[]>(readMatches);
  const box = useRef<HTMLDivElement>(null);

  // The iframe height follows the content; with no matches the banner closes.
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
        onOpen={(id) => void openSavedItem(id, new URLSearchParams(location.search).get('url') ?? '')}
        onClose={() => post({ tabsurd: 'banner-close' })}
      />
    </div>
  );
}
