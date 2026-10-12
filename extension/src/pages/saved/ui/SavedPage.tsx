import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
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
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteSaved,
  exportFileName,
  importSaved,
  listSaved,
  matchesQuery,
  parseExport,
  toExport,
  type SavedItem,
} from '@/entities/saved';
import { returnSaved } from '@/features/restore-windows';
import { formatDateTime } from '@/shared/lib';
import { groupColor } from '@/shared/ui';

/** «Сохранённые» (docs/extension/specification.md, раздел 2.1): сохранённые окна и группы с поиском по вкладкам. */
export function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [query, setQuery] = useState('');
  const [toRemove, setToRemove] = useState<SavedItem | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
      <div>
        {shown.map((item) => (
          <SavedAccordion
            key={item.id}
            item={item}
            onReturn={() => run(() => returnSaved(item), 'Открыто.')}
            onRemove={() => setToRemove(item)}
          />
        ))}
      </div>

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

function SavedAccordion({ item, onReturn, onRemove }: { item: SavedItem; onReturn: () => void; onRemove: () => void }) {
  const group = item.kind === 'group' ? item.window.groups[0] : undefined;
  return (
    <Accordion variant="outlined" disableGutters slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}>
          {item.kind === 'window' ? (
            <WebAssetIcon color="action" />
          ) : (
            <FolderOutlinedIcon sx={{ color: group?.color ? groupColor(group.color) : 'action.active' }} />
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
            <ListItem key={i} disableGutters>
              <ListItemText
                primary={t.title || t.url}
                secondary={t.url}
                slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
