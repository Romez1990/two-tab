import { sendCheckMessage } from './control';
import { updateCheckState } from './state';

/** Сколько проверено из скольких; в базу пишется не чаще раза в полсекунды. */
export type ReportProgress = (checked: number, total: number) => void;

/**
 * Запуск фоновой проверки в служебной странице. Что проверять, передаёт слой app (`task`): фича не зависит
 * от фич заголовков и значков. Уже проверенное `task` пропускает сама, поэтому после перезапуска Chrome
 * проверка продолжается с того места, где остановилась.
 */
export async function runBackgroundCheck(task: (signal: AbortSignal, report: ReportProgress) => Promise<void>): Promise<void> {
  let last = 0;
  const report: ReportProgress = (checked, total) => {
    const now = Date.now();
    if (now - last < 500 && checked < total) return;
    last = now;
    void updateCheckState({ checked, total });
  };
  try {
    await task(new AbortController().signal, report);
  } finally {
    await sendCheckMessage({ type: 'tabsurd:check-done' });
  }
}
