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
import { useEffect, useRef, useState } from 'react';
import { savedItemPageUrl } from '@/entities/saved';
import { forgetSearch, listSearchHistory, rememberSearch, suggest, type SearchQuery } from '@/entities/search-query';
import { localServiceClient } from '@/shared/api';
import { browser } from '@/shared/browser';
import { getSettings } from '@/shared/config';
import { SEARCH_SOURCES, SearchSyntaxError, formatDateTime, mentionedSources, parseQuery } from '@/shared/lib';
import { Favicon, SMART_SEARCH_HINT, SmartHint, usePaging } from '@/shared/ui';
import { ARCHIVE_SHOWN_LIMIT, SOURCE_TITLES, search, type Found, type Sort, type Source } from '../model/collect';
import { EMPTY_STATE, readState, writeState, type SearchState } from '../model/url-state';

/** Search in the address after `#search` (docs/extension/pages/search.md, section 4). */
function stateOfAddress(): SearchState {
  const at = location.hash.indexOf('?');
  return at < 0 ? EMPTY_STATE : readState(location.hash.slice(at));
}

function pushAddress(state: SearchState) {
  const hash = `#search${writeState(state)}`;
  if (location.hash !== hash) history.pushState(null, '', hash);
}

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
    return 'Локальный сервис Tidy Reel не отвечает';
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

/** "Search" (docs/extension/pages/search.md): tabs and archive in one list, "smart search" on Enter. */
export function SearchPage() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<SearchQuery[]>([]);
  const [sources, setSources] = useState<Source[]>(EMPTY_STATE.sources);
  const [connected, setConnected] = useState(false);
  const [sort, setSort] = useState<Sort>('relevance');
  const [ran, setRan] = useState<SearchState | null>(null);
  const [results, setResults] = useState<Found[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [disabled, setDisabled] = useState<Source[]>([]);
  const connectedRef = useRef(false);
  const generation = useRef(0);

  /** Shows the search from the state; the caller changes the address. */
  async function show(state: SearchState) {
    const turn = ++generation.current;
    setError('');
    setNote('');
    setInput(state.query);
    setSources(state.sources);
    setSort(state.sort);
    let condition;
    try {
      condition = parseQuery(state.query);
    } catch (e) {
      setError(e instanceof SearchSyntaxError ? e.message : String(e));
      return;
    }
    if (!condition) {
      setRan(null);
      setResults([]);
      setDisabled([]);
      return;
    }
    const active = state.sources.filter((s) => s !== 'archive' || connectedRef.current);
    setDisabled(mentionedSources(condition).filter((s) => !active.includes(s)));
    setBusy(true);
    try {
      const outcome = await search(condition, active, state.sort);
      if (turn !== generation.current) return;
      setResults(outcome.results);
      setRan(state);
      if (outcome.archiveError) setNote(`Архив: ${outcome.archiveError}`);
      else if (outcome.archiveTotal > ARCHIVE_SHOWN_LIMIT)
        setNote(`В архиве найдено ${outcome.archiveTotal}, показаны ${ARCHIVE_SHOWN_LIMIT} лучших: уточните запрос`);
    } finally {
      if (turn === generation.current) setBusy(false);
    }
  }

  useEffect(() => {
    void listSearchHistory().then(setHistory);
    void getSettings().then((s) => {
      connectedRef.current = Boolean(s.localServiceKey);
      setConnected(connectedRef.current);
      void show(stateOfAddress());
    });
    // "Back" and "Forward": search from the address, without a new entry in the query history.
    const onPop = () => location.hash.startsWith('#search') && void show(stateOfAddress());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Running a search: Enter, a history pick, a filter or sorting make a new entry and go to the first page. */
  async function run(query: string, nextSort = sort, nextSources = sources) {
    try {
      if (!parseQuery(query)) return;
    } catch (e) {
      setError(e instanceof SearchSyntaxError ? e.message : String(e));
      return;
    }
    setHistory(await rememberSearch(query));
    const state = { query, sources: nextSources, sort: nextSort, page: 1 };
    pushAddress(state);
    await show(state);
  }

  /** Filters and sorting run the search at once only if the text has not changed since the last search. */
  function rerun(nextSort: Sort, nextSources: Source[]) {
    if (ran && input === ran.query) void run(ran.query, nextSort, nextSources);
  }

  const { visible, footer } = usePaging(results, {
    storageKey: 'tabsurd.searchPaging',
    page: ran?.page ?? 1,
    onPageChange: (page) => {
      if (!ran) return;
      const state = { ...ran, page };
      setRan(state);
      pushAddress(state);
    },
  });
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
        {SEARCH_SOURCES.map((source) => (
          <FormControlLabel
            key={source}
            label={SOURCE_TITLES[source]}
            disabled={source === 'archive' && !connected}
            control={
              <Checkbox
                size="small"
                checked={sources.includes(source) && (source !== 'archive' || connected)}
                onChange={(_, checked) => {
                  const next = checked ? [...sources, source] : sources.filter((x) => x !== source);
                  setSources(next);
                  rerun(sort, next);
                }}
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
            rerun(value, sources);
          }}
        >
          <ToggleButton value="relevance">По совпадению</ToggleButton>
          <ToggleButton value="date">По дате</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {!connected && (
        <Typography variant="body2" color="text.secondary">
          Архив ищется, когда профиль подключён к Tidy Reel (Настройки).
        </Typography>
      )}
      {disabled.length > 0 && (
        <Typography variant="body2" color="warning.main">
          {disabled.map((s) => `«${SOURCE_TITLES[s]}»`).join(', ')} выключены в фильтрах
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
