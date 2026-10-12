import { getWindowUids, setWindowUid, type BrowserWindow } from '@/entities/window';
import { browser } from '@/shared/browser';
import { planMoves } from './plan-moves';

/**
 * Пересоздаёт окно: открывает новое окно на том же месте и переносит в него вкладки и группы.
 * Windows сортирует окна на панели задач по времени создания, поэтому пересозданное окно становится последним
 * (docs/extension/specification.md, раздел 2.3). Старое окно закрывается само, когда из него уходит последняя вкладка.
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
  // Постоянный номер (имя окна, «Не закрывать») переходит к новому окну.
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
 * Новый порядок окон на панели задач (docs/extension/specification.md, раздел 2.3): окна до первого изменения
 * остаются, остальные пересоздаются по очереди и встают в конец в нужном порядке.
 */
export async function reorderWindows(current: readonly BrowserWindow[], next: readonly BrowserWindow[]): Promise<void> {
  const firstChanged = next.findIndex((w, i) => current[i]?.id !== w.id);
  if (firstChanged === -1) return;
  for (const w of next.slice(firstChanged)) await recreateWindow(w);
}
