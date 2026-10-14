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
import { useEffect, useState } from 'react';
import { downloadAction, feedCookies, groupAction, listQueue, type Download, type DownloadAction, type Group, type GroupAction } from '@/entities/download';

/** Состояния очереди по-русски (tidy-reel/docs/downloader.md, раздел 9). */
const STATES: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' }> = {
  queued: { label: 'в очереди', color: 'default' },
  paused: { label: 'на паузе', color: 'default' },
  downloading: { label: 'качается', color: 'primary' },
  checking_music: { label: 'проверяется музыка', color: 'primary' },
  compressing: { label: 'сжимается', color: 'primary' },
  done: { label: 'готово', color: 'success' },
  error: { label: 'ошибка', color: 'error' },
  cancelled: { label: 'отменено', color: 'default' },
  no_music: { label: 'без музыки', color: 'warning' },
};

const ACTIVE = new Set(['queued', 'paused', 'downloading', 'checking_music', 'compressing']);
const POLL_MS = 1000;
/** Куки сайтов очереди отправляются не так часто, как опрашивается очередь. */
const COOKIES_EVERY = 30;

function DownloadRow({ download, run }: { download: Download; run: (id: number, action: DownloadAction) => void }) {
  const state = STATES[download.state] ?? { label: download.state, color: 'default' as const };
  const working = download.state === 'downloading' || download.state === 'compressing';
  return (
    <Box sx={{ py: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Stack>
          <IconButton size="small" sx={{ p: 0 }} aria-label="Выше" onClick={() => run(download.id, 'up')}>
            <ArrowUpward sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" sx={{ p: 0 }} aria-label="Ниже" onClick={() => run(download.id, 'down')}>
            <ArrowDownward sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap title={download.title ?? download.url}>
            {download.title ?? download.url}
          </Typography>
          <Typography variant="body2" color={download.state === 'error' ? 'error' : 'text.secondary'} noWrap title={download.error ?? download.file_path ?? download.folder}>
            {download.error ?? download.file_path ?? download.folder}
          </Typography>
        </Box>
        {download.published_at && (
          <Typography variant="body2" color="text.secondary">
            {download.published_at}
          </Typography>
        )}
        <Chip size="small" color={state.color} label={state.label} />
        {download.state === 'done' && (
          <>
            <Button size="small" onClick={() => run(download.id, 'show')}>
              Показать в папке
            </Button>
            <Button size="small" onClick={() => run(download.id, 'open')}>
              Открыть
            </Button>
          </>
        )}
        {(download.state === 'error' || download.state === 'cancelled') && (
          <Button size="small" onClick={() => run(download.id, 'retry')}>
            Повторить
          </Button>
        )}
        {ACTIVE.has(download.state) && (
          <Button size="small" color="warning" onClick={() => run(download.id, 'cancel')}>
            Отменить
          </Button>
        )}
      </Stack>
      {working && <LinearProgress variant={download.progress == null ? 'indeterminate' : 'determinate'} value={(download.progress ?? 0) * 100} sx={{ mt: 0.5 }} />}
    </Box>
  );
}

function groupSummary(group: Group): string {
  const counts = new Map<string, number>();
  for (const d of group.downloads) counts.set(d.state, (counts.get(d.state) ?? 0) + 1);
  return [...counts].map(([state, n]) => `${STATES[state]?.label ?? state}: ${n}`).join(' · ');
}

function GroupItem({ group, runGroup, runDownload }: { group: Group; runGroup: (action: GroupAction) => void; runDownload: (id: number, action: DownloadAction) => void }) {
  const live = group.downloads.some((d) => ACTIVE.has(d.state));
  const controls = (
    <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()} sx={{ alignItems: 'center' }}>
      <Tooltip title="Выше">
        <IconButton size="small" onClick={() => runGroup('up')}>
          <ArrowUpward fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Ниже">
        <IconButton size="small" onClick={() => runGroup('down')}>
          <ArrowDownward fontSize="small" />
        </IconButton>
      </Tooltip>
      {live && (
        <Button size="small" onClick={() => runGroup(group.paused ? 'resume' : 'pause')}>
          {group.paused ? 'Продолжить' : 'Пауза'}
        </Button>
      )}
      {live && (
        <Button size="small" color="warning" onClick={() => runGroup('cancel')}>
          Отменить
        </Button>
      )}
    </Stack>
  );
  // Группа из одного видео выглядит как обычная строка (tidy-reel/docs/downloader.md, раздел 2.1).
  if (group.kind === 'video' && group.downloads.length === 1) {
    return (
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5 }}>
        <DownloadRow download={group.downloads[0]!} run={runDownload} />
      </Box>
    );
  }
  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap>{group.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {groupSummary(group)}
            </Typography>
          </Box>
          {controls}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {group.downloads.map((d) => (
          <DownloadRow key={d.id} download={d} run={runDownload} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

/** «Очередь скачивания» (docs/extension/pages/downloads.md, раздел 1): опрос раз в секунду, пока страница открыта. */
export function QueuePage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    let tick = 0;
    const poll = async () => {
      try {
        const next = await listQueue();
        if (!alive) return;
        setGroups(next);
        setError('');
        if (tick++ % COOKIES_EVERY === 0) await feedCookies(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Локальный сервис Tidy Reel не отвечает');
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const run = (action: () => Promise<void>) =>
    void action().catch((e: unknown) => setMessage(e instanceof Error ? e.message : String(e)));

  return (
    <Stack spacing={1}>
      {error && <Alert severity="warning">{error}</Alert>}
      {message && (
        <Alert severity="error" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {groups?.length === 0 && <Typography color="text.secondary">Очередь пуста. Скачать можно кнопкой на странице видео или во всплывающем окне.</Typography>}
      {(groups ?? []).map((group) => (
        <GroupItem
          key={group.id}
          group={group}
          runGroup={(action) => run(() => groupAction(group.id, action))}
          runDownload={(id, action) => run(() => downloadAction(id, action))}
        />
      ))}
    </Stack>
  );
}
