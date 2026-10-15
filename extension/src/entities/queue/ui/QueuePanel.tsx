import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { LocalServiceSchemas } from '@/shared/api';
import { FILTER_TITLES, QUEUE_FILTERS, type QueueFilter } from '../model/address';

/** Компоненты, общие для «Очереди скачивания» и «Очереди сжатия» (docs/extension/queues.md, раздел 1). */

export type QueuePause = LocalServiceSchemas['PauseModel'];
export type QueueCountersValue = LocalServiceSchemas['CountersModel'];
/** Что считает счётчик; то же значение — `kind` у `…/items/next`. */
export type CounterKind = 'decision' | 'unread' | 'errors';

/** Причины паузы всей очереди (tidy-reel/docs/recompress.md, раздел 6.3). */
const PAUSE_REASONS: Record<string, string> = {
  user: 'Пауза',
  no_space: 'Кончилось место',
  error: 'Ошибка у видео',
  need_cookies: 'Нужны куки',
};

/** Панель очереди: идёт или на паузе и почему, «Пауза» и «Продолжить», сколько осталось. */
export function QueuePanel({ pause, remaining, onPause }: { pause: QueuePause | null; remaining: string; onPause: (paused: boolean) => void }) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Chip size="small" color={pause ? (pause.reason === 'user' ? 'default' : 'warning') : 'primary'} label={pause ? (PAUSE_REASONS[pause.reason] ?? pause.reason) : 'Идёт'} />
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {remaining}
        </Typography>
        <Button size="small" variant="outlined" onClick={() => onPause(!pause)}>
          {pause ? 'Продолжить' : 'Пауза'}
        </Button>
      </Stack>
    </Paper>
  );
}

const COUNTERS: { kind: CounterKind; field: keyof QueueCountersValue; label: string; color: 'warning' | 'info' | 'error' }[] = [
  { kind: 'decision', field: 'decisions', label: 'Нужно решение', color: 'warning' },
  { kind: 'unread', field: 'unread', label: 'Сообщения', color: 'info' },
  { kind: 'errors', field: 'errors', label: 'Ошибки', color: 'error' },
];

/** Счётчики в правом верхнем углу, видны при прокрутке; при нуле скрыты. Нажатие — к следующему видео. */
export function QueueCounters({ counters, onJump }: { counters: QueueCountersValue; onJump: (kind: CounterKind) => void }) {
  const shown = COUNTERS.filter((c) => counters[c.field] > 0);
  if (!shown.length) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ position: 'sticky', top: 72, zIndex: 2, alignSelf: 'flex-end' }}>
      {shown.map((c) => (
        <Chip key={c.kind} color={c.color} label={`${c.label}: ${counters[c.field]}`} onClick={() => onJump(c.kind)} />
      ))}
    </Stack>
  );
}

/** Фильтры очереди, можно несколько; сняли все — снова «Активные». */
export function QueueFilters({ value, onChange }: { value: readonly QueueFilter[]; onChange: (filters: QueueFilter[]) => void }) {
  return (
    <ToggleButtonGroup size="small" value={value} onChange={(_, next: QueueFilter[]) => onChange(next.length ? QUEUE_FILTERS.filter((f) => next.includes(f)) : ['active'])}>
      {QUEUE_FILTERS.map((f) => (
        <ToggleButton key={f} value={f}>
          {FILTER_TITLES[f]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/** Страницы, которые отдаёт сервис; `page` — с 1. */
export function QueuePager({ total, pageSize, page, onPage }: { total: number; pageSize: number; page: number; onPage: (page: number) => void }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return <Pagination count={pages} page={Math.min(page, pages)} onChange={(_, p) => onPage(p)} color="primary" size="small" sx={{ alignSelf: 'center' }} />;
}

/** Низ формы создания: «Запустить очередь» (по умолчанию включена) и кнопка создания. */
export function CreateFooter({ start, onStart, children }: { start: boolean; onStart: (start: boolean) => void; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      {children}
      <FormControlLabel control={<Checkbox size="small" checked={start} onChange={(_, v) => onStart(v)} />} label="Запустить очередь" />
    </Stack>
  );
}
