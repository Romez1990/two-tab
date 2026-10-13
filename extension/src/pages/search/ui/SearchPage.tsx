import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { savedItemPageUrl } from '@/entities/saved';
import { forgetSearch, listSearchHistory, rememberSearch, suggest, type SearchQuery } from '@/entities/search-query';
import { localServiceClient } from '@/shared/api';
import { browser } from '@/shared/browser';
import { getSettings } from '@/shared/config';
import { SearchSyntaxError, formatDateTime, parseQuery } from '@/shared/lib';
import { Favicon, SMART_SEARCH_HINT, SmartHint, usePaging } from '@/shared/ui';
import { ARCHIVE_SHOWN_LIMIT, DEFAULT_SOURCES, SOURCE_TITLES, search, type Found, type Sort, type Source } from '../model/collect';

const SOURCES: Source[] = ['open', 'saved', 'archive', 'closed', 'snapshot'];

async function goTo(found: Found, background: boolean): Promise<string | undefined> {
  switch (found.source) {
    case 'open':
      await browser.tabs.update(found.tabId, { active: true });
      await browser.windows.update(found.windowId, { focused: true });
      return;
    case 'saved':
      await browser.tabs.create({ url: savedItemPageUrl(found.savedId, found.url), active: !background });
      return;
    case 'closed':
    case 'snapshot':
      await browser.tabs.create({ url: found.url, active: !background });
      return;
    case 'archive':
      return;
  }
}

async function archiveAction(fileId: number, action: 'open' | 'show'): Promise<string | undefined> {
  const { localServicePort, localServiceKey } = await getSettings();
  const client = localServiceClient(localServicePort, localServiceKey);
  const path = action === 'open' ? '/api/archive/files/{file_id}/open' : '/api/archive/files/{file_id}/show';
  try {
    const { response, error } = await client.POST(path, { params: { path: { file_id: fileId } } });
    if (response.ok) return undefined;
    return response.status === 404 ? 'Файл переместили, нужна индексация' : `Ошибка ${response.status}: ${JSON.stringify(error)}`;
  } catch {
    return 'Локальный сервис video-analyzer не отвечает';
  }
}

function ResultRow({ found, onMessage }: { found: Found; onMessage: (text: string) => void }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isArchive = found.source === 'archive';
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {!isArchive && <Favicon url={found.url} size={16} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap title={found.title}>
            {found.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {isArchive ? found.path : found.url}
            {found.source === 'saved' && found.group ? ` · ${found.group}` : ''}
          </Typography>
        </Box>
        <Chip size="small" label={SOURCE_TITLES[found.source]} />
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {found.date ? formatDateTime(found.date) : ''}
        </Typography>
        {isArchive ? (
          <>
            <Button size="small" onClick={() => void archiveAction(found.fileId, 'open').then((m) => m && onMessage(m))}>
              Открыть
            </Button>
            <Button size="small" onClick={() => void archiveAction(found.fileId, 'show').then((m) => m && onMessage(m))}>
              Показать в папке
            </Button>
          </>
        ) : (
          <Button
            size="small"
            onClick={() => void goTo(found, false)}
            onAuxClick={(e) => e.button === 1 && void goTo(found, true)}
          >
            {found.source === 'open' ? 'Перейти к вкладке' : found.source === 'saved' ? 'Перейти к группе' : 'Открыть'}
          </Button>
        )}
      </Stack>
      {isArchive && found.shortcuts.length > 0 && (
        <>
          <Link component="button" variant="body2" onClick={() => setShortcutsOpen((o) => !o)}>
            Ярлыков: {found.shortcuts.length}
          </Link>
          <Collapse in={shortcutsOpen}>
            {found.shortcuts.map((path) => (
              <Typography key={path} variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                {path}
              </Typography>
            ))}
          </Collapse>
        </>
      )}
    </Paper>
  );
}

/** «Поиск» (docs/extension/pages/search.md): вкладки и архив одним списком, «умный поиск» по Enter. */
export function SearchPage() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<SearchQuery[]>([]);
  const [sources, setSources] = useState<Source[]>(DEFAULT_SOURCES);
  const [connected, setConnected] = useState(false);
  const [sort, setSort] = useState<Sort>('relevance');
  const [ran, setRan] = useState<{ query: string; sort: Sort; sources: Source[] } | null>(null);
  const [results, setResults] = useState<Found[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    void listSearchHistory().then(setHistory);
    void getSettings().then((s) => setConnected(Boolean(s.localServiceKey)));
  }, []);
  const active = sources.filter((s) => s !== 'archive' || connected);

  async function run(query: string, nextSort = sort, nextSources = active) {
    setError('');
    setNote('');
    let condition;
    try {
      condition = parseQuery(query);
    } catch (e) {
      setError(e instanceof SearchSyntaxError ? e.message : String(e));
      return;
    }
    if (!condition) return;
    setHistory(await rememberSearch(query));
    setBusy(true);
    try {
      const outcome = await search(condition, nextSources, nextSort);
      setResults(outcome.results);
      setRan({ query, sort: nextSort, sources: nextSources });
      if (outcome.archiveError) setNote(`Архив: ${outcome.archiveError}`);
      else if (outcome.archiveTotal > ARCHIVE_SHOWN_LIMIT)
        setNote(`В архиве найдено ${outcome.archiveTotal}, показаны ${ARCHIVE_SHOWN_LIMIT} лучших: уточните запрос`);
    } finally {
      setBusy(false);
    }
  }

  const { visible, footer } = usePaging(results, { storageKey: 'tabsurd.searchPaging', resetKey: ran });
  const options = suggest(history, input).map((item) => item.query);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Autocomplete
          freeSolo
          fullWidth
          options={options}
          filterOptions={(o) => o}
          inputValue={input}
          onInputChange={(_, value) => setInput(value)}
          onChange={(_, value) => {
            if (typeof value === 'string' && value) {
              setInput(value);
              void run(value);
            }
          }}
          renderOption={({ key, ...props }, option) => (
            <Box component="li" key={key} {...props} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{option}</span>
              <IconButton
                size="small"
                aria-label="Забыть запрос"
                onClick={(e) => {
                  e.stopPropagation();
                  void forgetSearch(option).then(setHistory);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              placeholder="Поиск: Enter — найти"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !(e.nativeEvent as KeyboardEvent).isComposing) {
                  e.preventDefault();
                  void run(input);
                }
              }}
            />
          )}
        />
        <SmartHint rows={SMART_SEARCH_HINT} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {SOURCES.map((source) => (
          <FormControlLabel
            key={source}
            label={SOURCE_TITLES[source]}
            disabled={source === 'archive' && !connected}
            control={
              <Checkbox
                size="small"
                checked={sources.includes(source) && (source !== 'archive' || connected)}
                onChange={(_, checked) => setSources((s) => (checked ? [...s, source] : s.filter((x) => x !== source)))}
              />
            }
          />
        ))}
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={sort}
          onChange={(_, value: Sort | null) => {
            if (!value) return;
            setSort(value);
            if (ran) void run(ran.query, value, active);
          }}
        >
          <ToggleButton value="relevance">По совпадению</ToggleButton>
          <ToggleButton value="date">По дате</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {!connected && (
        <Typography variant="body2" color="text.secondary">
          Архив ищется, когда профиль подключён к video-analyzer (Настройки).
        </Typography>
      )}
      {busy && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {note && <Alert severity="info" onClose={() => setNote('')}>{note}</Alert>}
      {ran && !busy && (
        <Typography variant="body2" color="text.secondary">
          Найдено: {results.length}
        </Typography>
      )}
      <Stack spacing={1}>
        {visible.map((found) => (
          <ResultRow key={found.key} found={found} onMessage={setNote} />
        ))}
      </Stack>
      {footer}
    </Stack>
  );
}
