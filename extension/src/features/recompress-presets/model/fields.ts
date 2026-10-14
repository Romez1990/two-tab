/**
 * Поля пресета сжатия и подписи ползунков (tidy-reel/docs/recompress.md, разделы 2–3). Значения
 * в процентах — из тестов на PMV: 100% — значение по умолчанию, справа самая большая экономия места.
 */

export interface PresetFields {
  enabled: boolean;
  crf: number;
  speed: number;
  grain: number;
  opus_kbps: number;
  /** Короткая сторона; 0 — исходное. */
  resolution: number;
  /** 0 — исходный. */
  fps: number;
  trim_start: string;
  trim_end: string;
  bitrate_threshold: number;
  normalize: boolean;
}

export const DEFAULT_FIELDS: PresetFields = {
  enabled: true,
  crf: 40,
  speed: 2,
  grain: 0,
  opus_kbps: 40,
  resolution: 1080,
  fps: 30,
  trim_start: '',
  trim_end: '',
  bitrate_threshold: 0,
  normalize: false,
};

export type SliderField = 'crf' | 'speed' | 'grain' | 'opus_kbps' | 'resolution' | 'fps';

export interface SliderStep {
  value: number;
  label: string;
  /** Размер от значения по умолчанию, %; нет — неизвестно (исходное). */
  size?: number;
  /** Время кодирования от значения по умолчанию, %. */
  time?: number;
}

export interface SliderDef {
  field: SliderField;
  title: string;
  /** Слева направо: справа — меньше файл. */
  steps: SliderStep[];
  hint?: string;
  /** Проценты относятся к звуку, а не ко всему файлу. */
  sizeOf?: string;
}

const crfSizes = [147, 137, 128, 121, 113, 106, 100, 94, 89, 83, 78, 74, 69, 66, 62];

export const SLIDERS: SliderDef[] = [
  {
    field: 'crf',
    title: 'Качество (CRF)',
    steps: crfSizes.map((size, i) => ({ value: 34 + i, label: String(34 + i), size })),
    hint: 'Меньше — лучше качество и больше файл. Время от CRF почти не зависит.',
  },
  {
    field: 'speed',
    title: 'Скорость кодирования',
    steps: [
      { value: 4, label: '4', size: 104, time: 29 },
      { value: 3, label: '3', size: 104, time: 61 },
      { value: 2, label: '2', size: 100, time: 100 },
      { value: 1, label: '1', size: 96, time: 179 },
      { value: 0, label: '0', size: 94, time: 452 },
    ],
    hint: 'Размер — при одинаковом качестве. В режиме 2 1080p кодируется примерно в 3 раза медленнее реального времени.',
  },
  {
    field: 'grain',
    title: 'Синтез зерна',
    steps: [
      { value: 0, label: 'выкл.', size: 100, time: 100 },
      { value: 4, label: '4', size: 101, time: 157 },
      { value: 8, label: '8', size: 99, time: 166 },
      { value: 12, label: '12', size: 98, time: 161 },
      { value: 16, label: '16', size: 97, time: 163 },
      { value: 24, label: '24', size: 95, time: 150 },
    ],
    hint: 'Заметно сильнее сжимает старые и шумные видео. На чистых студийных почти не влияет.',
  },
  {
    field: 'opus_kbps',
    title: 'Звук Opus, кбит/с',
    steps: [
      { value: 128, label: '128', size: 291 },
      { value: 96, label: '96', size: 217 },
      { value: 64, label: '64', size: 152 },
      { value: 48, label: '48', size: 119 },
      { value: 40, label: '40', size: 100 },
      { value: 32, label: '32', size: 81 },
      { value: 24, label: '24', size: 61 },
    ],
    sizeOf: 'звука',
    hint: 'При CRF 40 звук Opus 40 — около 4% файла.',
  },
  {
    field: 'resolution',
    title: 'Разрешение',
    steps: [
      { value: 0, label: 'исходное' },
      { value: 2160, label: '4K', size: 231, time: 343 },
      { value: 1440, label: '2K', size: 138, time: 158 },
      { value: 1080, label: '1080p', size: 100, time: 100 },
      { value: 720, label: '720p', size: 64, time: 58 },
      { value: 540, label: '540p', size: 47, time: 40 },
      { value: 480, label: '480p', size: 44, time: 34 },
      { value: 360, label: '360p', size: 32, time: 26 },
    ],
    hint: 'По короткой стороне: вертикальное 1080×1920 — это 1080p. Видео только уменьшается.',
  },
  {
    field: 'fps',
    title: 'FPS',
    steps: [
      { value: 0, label: 'исходный' },
      { value: 60, label: '60', size: 154, time: 182 },
      { value: 30, label: '30', size: 100, time: 100 },
      { value: 24, label: '24', size: 85, time: 93 },
    ],
    hint: 'Только уменьшается: видео с 30 FPS и ниже остаётся как есть.',
  },
];

/** Подпись значения: «около 89% размера, 100% времени». */
export function describeStep(def: SliderDef, step: SliderStep): string {
  if (step.size === undefined) return 'как у исходника';
  const size = `около ${step.size}% размера${def.sizeOf ? ` ${def.sizeOf}` : ''}`;
  return step.time === undefined ? size : `${size}, ${step.time}% времени`;
}

const TIME = /^(?:(?:(\d+):)?(\d+):)?(\d+(?:\.\d+)?)$/;

/** «Умный момент времени»: ошибка — текст для подсветки поля, пусто — верно (recompress.md, раздел 2.7). */
export function trimError(text: string, end: boolean): string {
  let value = text.trim().toLowerCase();
  if (!value) return '';
  if (value.startsWith('-')) {
    if (!end) return 'Минус бывает только у конца';
    value = value.slice(1).trim();
  }
  if (/^\d+f$/.test(value)) return '';
  const match = TIME.exec(value);
  if (!match) return 'Примеры: 94f, 12.5, 0:12.5, 1:02:03.25';
  const [, hours, minutes, seconds] = match;
  if ((hours || minutes) && Number(seconds) >= 60) return 'Секунды — меньше 60';
  if (hours && Number(minutes) >= 60) return 'Минуты — меньше 60';
  return '';
}
