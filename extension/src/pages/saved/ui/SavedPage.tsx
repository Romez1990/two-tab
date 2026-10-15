import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addSaved,
  deleteSaved,
  exportFileName,
  importSaved,
  listSaved,
  matchesQuery,
  pageKey,
  moveSavedTab,
  parseExport,
  removeSavedTab,
  toExport,
  type SavedItem,
} from '@/entities/saved';
import { openSaved } from '@/features/restore-windows';
import { useSiteIcons } from '@/features/fetch-favicons';
import { needsTitle, PageStatus, usePageChecks, type PageCheck } from '@/features/check-pages';
import { useSiteAccess } from '@/shared/browser';
import { formatDateTime, hostOf, mostCommonHostUrl } from '@/shared/lib';
import { Favicon, groupColor, usePaging } from '@/shared/ui';

/** Site icons loaded by the extension, for sites missing from the Chrome icon cache. */
const SiteIconsContext = createContext<ReadonlyMap<string, string>>(new Map());

/** Loading for an expanded record: page checks (with titles) and icons; page status badges. */
interface Loader {
  loadItem: (item: SavedItem) => () => void;
  loadIcons: (urls: readonly string[]) => () => void;
  checks: ReadonlyMap<string, PageCheck>;
  recheck: (url: string) => void;
}
const LoaderContext = createContext<Loader>({ loadItem: () => () => {}, loadIcons: () => () => {}, checks: new Map(), recheck: () => {} });

/** While a record is expanded (accordion details are mounted), its pages are checked and icons loaded. */
function ExpandedLoader({ item }: { item: SavedItem }) {
  const { loadItem, loadIcons } = useContext(LoaderContext);
  // The record re-renders when titles arrive; that does not restart the check.
  const itemRef = useRef(item);
  itemRef.current = item;
  useEffect(() => loadItem(itemRef.current), [loadItem, item.id]);
  const urls = useMemo(() => item.window.tabs.map((t) => t.url), [item]);
  useEffect(() => loadIcons(urls), [loadIcons, urls]);
  return null;
}

function SiteIcon({ url, size }: { url: string; size?: number }) {
  const icons = useContext(SiteIconsContext);
  return <Favicon url={url} size={size} src={icons.get(hostOf(url))} />;
}

/** Group icon is the icon of its most frequent site; the group color, if any, is a stripe below. */
function TabStatus({ url }: { url: string }) {
  const { checks, recheck } = useContext(LoaderContext);
  return <PageStatus check={checks.get(url)} onRecheck={() => recheck(url)} />;
}

function GroupIcon({ item, color }: { item: SavedItem; color: string | undefined }) {
  const url = mostCommonHostUrl(item.window.tabs.map((t) => t.url));
  if (!url) return <FolderOutlinedIcon sx={{ color: color ? groupColor(color) : 'action.active' }} />;
  return (
    <Box sx={{ p: 0.25, borderBottom: 3, borderColor: color ? groupColor(color) : 'transparent' }}>
      <SiteIcon url={url} size={20} />
    </Box>
  );
}

/** The list pagination mode is remembered under this key. */
const PAGING_KEY = 'tabsurd.savedPaging';

/** "Saved" (docs/extension/pages/saved.md, section 1): saved windows and groups with search by tabs. */
export function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [query, setQuery] = useState('');
  const [toRemove, setToRemove] = useState<SavedItem | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [access, requestAccess] = useSiteAccess();
  const { icons, load: loadIcons } = useSiteIcons(access);
  const fileInput = useRef<HTMLInputElement>(null);

  const opened = useOpenedItem();
  const reload = useCallback(() => void listSaved().then(setItems), []);
  useEffect(reload, [reload]);
  const shown = useMemo(() => items.filter((i) => matchesQuery(i, query)), [items, query]);
  const openedIndex = opened ? shown.findIndex((i) => i.id === opened.id) : -1;
  // There may be thousands of records: by pages or, if enabled, as the list is scrolled to the end.
  // The record opened from the "Already saved" banner must be on screen.
  const { visible, footer } = usePaging(shown, { storageKey: PAGING_KEY, resetKey: query, focusIndex: openedIndex });

  async function run(action: () => Promise<void>, done: string) {
    try {
      await action();
      setStatus({ text: done, error: false });
    } catch (e) {
      setStatus({ text: `Ошибка: ${e instanceof Error ? e.message : String(e)}`, error: true });
    }
    reload();
  }

  /** Editing record tabs: on screen at once, then in the database. `undefined` means the record was deleted with its last tab. */
  /** A loaded title goes on screen at once; the title loading feature has already written it to the database. */
  const applyTitle = useCallback((url: string, title: string) => {
    if (!title) return;
    setItems((list) =>
      list.map((i) =>
        i.window.tabs.some((t) => t.url === url)
          ? { ...i, window: { ...i.window, tabs: i.window.tabs.map((t) => (t.url === url && needsTitle(t) ? { ...t, title } : t)) } }
          : i,
      ),
    );
  }, []);

  const { checks, loadItem, recheck } = usePageChecks(access, applyTitle);
  const loader = useMemo<Loader>(() => ({ loadItem, loadIcons, checks, recheck }), [loadItem, loadIcons, checks, recheck]);

  async function edit(before: SavedItem, after: SavedItem | undefined) {
    setItems((list) => (after ? list.map((i) => (i.id === after.id ? after : i)) : list.filter((i) => i.id !== before.id)));
    try {
      if (after) await addSaved(after);
      else await deleteSaved(before.id);
    } catch (e) {
      setStatus({ text: `Ошибка: ${e instanceof Error ? e.message : String(e)}`, error: true });
      reload();
    }
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify(toExport(items), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName();
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Files are imported one by one; a broken file does not stop the others. */
  async function importFiles(files: readonly File[]) {
    let added = 0;
    let skipped = 0;
    const failed: string[] = [];
    for (const file of files) {
      try {
        const result = await importSaved(parseExport(await file.text()));
        added += result.added;
        skipped += result.skipped;
      } catch (e) {
        failed.push(`${file.name} (${e instanceof Error ? e.message : String(e)})`);
      }
    }
    const done = `Добавлено: ${added}, уже были: ${skipped}.`;
    if (failed.length === 0) setStatus({ text: done, error: false });
    else if (failed.length === files.length) setStatus({ text: `Не импортировано: ${failed.join('; ')}`, error: true });
    else setStatus({ text: `${done} Не импортировано: ${failed.join('; ')}`, error: true });
    reload();
  }

  return (
    // mb: -3 pulls the container bottom padding (py: 3) into the page so the panel sticks to the very bottom of the screen.
    // clip, not hidden: hidden would break the sticky panel.
    <Stack spacing={2} sx={{ overflowX: 'clip', mb: -3 }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button startIcon={<FileUploadOutlinedIcon />} onClick={() => fileInput.current?.click()}>
          Импорт
        </Button>
        <Button startIcon={<FileDownloadOutlinedIcon />} onClick={exportAll} disabled={items.length === 0}>
          Экспорт
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = '';
            if (files.length > 0) void importFiles(files);
          }}
        />
      </Stack>
      {access === false && items.length > 0 && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={requestAccess}>
              Разрешить
            </Button>
          }
        >
          Чтобы загружать с сайтов заголовки и значки вкладок, расширению нужен доступ к сайтам.
        </Alert>
      )}
      <TextField
        placeholder="Поиск по названию, заголовкам и адресам вкладок"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
      />
      {items.length === 0 && (
        <Alert severity="info">
          Сохранённых пока нет. Окно или группу можно сохранить и закрыть во всплывающем окне расширения или на странице «Окна».
        </Alert>
      )}
      {items.length > 0 && shown.length === 0 && <Typography color="text.secondary">Ничего не найдено.</Typography>}
      <LoaderContext.Provider value={loader}>
        <SiteIconsContext.Provider value={icons}>
          <div>
            {visible.map((item) => (
              <SavedAccordion
                key={item.id}
                item={item}
                opened={item.id === opened?.id}
                highlightUrl={item.id === opened?.id ? opened.tabUrl : undefined}
                onOpen={() => run(() => openSaved(item), 'Открыто.')}
                onRemove={() => setToRemove(item)}
                onEdit={(next) => void edit(item, next)}
              />
            ))}
          </div>
          {footer}
        </SiteIconsContext.Provider>
      </LoaderContext.Provider>

      <Dialog open={toRemove !== null} onClose={() => setToRemove(null)}>
        <DialogTitle>Удалить из сохранённых?</DialogTitle>
        <DialogContent>
          «{toRemove?.title}» и {toRemove?.window.tabs.length} вкладок пропадут из списка. Они останутся только в старых снимках
          окон.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToRemove(null)}>Отмена</Button>
          <Button
            color="error"
            onClick={() => {
              const item = toRemove;
              setToRemove(null);
              if (item) void run(() => deleteSaved(item.id), 'Удалено.');
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={status !== null} autoHideDuration={4000} onClose={() => setStatus(null)}>
        <Alert severity={status?.error ? 'error' : 'success'} variant="filled" onClose={() => setStatus(null)}>
          {status?.text}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

/**
 * Record to expand and tab to highlight: `#saved/<id>/<tab address>`, the transition
 * from the "Already saved" banner.
 */
function useOpenedItem(): { id: string; tabUrl?: string } | undefined {
  const read = () => {
    const [section, id, tabUrl] = location.hash.slice(1).split('/');
    if (section !== 'saved' || !id) return undefined;
    return { id: decodeURIComponent(id), tabUrl: tabUrl ? decodeURIComponent(tabUrl) : undefined };
  };
  const [id, setId] = useState(read);
  useEffect(() => {
    const onHash = () => setId(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return id;
}

function SavedAccordion({
  item,
  opened,
  highlightUrl,
  onOpen,
  onRemove,
  onEdit,
}: {
  item: SavedItem;
  opened: boolean;
  highlightUrl?: string;
  onOpen: () => void;
  onRemove: () => void;
  onEdit: (next: SavedItem | undefined) => void;
}) {
  const group = item.kind === 'group' ? item.window.groups[0] : undefined;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(opened);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!opened) return;
    setExpanded(true);
    if (!highlightUrl) ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [opened, highlightUrl]);
  const highlightKey = highlightUrl ? pageKey(highlightUrl) : undefined;
  return (
    <Accordion
      ref={ref}
      variant="outlined"
      disableGutters
      expanded={expanded}
      onChange={(_, open) => setExpanded(open)}
      sx={opened ? { borderColor: 'primary.main' } : undefined}
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      {/* minWidth: 0 on the content, otherwise a long title stretches the row and shifts the icons. */}
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { minWidth: 0 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}>
          {/* Can be opened without expanding the record: the click does not reach the accordion header. */}
          <Tooltip title="Открыть">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              onFocus={(e) => e.stopPropagation()}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {item.kind === 'window' ? (
            <WebAssetIcon color="action" />
          ) : (
            <GroupIcon item={item} color={group?.color} />
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* Without a name the first tab is shown in italics. */}
            <Typography noWrap sx={{ fontWeight: 500, fontStyle: item.title ? undefined : 'italic' }}>
              {item.title || item.window.tabs[0]?.title || item.window.tabs[0]?.url}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.kind === 'window' ? 'Окно' : 'Группа'} · {item.window.tabs.length} вкладок · {formatDateTime(item.savedAt)}
            </Typography>
          </Box>
          {item.reason === 'auto' && <Chip size="small" label="автозакрытие" variant="outlined" />}
          {/* A record can be deleted without expanding it: the button is next to the arrow, the click does not expand the accordion. */}
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              onFocus={(e) => e.stopPropagation()}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ py: 0.5 }}>
        <ExpandedLoader item={item} />
        <List dense disablePadding>
          {item.window.tabs.map((t, i) => {
            const highlighted = highlightKey !== undefined && pageKey(t.url) === highlightKey;
            return (
              <ListItem
                key={`${i}-${t.url}`}
                // The tab arrived at from the banner is highlighted and scrolled to the middle of the screen.
                ref={highlighted ? (el: HTMLLIElement | null) => el?.scrollIntoView({ block: 'center', behavior: 'smooth' }) : undefined}
                disableGutters
                draggable
                onDragStart={(e) => {
                  setDragIndex(i);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== i) onEdit(moveSavedTab(item, dragIndex, i));
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                secondaryAction={
                  <Tooltip title="Удалить вкладку">
                    <IconButton edge="end" size="small" sx={{ p: 0.25 }} onClick={() => onEdit(removeSavedTab(item, i))}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  opacity: dragIndex === i ? 0.4 : 1,
                  borderTop: 2,
                  borderColor: overIndex === i && dragIndex !== null && dragIndex > i ? 'primary.main' : 'transparent',
                  borderBottom: 2,
                  borderBottomColor: overIndex === i && dragIndex !== null && dragIndex < i ? 'primary.main' : 'transparent',
                  py: 0,
                  pr: 5,
                }}
              >
                {/* The whole row is a link: a click opens it in a new tab, the middle button in a background one. */}
                <ListItemButton component="a" href={t.url} target="_blank" rel="noreferrer" draggable={false} dense selected={highlighted} sx={{ borderRadius: 1, py: 0 }}>
                  <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled', cursor: 'grab', mr: 1 }} />
                  <Box sx={{ mr: 1.5 }}>
                    <SiteIcon url={t.url} />
                  </Box>
                  <TabStatus url={t.url} />
                  <ListItemText
                    primary={t.title || t.url}
                    secondary={t.url}
                    sx={{ my: 0 }}
                    slotProps={{ primary: { noWrap: true, color: 'primary' }, secondary: { noWrap: true } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
