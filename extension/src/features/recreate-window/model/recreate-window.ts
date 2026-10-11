import type { BrowserWindow } from '@/entities/window';
import { browser } from '@/shared/browser';
import { planMoves } from './plan-moves';

/**
 * Пересоздаёт окно: открывает новое окно на том же месте и переносит в него вкладки и группы.
 * Нужна для эксперимента: сортирует ли Windows окна Chrome на панели задач по времени создания
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
  for (const step of plan.rest) {
    if (step.kind === 'tab') {
      await browser.tabs.move(step.tabId, { windowId, index: -1 });
    } else {
      await browser.tabGroups.move(step.groupId, { windowId, index: -1 });
    }
  }
}
