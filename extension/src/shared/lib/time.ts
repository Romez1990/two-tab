export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** A day starts at 6:00 (docs/specification.md): a visit at 1 a.m. still belongs to the previous day. */
const DAY_START_HOUR = 6;

function shifted(ms: number): Date {
  return new Date(ms - DAY_START_HOUR * HOUR);
}

/** Key of the day from 6:00 to 6:00 local time, for example "2026-10-12". */
export function dayKey(ms: number): string {
  const d = shifted(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Month key with the same day boundary. */
export function monthKey(ms: number): string {
  const d = shifted(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

/** Hour key in local time. */
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

/** Day number (from 6:00 local time), to count consecutive days and compare them as numbers. */
export function dayIndex(ms: number): number {
  const d = shifted(ms);
  return Math.floor((d.getTime() - d.getTimezoneOffset() * MINUTE) / DAY);
}
