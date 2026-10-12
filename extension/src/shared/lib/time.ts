export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Сутки начинаются в 6:00 (docs/specification.md): заход в час ночи — это ещё предыдущий день. */
const DAY_START_HOUR = 6;

function shifted(ms: number): Date {
  return new Date(ms - DAY_START_HOUR * HOUR);
}

/** Ключ суток с 6:00 до 6:00 по местному времени, например «2026-10-12». */
export function dayKey(ms: number): string {
  const d = shifted(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Ключ месяца с той же границей суток. */
export function monthKey(ms: number): string {
  const d = shifted(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

/** Ключ часа по местному времени. */
export function hourKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}
