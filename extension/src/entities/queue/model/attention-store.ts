import { useEffect, useState } from 'react';
import type { LocalServiceSchemas } from '@/shared/api';
import { browser } from '@/shared/browser';

/**
 * The "attention" topic kept by the background script in `chrome.storage.session`
 * (docs/extension/queues.md, section 6): the banners and the popup read it from here and follow
 * its changes, without connections of their own.
 */

export type AttentionSnapshot = LocalServiceSchemas['AttentionSnapshot'];
export type AttentionCase = LocalServiceSchemas['CaseModel'];

const KEY = 'queueAttention';

/** `null` — no connection with Tidy Reel: no banner, no numbers. */
export async function saveAttention(snapshot: AttentionSnapshot | null): Promise<void> {
  await browser.storage.session.set({ [KEY]: snapshot });
}

/** The current snapshot, updated on every change. */
export function useAttention(): AttentionSnapshot | null {
  const [snapshot, setSnapshot] = useState<AttentionSnapshot | null>(null);
  useEffect(() => {
    void browser.storage.session.get(KEY).then((stored) => setSnapshot((stored[KEY] as AttentionSnapshot | undefined) ?? null));
    const onChanged = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area === 'session' && KEY in changes) setSnapshot((changes[KEY]!.newValue as AttentionSnapshot | undefined) ?? null);
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => browser.storage.onChanged.removeListener(onChanged);
  }, []);
  return snapshot;
}
