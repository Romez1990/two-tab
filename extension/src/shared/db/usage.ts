/**
 * Сколько места занимает локальная база расширения (IndexedDB, в которой Dexie).
 * Chrome даёт оценку для всего источника расширения, поэтому цифра приблизительная.
 */
export async function getDbUsageBytes(): Promise<number | undefined> {
  try {
    return (await navigator.storage.estimate()).usage;
  } catch {
    return undefined;
  }
}

/** «512 Б», «48,3 КБ», «12,4 МБ». */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  const units = ['КБ', 'МБ', 'ГБ'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1).replace('.', ',')} ${units[i]}`;
}
