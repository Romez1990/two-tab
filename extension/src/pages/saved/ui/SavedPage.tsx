import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
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
  moveSavedTab,
  parseExport,
  removeSavedTab,
  toExport,
  type SavedItem,
} from '@/entities/saved';
import { returnSaved } from '@/features/restore-windows';
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

  const openId = useOpenedItemId();
  const reload = useCallback(() => void listSaved().then(setItems), []);
  useEffect(reload, [reload]);
  const shown = useMemo(() => items.filter((i) => matchesQuery(i, query)), [items, query]);

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

  async function importFile(file: File) {
    let text = '';
    try {
      text = await file.text();
      const { added, skipped } = await importSaved(parseExport(text));
      setStatus({ text: `Добавлено: ${added}, уже были: ${skipped}.`, error: false });
    } catch (e) {
      setStatus({ text: `Не импортировано: ${e instanceof Error ? e.message : String(e)}`, error: true });
    }
    reload();
  }

  return (
    <Stack spacing={2}>
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
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void importFile(file);
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
          {shown.map((item) => (
            <SavedAccordion
              key={item.id}
              item={item}
              opened={item.id === openId}
              onReturn={() => run(() => returnSaved(item), 'Открыто.')}
              onRemove={() => setToRemove(item)}
              onEdit={(next) => void edit(item, next)}
            />
          ))}
        </div>
      </SiteIconsContext.Provider>

      <Dialog open={toRemove !== null} onClose={() => setToRemove(null)}>
        <DialogTitle>Убрать из сохранённых?</DialogTitle>
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
              if (item) void run(() => deleteSaved(item.id), 'Убрано.');
            }}
          >
            Убрать
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

/** Запись, которую нужно раскрыть: `#saved/<id>` — переход из плашки «Уже сохранено». */
function useOpenedItemId(): string | undefined {
  const read = () => {
    const [section, id] = location.hash.slice(1).split('/');
    return section === 'saved' && id ? decodeURIComponent(id) : undefined;
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
  onReturn,
  onRemove,
  onEdit,
}: {
  item: SavedItem;
  opened: boolean;
  onReturn: () => void;
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
    ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [opened]);
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
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button variant="contained" size="small" startIcon={<UnarchiveOutlinedIcon />} onClick={onReturn}>
            Вернуть
          </Button>
          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onRemove}>
            Убрать из сохранённых
          </Button>
        </Stack>
        <List dense disablePadding>
          {item.window.tabs.map((t, i) => (
            <ListItem
              key={`${i}-${t.url}`}
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
                <Tooltip title="Убрать вкладку">
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
              <ListItemButton component="a" href={t.url} target="_blank" rel="noreferrer" draggable={false} dense sx={{ borderRadius: 1 }}>
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
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
