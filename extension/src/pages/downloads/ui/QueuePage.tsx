import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import {
  type DownloadAction,
  type DownloadItem,
  decideDuplicate,
  downloadAction,
  type GroupAction,
  type GroupSummary,
  groupAction,
  messageAction,
  nextItem,
  pauseQueue,
  readMessage,
} from '@/entities/download';
import {
  type CounterKind,
  formatDuration,
  formatSize,
  MessageLine,
  QueueCounters,
  QueueFilters,
  type QueueMessage,
  QueuePager,
  QueuePanel,
  remainingText,
  useQueueAddress,
  useScrollTarget,
} from '@/entities/queue';
import { useServiceTopic } from '@/shared/api';
import { errorText } from '@/shared/lib';

/** Queue states in Russian (tidy-reel/docs/downloader.md, sections 2 and 9). */
const STATES: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' }> = {
  counting: { label: 'подсчитывается…', color: 'primary' },
  queued: { label: 'в очереди', color: 'default' },
  paused: { label: 'на паузе', color: 'default' },
  downloading: { label: 'качается', color: 'primary' },
  checking_music: { label: 'проверяется музыка', color: 'primary' },
  checking_duplicates: { label: 'проверка на дубликаты', color: 'primary' },
  compressing: { label: 'сжимается', color: 'primary' },
  original_waiting: { label: 'ожидается удаление оригинала', color: 'warning' },
  done: { label: 'готово', color: 'success' },
  error: { label: 'ошибка', color: 'error' },
  cancelled: { label: 'отменено', color: 'default' },
  no_music: { label: 'без музыки', color: 'warning' },
};

const ACTIVE = new Set([
  'counting',
  'queued',
  'paused',
  'downloading',
  'checking_music',
  'checking_duplicates',
  'compressing',
]);
/** The new video is compressed: its path is final, "Keep the new one" is available (tidy-reel/docs/downloader.md, section 5.1). */
const COMPRESSED = new Set(['done', 'original_waiting']);

type Run = (action: () => Promise<void>) => void;

/**
 * "Download queue" (docs/extension/pages/downloads.md, section 1; docs/extension/queues.md):
 * snapshots over the WebSocket while the tab is visible; videos come in pages by filters, by groups.
 */
export function QueuePage() {
  const [address, setAddress] = useQueueAddress('downloads');
  const { snapshot, online, error } = useServiceTopic('downloads', { filter: address.filters, page: address.page - 1 });
  const queue = snapshot?.queue ?? null;
  const items = snapshot?.items ?? null;
  const [message, setMessage] = useState('');
  const { target, setTarget } = useScrollTarget((items?.items ?? []).map((d) => d.id));
  const lastJump = useRef<Partial<Record<CounterKind, number>>>({});

  const run: Run = (action) => void action().catch((e: unknown) => setMessage(errorText(e)));

  /** Counter click: the page with the next such video under the current filters, wrapping around; the filter does not change. */
  const jump = (kind: CounterKind) =>
    run(async () => {
      const found = await nextItem(kind, lastJump.current[kind] ?? null, address.filters);
      if (!found) return;
      lastJump.current[kind] = found.id;
      if (found.page + 1 !== address.page) setAddress({ ...address, page: found.page + 1 });
      setTarget(found.id);
    });

  const byGroup = new Map<number, DownloadItem[]>();
  for (const d of items?.items ?? []) byGroup.set(d.group_id, [...(byGroup.get(d.group_id) ?? []), d]);
  const groups = (queue?.groups ?? []).filter((g) => byGroup.has(g.id));

  return (
    <Stack spacing={1}>
      {queue && <QueueCounters counters={queue.counters} onJump={jump} />}
      {!online && <Alert severity="warning">Локальный сервис Tidy Reel не отвечает</Alert>}
      {error && <Alert severity="warning">{error}</Alert>}
      {message && (
        <Alert severity="error" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {queue && (
        <QueuePanel
          pause={queue.pause}
          remaining={remainingText(queue.remaining, 'video')}
          onPause={(paused) => run(() => pauseQueue(paused))}
        />
      )}
      <QueueFilters value={address.filters} onChange={(filters) => setAddress({ filters, page: 1 })} />
      {items && groups.length === 0 && (
        <Typography color="text.secondary">
          {queue?.groups.length
            ? 'По этим фильтрам видео нет.'
            : 'Очередь пуста. Скачать можно кнопкой на странице видео или во всплывающем окне.'}
        </Typography>
      )}
      {groups.map((group) => (
        <GroupItem key={group.id} group={group} items={byGroup.get(group.id)!} target={target} run={run} />
      ))}
      {items && (
        <QueuePager
          total={items.total}
          pageSize={items.page_size}
          page={address.page}
          onPage={(page) => setAddress({ ...address, page })}
        />
      )}
    </Stack>
  );
}

function GroupItem({
  group,
  items,
  target,
  run,
}: {
  group: GroupSummary;
  items: DownloadItem[];
  target: number | null;
  run: Run;
}) {
  const live = group.remaining.count > 0 || group.remaining.counting;
  const act = (action: GroupAction) => run(() => groupAction(group.id, action));
  // A group of one video looks like a plain row (tidy-reel/docs/downloader.md, section 2.1).
  if (group.kind === 'video' && group.videos === 1 && items.length === 1) {
    return (
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5 }}>
        <DownloadRow download={items[0]!} target={target === items[0]!.id} run={run} />
      </Box>
    );
  }
  return (
    <Accordion disableGutters variant="outlined" defaultExpanded>
      <AccordionSummary>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap>{group.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {remainingText(group.remaining, 'video')} · сделано {group.finished} из {group.videos}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()} sx={{ alignItems: 'center' }}>
            <Tooltip title="Выше">
              <IconButton size="small" onClick={() => act('up')}>
                <ArrowUpward fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ниже">
              <IconButton size="small" onClick={() => act('down')}>
                <ArrowDownward fontSize="small" />
              </IconButton>
            </Tooltip>
            {live && (
              <Button size="small" onClick={() => act(group.paused ? 'resume' : 'pause')}>
                {group.paused ? 'Продолжить' : 'Пауза'}
              </Button>
            )}
            {live && (
              <Button size="small" color="warning" onClick={() => act('cancel')}>
                Отменить
              </Button>
            )}
            <Button size="small" color="inherit" onClick={() => act('delete')}>
              В корзину
            </Button>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {items.map((d) => (
          <DownloadRow key={d.id} download={d} target={target === d.id} run={run} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

function DownloadRow({ download, target, run }: { download: DownloadItem; target: boolean; run: Run }) {
  const state = STATES[download.state] ?? { label: download.state, color: 'default' as const };
  const working = download.state === 'downloading' || download.state === 'compressing';
  const act = (action: DownloadAction) => run(() => downloadAction(download.id, action));
  const times = videoTimes(download);
  const below = download.error?.text ?? download.file_path ?? download.folder;
  return (
    <Box
      id={`queue-item-${download.id}`}
      sx={{ py: 0.5, borderRadius: 1, bgcolor: target ? 'action.selected' : undefined }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Stack>
          <IconButton size="small" sx={{ p: 0 }} aria-label="Выше" onClick={() => act('up')}>
            <ArrowUpward sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" sx={{ p: 0 }} aria-label="Ниже" onClick={() => act('down')}>
            <ArrowDownward sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap title={download.title ?? download.url}>
            {download.title ?? download.url}
          </Typography>
          <Typography
            variant="body2"
            color={download.state === 'error' ? 'error' : 'text.secondary'}
            noWrap
            title={below}
          >
            {below}
          </Typography>
        </Box>
        {times.map((time) => (
          <Typography key={time} variant="body2" color="text.secondary">
            {time}
          </Typography>
        ))}
        {download.published_at && (
          <Typography variant="body2" color="text.secondary">
            {download.published_at}
          </Typography>
        )}
        <Chip size="small" color={state.color} label={state.label} />
        {download.state === 'done' && (
          <>
            <Button size="small" onClick={() => act('show')}>
              Показать в папке
            </Button>
            <Button size="small" onClick={() => act('open')}>
              Открыть
            </Button>
          </>
        )}
        {download.state === 'original_waiting' && (
          <>
            <Button size="small" onClick={() => act('show')}>
              Показать в папке
            </Button>
            <Button size="small" onClick={() => act('original-open')}>
              Открыть оригинал
            </Button>
            <Button size="small" onClick={() => act('open')}>
              Открыть сжатое
            </Button>
            <Button size="small" variant="contained" onClick={() => act('original-done')}>
              Готово
            </Button>
          </>
        )}
        {download.state === 'error' && (
          <Button size="small" onClick={() => act('skip')}>
            Пропустить
          </Button>
        )}
        {(download.state === 'error' || download.state === 'cancelled') && (
          <Button size="small" onClick={() => act('retry')}>
            Повторить
          </Button>
        )}
        {ACTIVE.has(download.state) && (
          <Button size="small" color="warning" onClick={() => act('cancel')}>
            Отменить
          </Button>
        )}
      </Stack>
      {working && (
        <LinearProgress
          variant={download.progress == null ? 'indeterminate' : 'determinate'}
          value={(download.progress ?? 0) * 100}
          sx={{ mt: 0.5 }}
        />
      )}
      {download.messages.map((m) => (
        <MessageLine key={m.id} message={m} onRead={() => run(() => readMessage(m.id))}>
          <MessageActions message={m} download={download} run={run} />
        </MessageLine>
      ))}
    </Box>
  );
}

/** Video time: while downloading, the remainder from yt-dlp; the compression estimate comes from the site duration. */
function videoTimes(d: DownloadItem): string[] {
  const times: string[] = [];
  if (d.state === 'downloading' && d.eta_seconds != null) times.push(`скачается ${formatDuration(d.eta_seconds)}`);
  if (ACTIVE.has(d.state) && d.compress_seconds != null && d.compress_bytes != null) {
    const time = formatDuration(d.compress_seconds);
    const size = formatSize(d.compress_bytes);
    times.push(d.compress_approximate ? `сжатие ${time}, ≈ ${size} (приблизительно)` : `сжатие ${time}, ≈ ${size}`);
  }
  return times;
}

/** Buttons of a duplicate or part message (tidy-reel/docs/downloader.md, section 5.1). */
function MessageActions({ message, download, run }: { message: QueueMessage; download: DownloadItem; run: Run }) {
  const archive = (action: 'open' | 'show' | 'play') => run(() => messageAction(message.id, action));
  if (message.code === 'duplicate_found')
    return (
      <>
        <Button size="small" variant="contained" onClick={() => run(() => decideDuplicate(download.id, 'old'))}>
          Оставить старое
        </Button>
        <Tooltip title={COMPRESSED.has(download.state) ? '' : 'Доступно, когда новое сожмётся'}>
          <span>
            <Button
              size="small"
              disabled={!COMPRESSED.has(download.state)}
              onClick={() => run(() => decideDuplicate(download.id, 'new'))}
            >
              Оставить новое
            </Button>
          </span>
        </Tooltip>
        <Button size="small" onClick={() => run(() => decideDuplicate(download.id, 'both'))}>
          Оставить оба
        </Button>
        <Button size="small" onClick={() => archive('open')}>
          Открыть старое
        </Button>
        <Button
          size="small"
          disabled={!download.file_path}
          onClick={() => run(() => downloadAction(download.id, 'open'))}
        >
          Открыть новое
        </Button>
      </>
    );
  if (message.code === 'duplicate_deleted')
    return (
      <>
        <Button size="small" onClick={() => archive('open')}>
          Открыть
        </Button>
        <Button size="small" onClick={() => archive('show')}>
          Показать в папке
        </Button>
      </>
    );
  if (message.code === 'part_of' || message.code === 'shared_piece')
    return (
      <>
        <Button size="small" onClick={() => archive('play')}>
          Воспроизвести с этого места
        </Button>
        <Button size="small" onClick={() => archive('show')}>
          Показать в папке
        </Button>
        <Button size="small" onClick={() => archive('open')}>
          Открыть
        </Button>
      </>
    );
  return null;
}
