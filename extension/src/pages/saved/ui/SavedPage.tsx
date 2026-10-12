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
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
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
import { needsTitle, TitleFetcher } from '@/features/fetch-titles';
import { useSiteAccess } from '@/shared/browser';
import { formatDateTime, hostOf, mostCommonHostUrl } from '@/shared/lib';
import { Favicon, groupColor } from '@/shared/ui';

/** Значок группы — значок самого частого в ней сайта; цвет группы, если он есть, — полоской снизу. */
/** Значки сайтов, загруженные расширением, — для сайтов, которых нет в кеше значков Chrome. */
const SiteIconsContext = createContext<ReadonlyMap<string, string>>(new Map());

function SiteIcon({ url, size }: { url: string; size?: number }) {
  const icons = useContext(SiteIconsContext);
  return <Favicon url={url} size={size} src={icons.get(hostOf(url))} />;
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

/** Записей на странице и сколько добавляется за раз при прокрутке. */
const PAGE_SIZE = 50;

/** По страницам или по мере прокрутки; выбор запоминается в этом браузере. */
type Paging = 'pages' | 'scroll';
const PAGING_KEY = 'tabsurd.savedPaging';

/** Многоточие в переключателе страниц: нажатие превращает его в поле, номер страницы и Enter — переход. */
function PageJump({ pages, onJump }: { pages: number; onJump: (page: number) => void }) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <Tooltip title="Перейти к странице">
        <Button size="small" onClick={() => setEditing(true)} sx={{ minWidth: 26, height: 26, px: 0.5, color: 'text.primary' }}>
          …
        </Button>
      </Tooltip>
    );
  }
  return (
    <TextField
      autoFocus
      size="small"
      placeholder={`1–${pages}`}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false);
        if (e.key !== 'Enter') return;
        const page = Number((e.target as HTMLInputElement).value);
        if (Number.isInteger(page) && page >= 1 && page <= pages) onJump(page);
        setEditing(false);
      }}
      slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Номер страницы', style: { textAlign: 'center' } } }}
      sx={{ width: 64, mx: 0.5, '& input': { py: 0.25 } }}
    />
  );
}

function readPaging(): Paging {
  try {
    return localStorage.getItem(PAGING_KEY) === 'scroll' ? 'scroll' : 'pages';
  } catch {
    return 'pages';
  }
}

/** «Сохранённые» (docs/extension/specification.md, раздел 2.1): сохранённые окна и группы с поиском по вкладкам. */
export function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [query, setQuery] = useState('');
  const [toRemove, setToRemove] = useState<SavedItem | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [access, requestAccess] = useSiteAccess();
  const [titlesPending, setTitlesPending] = useState(0);
  const allUrls = useMemo(() => items.flatMap((i) => i.window.tabs.map((t) => t.url)), [items]);
  const { icons, missing: iconsMissing } = useSiteIcons(allUrls, access);
  const fileInput = useRef<HTMLInputElement>(null);

  const opened = useOpenedItem();
  const reload = useCallback(() => void listSaved().then(setItems), []);
  useEffect(reload, [reload]);
  const shown = useMemo(() => items.filter((i) => matchesQuery(i, query)), [items, query]);
  // Записей может быть тысячи: по страницам или, если включено, по мере прокрутки к концу списка.
  const [paging, setPaging] = useState<Paging>(readPaging);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setLimit(PAGE_SIZE);
    setPage(1);
  }, [query]);
  const openedIndex = opened ? shown.findIndex((i) => i.id === opened.id) : -1;
  // Запись из плашки «Уже сохранено» должна быть на экране.
  useEffect(() => {
    if (openedIndex >= 0) setPage(Math.floor(openedIndex / PAGE_SIZE) + 1);
  }, [openedIndex]);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const visible =
    paging === 'pages'
      ? shown.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE)
      : shown.slice(0, Math.max(limit, openedIndex + 1));
  const changePaging = (next: Paging) => {
    setPaging(next);
    try {
      localStorage.setItem(PAGING_KEY, next);
    } catch {
      // Без хранилища выбор действует до закрытия страницы.
    }
  };
  const more = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = more.current;
    if (paging !== 'scroll' || !el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setLimit((n) => n + PAGE_SIZE),
      { rootMargin: '800px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [paging, visible.length, shown.length]);

  async function run(action: () => Promise<void>, done: string) {
    try {
      await action();
      setStatus({ text: done, error: false });
    } catch (e) {
      setStatus({ text: `Ошибка: ${e instanceof Error ? e.message : String(e)}`, error: true });
    }
    reload();
  }

  /** Правка вкладок записи: сразу на экране, потом в базе. `undefined` — запись удалена вместе с последней вкладкой. */
  /** Загруженный заголовок — сразу на экране; в базу его уже записала фича загрузки заголовков. */
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

  /** Файлы импортируются по очереди; испорченный файл не мешает остальным. */
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
    // mb: -3 забирает нижний отступ контейнера (py: 3) внутрь страницы, чтобы панель прилипала к самому низу экрана.
    // clip, а не hidden: hidden сломал бы прилипание панели.
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
      {access === false && (titlesPending > 0 || iconsMissing > 0) && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={requestAccess}>
              Разрешить
            </Button>
          }
        >
          {[titlesPending > 0 && `у ${titlesPending} вкладок нет заголовка`, iconsMissing > 0 && `у ${iconsMissing} сайтов нет значка`]
            .filter(Boolean)
            .join(', ')
            .replace(/^./, (c) => c.toUpperCase())}
          . Чтобы загрузить их с сайтов, расширению нужен доступ к сайтам.
        </Alert>
      )}
      <TitleFetcher items={items} access={access} onTitle={applyTitle} onPending={setTitlesPending} />
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
        {/* Невидимая отметка конца списка: когда она близко к экрану, подгружается следующая порция. */}
        {paging === 'scroll' && visible.length < shown.length && <Box ref={more} sx={{ height: 1 }} />}
        {shown.length > PAGE_SIZE && (
          // Тонкая панель всегда прилипает к низу окна: страницы и режим переключаются без прокрутки к концу списка.
          <Stack
            direction="row"
            spacing={2}
            sx={{
              py: 0.5,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              rowGap: 0.5,
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {paging === 'pages' ? (
              <Pagination
                count={pages}
                page={Math.min(page, pages)}
                onChange={(_, p) => {
                  setPage(p);
                  window.scrollTo({ top: 0 });
                }}
                color="primary"
                size="small"
                renderItem={(it) =>
                  it.type === 'start-ellipsis' || it.type === 'end-ellipsis' ? (
                    <PageJump
                      pages={pages}
                      onJump={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0 });
                      }}
                    />
                  ) : (
                    <PaginationItem {...it} />
                  )
                }
              />
            ) : (
              <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                Показано {visible.length} из {shown.length}
              </Box>
            )}
            <Button size="small" variant="outlined" onClick={() => changePaging(paging === 'pages' ? 'scroll' : 'pages')}>
              {paging === 'pages' ? 'Листать прокруткой' : 'По страницам'}
            </Button>
          </Stack>
        )}
      </SiteIconsContext.Provider>

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
 * Запись, которую нужно раскрыть, и вкладка, которую нужно подсветить: `#saved/<id>/<адрес вкладки>` —
 * переход из плашки «Уже сохранено».
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
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}>
          {/* Открыть можно, не разворачивая запись: нажатие не доходит до заголовка аккордеона. */}
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
            {/* Без названия — показывается первая вкладка курсивом. */}
            <Typography noWrap sx={{ fontWeight: 500, fontStyle: item.title ? undefined : 'italic' }}>
              {item.title || item.window.tabs[0]?.title || item.window.tabs[0]?.url}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.kind === 'window' ? 'Окно' : 'Группа'} · {item.window.tabs.length} вкладок · {formatDateTime(item.savedAt)}
            </Typography>
          </Box>
          {item.reason === 'auto' && <Chip size="small" label="автозакрытие" variant="outlined" />}
          {/* Удалить запись можно, не разворачивая её: кнопка рядом со стрелкой, нажатие не раскрывает аккордеон. */}
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
      <AccordionDetails>
        <List dense disablePadding>
          {item.window.tabs.map((t, i) => {
            const highlighted = highlightKey !== undefined && pageKey(t.url) === highlightKey;
            return (
              <ListItem
                key={`${i}-${t.url}`}
                // Вкладка, с которой пришли из плашки, — подсвечена и прокручена к середине экрана.
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
                    <IconButton edge="end" size="small" onClick={() => onEdit(removeSavedTab(item, i))}>
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
                  pr: 5,
                }}
              >
                {/* Вся строка — ссылка: нажатие открывает в новой вкладке, колёсико — в фоновой. */}
                <ListItemButton component="a" href={t.url} target="_blank" rel="noreferrer" draggable={false} dense selected={highlighted} sx={{ borderRadius: 1 }}>
                  <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled', cursor: 'grab', mr: 1 }} />
                  <Box sx={{ mr: 1.5 }}>
                    <SiteIcon url={t.url} />
                  </Box>
                  <ListItemText
                    primary={t.title || t.url}
                    secondary={t.url}
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
