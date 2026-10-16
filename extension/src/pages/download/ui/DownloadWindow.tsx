import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import {
  type ChannelCheck,
  type Check,
  checkChannel,
  checkVideo,
  createModel,
  enqueueChannel,
  enqueueVideo,
  type Filters,
  categories as listCategories,
  type PageKind,
  pageKind,
  pickFolder,
  requestCookieAccess,
  subscribe,
} from '@/entities/download';
import { CreateFooter } from '@/entities/queue';
import {
  DEFAULT_FIELDS,
  listPresets,
  type Preset,
  type PresetFields,
  PresetFieldsEditor,
} from '@/features/recompress-presets';
import { errorText, hostOf } from '@/shared/lib';

/** Where to: the model's `New` folder, a tag inside a model, a new model or a folder without a model. */
type Target = { kind: 'folder'; folder: string } | { kind: 'create' } | { kind: 'other' };

/** The "Download" window (docs/extension/pages/downloads.md): video or channel, folder, one-time preset. */
export function DownloadWindow() {
  const url = useMemo(addressFromHash, []);
  const [kind, setKind] = useState<PageKind>(() => pageKind(url) ?? 'video');
  const [check, setCheck] = useState<Check | ChannelCheck | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [folder, setFolder] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [edits, setEdits] = useState<Partial<PresetFields>>({});
  const [filters, setFilters] = useState<Filters>({ from_end: false, music_only: false });
  const [onlyNew, setOnlyNew] = useState(true);
  const [keepOriginal, setKeepOriginal] = useState(false);
  const [start, setStart] = useState(true);
  /** How many pass the filters; `null` means still counting (tidy-reel/docs/downloader.md, section 6.0). */
  const [matching, setMatching] = useState<number | null>(null);

  async function load(nextKind = kind) {
    setBusy(true);
    setError('');
    setCheck(null);
    try {
      setCheck(nextKind === 'video' ? await checkVideo(url) : await checkChannel(url));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  // Recount on a filter change: the service keeps the channel list in memory and does not contact the site.
  useEffect(() => {
    if (kind !== 'channel' || !check || !('videos' in check)) return;
    let alive = true;
    setMatching(null);
    const timer = setTimeout(() => {
      void checkChannel(url, filters)
        .then((c) => alive && setMatching(c.matching))
        .catch((e: unknown) => {
          console.error(e);
          if (alive) setMatching(null);
        });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [url, filters, check, kind]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the check runs once when the window opens; later only on demand.
  useEffect(() => {
    void load();
    void listPresets()
      .then((r) => setPresets(r.presets))
      .catch((e: unknown) => {
        console.error(e);
        setPresets([]);
      });
  }, []);

  const defaults = presets.find((p) => p.is_default);
  const site = sitePreset(presets, url);
  const base: PresetFields = {
    ...DEFAULT_FIELDS,
    ...(defaults?.fields ?? {}),
    ...(site?.fields ?? {}),
  } as PresetFields;
  const presetEdits = Object.keys(edits).length ? (edits as Record<string, unknown>) : null;

  async function submit(action: 'video' | 'channel' | 'subscribe') {
    if (!folder) return;
    setBusy(true);
    try {
      const options = { keepOriginal, start };
      if (action === 'video') await enqueueVideo(url, folder, (check as Check).video.title, presetEdits, options);
      else if (action === 'channel') await enqueueChannel(url, folder, filters, presetEdits, options);
      else await subscribe(url, folder, filters, presetEdits, onlyNew);
      location.hash = action === 'subscribe' ? 'downloads/subscriptions' : 'downloads';
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const video = check && 'video' in check ? check : null;
  const channel = check && 'videos' in check ? check : null;
  return (
    <Stack spacing={2} sx={{ maxWidth: 900 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flex: 1 }} noWrap title={url}>
          {url}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={kind}
          onChange={(_, v: PageKind | null) => {
            if (!v) return;
            setKind(v);
            void load(v);
          }}
        >
          <ToggleButton value="video">Видео</ToggleButton>
          <ToggleButton value="channel">Канал</ToggleButton>
        </ToggleButtonGroup>
        <Button size="small" onClick={() => void requestCookieAccess(url).then(() => load())}>
          Разрешить куки сайта
        </Button>
      </Stack>
      {busy && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {video && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography>{video.video.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {[
              video.video.channel,
              video.video.published_at,
              video.video.duration ? `${Math.round(video.video.duration / 60)} мин` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
          {video.downloaded && <Alert severity="info">Уже скачано: {video.downloaded}</Alert>}
        </Paper>
      )}
      {channel && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography>{channel.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Видео на канале: {channel.videos}, уже скачано: {channel.downloaded}
          </Typography>
          <Typography variant="body2" color={matching === 0 ? 'error' : 'text.primary'}>
            {matching === null
              ? 'Считается, сколько скачается…'
              : matching === 0
                ? 'По фильтрам видео нет'
                : `Скачается видео: ${matching}`}
          </Typography>
        </Paper>
      )}
      {check && (
        <FolderChoice
          found={check}
          channelUrl={video ? (video.video.channel_url ?? url) : url}
          channelName={video ? (video.video.channel ?? '') : (channel?.title ?? '')}
          onFolder={setFolder}
        />
      )}
      {channel && <FiltersForm filters={filters} onChange={setFilters} />}
      {check && presets.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            Сжатие: {site ? `пресет «${site.name}»` : '«По умолчанию»'}; галочка — своё значение на этот раз
          </Typography>
          <PresetFieldsEditor fields={edits} base={base} onChange={setEdits} />
        </Stack>
      )}
      {check && (
        <FormControlLabel
          control={<Checkbox size="small" checked={keepOriginal} onChange={(_, v) => setKeepOriginal(v)} />}
          label="Временно сохранить оригинал — рядом со сжатым до галочки «Готово» в очереди"
        />
      )}
      {check && (
        <CreateFooter start={start} onStart={setStart}>
          {video && (
            <Button variant="contained" disabled={!folder || busy} onClick={() => void submit('video')}>
              {video.downloaded ? 'Скачать ещё раз' : 'Скачать'}
            </Button>
          )}
          {channel && (
            <>
              {/* No need to wait for the count: the group is queued showing "counting…". */}
              <Button
                variant="contained"
                disabled={!folder || busy || matching === 0}
                onClick={() => void submit('channel')}
              >
                Скачать канал
              </Button>
              <Button variant="outlined" disabled={!folder || busy} onClick={() => void submit('subscribe')}>
                Подписаться
              </Button>
              <FormControlLabel
                control={<Checkbox size="small" checked={onlyNew} onChange={(_, v) => setOnlyNew(v)} />}
                label="Подписка: только новое"
              />
            </>
          )}
          {!folder && (
            <Typography variant="body2" color="text.secondary">
              Выберите папку
            </Typography>
          )}
        </CreateFooter>
      )}
    </Stack>
  );
}

function addressFromHash(): string {
  const [, ...rest] = location.hash.slice(1).split('/');
  return decodeURIComponent(rest.join('/'));
}

/** Site preset by address: the site label appears in the domain (YouTube for youtube.com). */
function sitePreset(presets: readonly Preset[], url: string): Preset | undefined {
  const host = hostOf(url).toLowerCase();
  return presets.find((p) => !p.is_default && p.sites.some((label) => host.includes(label.toLowerCase())));
}

function FolderChoice({
  found,
  channelUrl,
  channelName,
  onFolder,
}: {
  found: { models: string[]; folder: string | null; found_by: string | null; recent: string[] };
  channelUrl: string;
  channelName: string;
  onFolder: (folder: string | null) => void;
}) {
  const options = useMemo(() => {
    const list = found.models.map((model) => ({ label: `${model}\\New`, folder: `${model}\\New` }));
    return list;
  }, [found.models]);
  const [target, setTarget] = useState<Target>(
    found.folder
      ? { kind: 'folder', folder: found.folder }
      : options[0]
        ? { kind: 'folder', folder: options[0].folder }
        : { kind: 'other' },
  );
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [name, setName] = useState(channelName);
  const [error, setError] = useState('');

  useEffect(() => onFolder(target.kind === 'folder' ? target.folder : null), [target, onFolder]);
  useEffect(() => {
    if (target.kind === 'create' && categoryList.length === 0) void listCategories().then(setCategoryList);
  }, [target, categoryList.length]);

  async function choose(initial?: string) {
    try {
      const folder = await pickFolder(initial);
      if (folder) setTarget({ kind: 'folder', folder });
    } catch (e) {
      setError(errorText(e));
    }
  }

  async function create() {
    try {
      setTarget({ kind: 'folder', folder: await createModel(category, channelUrl, name) });
    } catch (e) {
      setError(errorText(e));
    }
  }

  const value = target.kind === 'folder' ? target.folder : target.kind;
  const extra =
    target.kind === 'folder' && !options.some((o) => o.folder === target.folder) ? target.folder : undefined;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Куда</Typography>
      {found.found_by === 'name' && (
        <Typography variant="body2">Модель нашлась только по имени канала — проверьте выбор.</Typography>
      )}
      <RadioGroup
        value={value}
        onChange={(_, v) => setTarget(v === 'create' || v === 'other' ? { kind: v } : { kind: 'folder', folder: v })}
      >
        {options.map((o) => (
          <Stack key={o.folder} direction="row" sx={{ alignItems: 'center' }}>
            <FormControlLabel value={o.folder} control={<Radio size="small" />} label={o.label} />
            <Button size="small" onClick={() => void choose(o.folder.replace(/\\New$/, ''))}>
              Другой тег…
            </Button>
          </Stack>
        ))}
        {extra && <FormControlLabel value={extra} control={<Radio size="small" />} label={extra} />}
        <FormControlLabel value="create" control={<Radio size="small" />} label="Создать модель" />
        <FormControlLabel value="other" control={<Radio size="small" />} label="Папка без модели" />
      </RadioGroup>
      {target.kind === 'create' && (
        <Stack direction="row" spacing={1}>
          <TextField
            select
            size="small"
            label="Категория"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 320 }}
          >
            {categoryList.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="Имя модели" value={name} onChange={(e) => setName(e.target.value)} />
          <Button disabled={!category || !name.trim()} onClick={() => void create()}>
            Создать
          </Button>
        </Stack>
      )}
      {target.kind === 'other' && (
        <Stack spacing={0.5}>
          {found.recent.map((folder) => (
            <Button
              key={folder}
              size="small"
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
              onClick={() => setTarget({ kind: 'folder', folder })}
            >
              {folder}
            </Button>
          ))}
          <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => void choose()}>
            Выбрать папку…
          </Button>
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}

function FiltersForm({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const num = (v: string) => (v.trim() ? Number(v) : null);
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Фильтры</Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          type="date"
          label="Опубликованы с"
          value={filters.date_from ?? ''}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value || null })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label="по"
          value={filters.date_to ?? ''}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value || null })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          size="small"
          type="number"
          label="Видео с №"
          value={filters.number_from ?? ''}
          onChange={(e) => onChange({ ...filters, number_from: num(e.target.value) })}
          sx={{ width: 140 }}
        />
        <TextField
          size="small"
          type="number"
          label="по №"
          value={filters.number_to ?? ''}
          onChange={(e) => onChange({ ...filters, number_to: num(e.target.value) })}
          sx={{ width: 140 }}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filters.from_end ? 'end' : 'start'}
          onChange={(_, v: string | null) => v && onChange({ ...filters, from_end: v === 'end' })}
        >
          <ToggleButton value="start">с начала (от старых)</ToggleButton>
          <ToggleButton value="end">с конца (от новых)</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          type="number"
          label="Длительность от, мин"
          value={filters.min_duration ? filters.min_duration / 60 : ''}
          onChange={(e) => onChange({ ...filters, min_duration: e.target.value ? Number(e.target.value) * 60 : null })}
          sx={{ width: 200 }}
        />
        <TextField
          size="small"
          type="number"
          label="до, мин"
          value={filters.max_duration ? filters.max_duration / 60 : ''}
          onChange={(e) => onChange({ ...filters, max_duration: e.target.value ? Number(e.target.value) * 60 : null })}
          sx={{ width: 140 }}
        />
      </Stack>
      <FormControlLabel
        disabled
        control={<Checkbox size="small" />}
        label="Только с музыкой — после распознавания музыки в Tidy Reel"
      />
    </Stack>
  );
}
