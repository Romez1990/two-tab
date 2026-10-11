import { browser } from '@/shared/browser';
import type { BrowserWindow, WindowTab } from './types';

/** Обычные окна Chrome (без всплывающих и окон приложений) с вкладками по порядку. */
export async function listWindows(): Promise<BrowserWindow[]> {
  const windows = await browser.windows.getAll({ populate: true, windowTypes: ['normal'] });
  const result: BrowserWindow[] = [];
  for (const w of windows) {
    if (w.id === undefined) continue;
    const tabs: WindowTab[] = [];
    for (const t of w.tabs ?? []) {
      if (t.id === undefined) continue;
      tabs.push({ id: t.id, index: t.index, title: t.title ?? '', url: t.url ?? '', pinned: t.pinned, groupId: t.groupId ?? -1 });
    }
    tabs.sort((a, b) => a.index - b.index);
    result.push({
      id: w.id,
      focused: w.focused,
      state: w.state ?? 'normal',
      left: w.left,
      top: w.top,
      width: w.width,
      height: w.height,
      tabs,
    });
  }
  return result;
}
