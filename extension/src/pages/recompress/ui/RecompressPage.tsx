import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import WarningAmber from '@mui/icons-material/WarningAmber';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { pickFolder } from '@/entities/download';
import {
  CreateFooter,
  MessageLine,
  QueueCounters,
  QueueFilters,
  QueuePager,
  QueuePanel,
  formatDuration,
  formatSize,
  remainingText,
  useQueueAddress,
  useScrollTarget,
  type CounterKind,
} from '@/entities/queue';
import {
  checkJob,
  createJob,
  fileAction,
  jobAction,
  nextItem,
  pauseQueue,
  readMessage,
  type FileCheck,
  type Job,
  type JobAction,
  type JobCheck,
  type JobFile,
} from '@/entities/recompress';
import { DEFAULT_FIELDS, listPresets, PresetFieldsEditor, type Preset, type PresetFields } from '@/features/recompress-presets';
import { useServiceTopic } from '@/shared/api';
import { errorText } from '@/shared/lib';


type Run = (action: () => Promise<void>) => void;

const JOB_STATES: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' }> = {
  queued: { label: 'в очереди', color: 'default' },
  paused: { label: 'на паузе', color: 'default' },
  running: { label: 'сжимается', color: 'primary' },
  done: { label: 'готово', color: 'success' },
  error: { label: 'ошибка', color: 'error' },
  cancelled: { label: 'отменено', color: 'default' },
};

/** File outcome (docs/codes.md in Tidy Reel, section 1). */
const OUTCOMES: Record<string, string> = {
  compressed: 'сжато',
  source_kept: 'сжатое вышло больше, оставлен исходник',
  video_kept: 'оставлена исходная картинка, сжат звук',
  sound_only: 'перекодирован только звук',
  normalized: 'только нормализация звука',
  below_threshold: 'битрейт ниже порога, не тронут',
  silent: 'нормализовать нечего: нет звука',
};

const ACTIONS: Record<string, string> = { recompress: 'сжать', sound: 'только звук', skip: 'не изменится' };

/** "Compression queue" (docs/extension/pages/recompress.md): jobs in order, files in pages by filters. */
export function RecompressPage() {
  const [address, setAddress] = useQueueAddress('recompress');
  const { snapshot, online, error } = useServiceTopic('recompress', { filter: address.filters, page: address.page - 1 });
  const queue = snapshot?.queue ?? null;
  const items = snapshot?.items ?? null;
  const [message, setMessage] = useState('');
  const { target, setTarget } = useScrollTarget((items?.items ?? []).map((f) => f.id));
  const lastJump = useRef<Partial<Record<CounterKind, number>>>({});

  const run: Run = (action) => void action().catch((e: unknown) => setMessage(errorText(e)));

  const jump = (kind: CounterKind) =>
    run(async () => {
      const found = await nextItem(kind, lastJump.current[kind] ?? null, address.filters);
      if (!found) return;
      lastJump.current[kind] = found.id;
      if (found.page + 1 !== address.page) setAddress({ ...address, page: found.page + 1 });
      setTarget(found.id);
    });

  const byJob = new Map<number, JobFile[]>();
  for (const f of items?.items ?? []) byJob.set(f.job_id, [...(byJob.get(f.job_id) ?? []), f]);
  const jobs = (queue?.jobs ?? []).filter((j) => byJob.has(j.id));

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
      <NewJob run={run} />
      {queue && <QueuePanel pause={queue.pause} remaining={remainingText(queue.remaining, 'file')} onPause={(paused) => run(() => pauseQueue(paused))} />}
      <QueueFilters value={address.filters} onChange={(filters) => setAddress({ filters, page: 1 })} />
      {items && jobs.length === 0 && <Typography color="text.secondary">{queue?.jobs.length ? 'По этим фильтрам файлов нет.' : 'Заданий нет: создайте новое выше.'}</Typography>}
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} files={byJob.get(job.id)!} target={target} run={run} />
      ))}
      {items && <QueuePager total={items.total} pageSize={items.page_size} page={address.page} onPage={(page) => setAddress({ ...address, page })} />}
    </Stack>
  );
}

/** New job: folder, preset with edits in the common field order, file check, "Start the queue". */
function NewJob({ run }: { run: Run }) {
  const [folder, setFolder] = useState('');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [preset, setPreset] = useState('');
  const [edits, setEdits] = useState<Partial<PresetFields>>({});
  const [check, setCheck] = useState<JobCheck | null>(null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [start, setStart] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void listPresets()
      .then((r) => {
        setPresets(r.presets);
        setPreset(r.presets.find((p) => p.is_default)?.name ?? r.presets[0]?.name ?? '');
      })
      .catch((e: unknown) => {
        console.error(e);
        setPresets([]);
      });
  }, []);
  // Any edit makes the previous check invalid.
  useEffect(() => setCheck(null), [folder, preset, edits]);

  const defaults = presets.find((p) => p.is_default);
  const chosen = presets.find((p) => p.name === preset);
  const base = { ...DEFAULT_FIELDS, ...(defaults?.fields ?? {}), ...(chosen?.fields ?? {}) } as PresetFields;
  const presetEdits = Object.keys(edits).length ? (edits as Record<string, unknown>) : null;

  const busyRun = (action: () => Promise<void>) =>
    run(async () => {
      setBusy(true);
      try {
        await action();
      } finally {
        setBusy(false);
      }
    });

  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary>
        <Typography>Новое задание</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField size="small" label="Папка архива" value={folder} onChange={(e) => setFolder(e.target.value)} sx={{ flex: 1 }} />
            <Button size="small" onClick={() => run(async () => setFolder((await pickFolder(folder || undefined)) ?? folder))}>
              Выбрать папку…
            </Button>
            <TextField select size="small" label="Пресет" value={preset} onChange={(e) => setPreset(e.target.value)} sx={{ minWidth: 200 }}>
              {presets.map((p) => (
                <MenuItem key={p.id} value={p.name}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {presets.length > 0 && <PresetFieldsEditor fields={edits} base={base} onChange={setEdits} />}
          {busy && <LinearProgress />}
          {check && (
            <CheckList
              check={check}
              confirmed={confirmed}
              onConfirm={(path, on) =>
                setConfirmed((s) => {
                  const next = new Set(s);
                  if (on) next.add(path);
                  else next.delete(path);
                  return next;
                })
              }
            />
          )}
          <CreateFooter start={start} onStart={setStart}>
            <Button
              variant="outlined"
              disabled={!folder || !preset || busy}
              onClick={() =>
                busyRun(async () => {
                  setConfirmed(new Set());
                  setCheck(await checkJob(folder, preset, presetEdits));
                })
              }
            >
              Проверить файлы
            </Button>
            <Button
              variant="contained"
              disabled={!check || busy}
              onClick={() =>
                busyRun(async () => {
                  await createJob(folder, preset, presetEdits, [...confirmed], start);
                  setCheck(null);
                })
              }
            >
              Сжать
            </Button>
          </CreateFooter>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** All decisions before the start (recompress.md, section 6.2): warnings in one list, confirmation per file. */
function CheckList({ check, confirmed, onConfirm }: { check: JobCheck; confirmed: Set<string>; onConfirm: (path: string, on: boolean) => void }) {
  const noted = check.files.filter((f: FileCheck) => f.notices.length > 0);
  return (
    <Stack spacing={1}>
      <Typography variant="body2">
        Файлов: {check.files.length}
        {check.not_indexed > 0 && `, не в базе: ${check.not_indexed} (нужна индексация)`} · {formatDuration(check.seconds)} · ≈ освободится {formatSize(check.frees)}
      </Typography>
      {noted.map((file) => (
        <Paper key={file.path} variant="outlined" sx={{ px: 1.5, py: 0.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {file.needs_confirmation && (
              <Tooltip title="Без подтверждения файл не тронут">
                <Checkbox size="small" checked={confirmed.has(file.path)} onChange={(_, on) => onConfirm(file.path, on)} />
              </Tooltip>
            )}
            <Typography variant="body2" noWrap title={file.path} sx={{ flex: 1, minWidth: 0 }}>
              {fileName(file.path)} — {ACTIONS[file.action] ?? file.action}
            </Typography>
          </Stack>
          {file.notices.map((n) => (
            <Stack key={n.text} direction="row" spacing={1} sx={{ alignItems: 'center', pl: file.needs_confirmation ? 5 : 0 }}>
              <NoticeIcon kind={n.kind} />
              <Typography variant="body2">{n.text}</Typography>
            </Stack>
          ))}
        </Paper>
      ))}
    </Stack>
  );
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

/** File warning (tidy-reel/docs/recompress.md, section 6.1): yellow, red and with confirmation. */
function NoticeIcon({ kind }: { kind: string }) {
  if (kind === 'ours') return <WarningAmber fontSize="small" color="warning" />;
  if (kind === 'worse') return <WarningAmber fontSize="small" color="error" />;
  if (kind === 'checked' || kind === 'no_settings' || kind === 'mismatch') return <WarningAmber fontSize="small" color="error" />;
  return <InfoOutlined fontSize="small" color="info" />;
}

function JobItem({ job, files, target, run }: { job: Job; files: JobFile[]; target: number | null; run: Run }) {
  const act = (action: JobAction) => run(() => jobAction(job.id, action));
  const live = job.state === 'queued' || job.state === 'paused' || job.state === 'running';
  const state = JOB_STATES[job.state] ?? { label: job.state, color: 'default' as const };
  return (
    <Accordion disableGutters variant="outlined" defaultExpanded>
      <AccordionSummary>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap title={job.folder}>
              {job.folder}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              «{job.preset}» · сделано {job.done} из {job.total ?? '…'} · освобождено {formatSize(job.saved_bytes)}
              {live && ` · ${remainingText(job.remaining, 'file')}`}
            </Typography>
            {job.error && (
              <Typography variant="body2" color="error">
                {job.error.text}
              </Typography>
            )}
          </Box>
          <Chip size="small" color={state.color} label={state.label} />
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
              <Button size="small" onClick={() => act(job.state === 'paused' ? 'resume' : 'pause')}>
                {job.state === 'paused' ? 'Продолжить' : 'Пауза'}
              </Button>
            )}
            {live && (
              <Button size="small" color="warning" onClick={() => act('cancel')}>
                Отменить
              </Button>
            )}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {job.state === 'running' && job.current && (
          <Box sx={{ pb: 1 }}>
            <Typography variant="body2" noWrap title={job.current}>
              Сейчас: {fileName(job.current)}
            </Typography>
            <LinearProgress variant={job.progress == null ? 'indeterminate' : 'determinate'} value={(job.progress ?? 0) * 100} />
          </Box>
        )}
        {files.map((f) => (
          <FileRow key={f.id} file={f} target={target === f.id} run={run} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

function FileRow({ file, target, run }: { file: JobFile; target: boolean; run: Run }) {
  const sizes = file.size_before != null && file.size_after != null ? `${formatSize(file.size_before)} → ${formatSize(file.size_after)}` : '';
  const pending = file.state === 'queued' || file.state === 'running';
  return (
    <Box id={`queue-item-${file.id}`} sx={{ py: 0.5, borderRadius: 1, bgcolor: target ? 'action.selected' : undefined }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" noWrap title={file.path} sx={{ flex: 1, minWidth: 0 }}>
          {fileName(file.path)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[file.outcome ? (OUTCOMES[file.outcome] ?? file.outcome) : '', sizes, pending && file.estimate_seconds ? formatDuration(file.estimate_seconds) : '']
            .filter(Boolean)
            .join(' · ')}
        </Typography>
        <Chip size="small" color={JOB_STATES[file.state]?.color ?? 'default'} label={JOB_STATES[file.state]?.label ?? file.state} />
        {file.state === 'error' && (
          <>
            <Button size="small" onClick={() => run(() => fileAction(file.id, 'skip'))}>
              Пропустить
            </Button>
            <Button size="small" onClick={() => run(() => fileAction(file.id, 'retry'))}>
              Повторить
            </Button>
          </>
        )}
      </Stack>
      {file.messages.map((m) => (
        <MessageLine key={m.id} message={m} onRead={() => run(() => readMessage(m.id))} />
      ))}
    </Box>
  );
}
