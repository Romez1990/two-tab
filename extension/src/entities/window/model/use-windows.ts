import { useCallback, useEffect, useState } from 'react';
import { browser } from '@/shared/browser';
import { listWindows } from './list-windows';
import type { BrowserWindow } from './types';
import { getWindowUids } from './uids';

/** Open windows and their permanent ids; updated when windows, tabs or groups change. */
export function useWindows(): { windows: BrowserWindow[]; uids: ReadonlyMap<number, string>; reload: () => void } {
  const [windows, setWindows] = useState<BrowserWindow[]>([]);
  const [uids, setUids] = useState<ReadonlyMap<number, string>>(new Map());
  const reload = useCallback(() => {
    void listWindows().then(setWindows);
    void getWindowUids().then(setUids);
  }, []);

  useEffect(() => {
    reload();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const changed = () => {
      clearTimeout(timer);
      timer = setTimeout(reload, 300);
    };
    const events = [
      browser.windows.onCreated,
      browser.windows.onRemoved,
      browser.tabs.onCreated,
      browser.tabs.onRemoved,
      browser.tabs.onMoved,
      browser.tabs.onAttached,
      browser.tabs.onUpdated,
      browser.tabGroups.onCreated,
      browser.tabGroups.onUpdated,
      browser.tabGroups.onRemoved,
    ] as { addListener(cb: () => void): void; removeListener(cb: () => void): void }[];
    for (const e of events) e.addListener(changed);
    return () => {
      clearTimeout(timer);
      for (const e of events) e.removeListener(changed);
    };
  }, [reload]);

  return { windows, uids, reload };
}
