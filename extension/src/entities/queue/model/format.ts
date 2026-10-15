import type { LocalServiceSchemas } from '@/shared/api';

/** Remainder of a group, job or queue (tidy-reel/docs/recompress.md, section 2.12.1). */
export type Remaining = LocalServiceSchemas['RemainingModel'];

const UNITS = {
  video: ['видео', 'видео', 'видео'],
  file: ['файл', 'файла', 'файлов'],
} as const;

/**
 * "12 videos left · ≈ 3 h 20 min · ≈ 2.3 GB" (shown in Russian): time and size only when the duration is
 * known for all remaining items; until the channel list arrives, "counting…". Every variant is one whole
 * string with placeholders, so it can move to a localization file (STYLE.md, "Texts for the user").
 */
export function remainingText(remaining: Remaining, unit: keyof typeof UNITS): string {
  const count = remaining.count;
  const items = plural(count, UNITS[unit]);
  if (remaining.counting) return count ? `осталось ${count} ${items} · подсчитывается…` : 'подсчитывается…';
  if (!count) return 'ничего не осталось';
  if (remaining.seconds == null) return `осталось ${count} ${items}`;
  const time = formatDuration(remaining.seconds);
  if (remaining.frees != null) return `осталось ${count} ${items} · ${time} · ≈ освободится ${formatSize(remaining.frees)}`;
  if (remaining.bytes == null) return `осталось ${count} ${items} · ${time}`;
  const size = formatSize(remaining.bytes);
  return remaining.approximate ? `осталось ${count} ${items} · ${time} · ≈ ${size} (приблизительно)` : `осталось ${count} ${items} · ${time} · ≈ ${size}`;
}

/** Count with the Russian plural form of "file": 1 file, 2 files, 5 files. */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const tens = n % 100;
  const ones = n % 10;
  if (tens >= 11 && tens <= 14) return forms[2];
  if (ones === 1) return forms[0];
  if (ones >= 2 && ones <= 4) return forms[1];
  return forms[2];
}

/** Time left, not clock time: "≈ 3 h 20 min" (shown in Russian). */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `≈ ${minutes} мин`;
  return rest ? `≈ ${hours} ч ${rest} мин` : `≈ ${hours} ч`;
}

/** Size like "450 MB", "2.3 GB", "12 GB" (shown in Russian). */
export function formatSize(bytes: number): string {
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const text = value < 10 && i > 0 ? value.toFixed(1).replace('.', ',').replace(/,0$/, '') : String(Math.round(value));
  return `${text} ${units[i]}`;
}
