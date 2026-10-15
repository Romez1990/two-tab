/**
 * How much space the local extension database takes (IndexedDB, holding Dexie).
 * Chrome gives an estimate for the whole extension origin, so the number is approximate.
 */
export async function getDbUsageBytes(): Promise<number | undefined> {
  try {
    return (await navigator.storage.estimate()).usage;
  } catch {
    return undefined;
  }
}

/** Size like "512 B", "48.3 KB", "12.4 MB" (shown in Russian). */
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
