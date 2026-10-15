import { getWindowUids, setWindowUid, type BrowserWindow } from '@/entities/window';
import { browser } from '@/shared/browser';
import { planMoves } from './plan-moves';

/**
 * Recreates a window: opens a new window in the same place and moves the tabs and groups into it.
 * Windows orders taskbar windows by creation time, so the recreated window becomes the last one
 * (docs/extension/pages/windows.md, section 1). The old window closes by itself when its last tab leaves.
 */
export async function recreateWindow(window: BrowserWindow): Promise<void> {
  const plan = planMoves(window.tabs);
  if (!plan) return;
  const placement =
    window.state === 'normal'
      ? { left: window.left, top: window.top, width: window.width, height: window.height }
      : { state: window.state as 'maximized' | 'minimized' | 'fullscreen' };
  const created = await browser.windows.create({ tabId: plan.first, ...placement });
  if (created?.id === undefined) throw new Error('Chrome не вернул новое окно');
  const windowId = created.id;
  // The permanent id (window name, "Do not close") moves to the new window.
  const uid = (await getWindowUids()).get(window.id);
  if (uid) await setWindowUid(windowId, uid);
  for (const step of plan.rest) {
    if (step.kind === 'tab') {
      await browser.tabs.move(step.tabId, { windowId, index: -1 });
    } else {
      await browser.tabGroups.move(step.groupId, { windowId, index: -1 });
    }
  }
}

/**
 * New window order on the taskbar (docs/extension/pages/windows.md, section 1): windows before the first change
 * stay, the rest are recreated one by one and go to the end in the right order.
 */
export async function reorderWindows(current: readonly BrowserWindow[], next: readonly BrowserWindow[]): Promise<void> {
  const firstChanged = next.findIndex((w, i) => current[i]?.id !== w.id);
  if (firstChanged === -1) return;
  for (const w of next.slice(firstChanged)) await recreateWindow(w);
}
