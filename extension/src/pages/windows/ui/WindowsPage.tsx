import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useWindows, type BrowserWindow } from '@/entities/window';
import { reorderWindows } from '@/features/recreate-window';
import { SaveCloseButton } from '@/features/save-close';
import { browser } from '@/shared/browser';
import { updateSettings, useSettings, type Settings } from '@/shared/config';
import { groupColor, KeepLockButton } from '@/shared/ui';

/**
 * "Windows" (docs/extension/pages/windows.md, section 1): window names, order by dragging (windows are recreated
 * so that Windows shows them in this order), "Do not close", saving windows and groups.
 */
export function WindowsPage() {
  const { windows, uids, reload } = useWindows();
  const settings = useSettings();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The new order (window ids) until it is applied. Windows closed meanwhile drop out, new ones go to the end.
  const [draft, setDraft] = useState<number[] | null>(null);
  const shown = draft
    ? [
        ...draft.flatMap((id) => windows.filter((w) => w.id === id)),
        ...windows.filter((w) => !draft.includes(w.id)),
      ]
    : windows;
  const changed = draft !== null && shown.some((w, i) => w.id !== windows[i]?.id);

  function drop(to: number) {
    setDragIndex(null);
    if (dragIndex === null || dragIndex === to) return;
    const next = shown.map((w) => w.id);
    const [moved] = next.splice(dragIndex, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    setDraft(next);
  }

  async function apply() {
    setBusy(true);
    setError(null);
    try {
      await reorderWindows(windows, shown);
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      reload();
    }
  }

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary">
        Порядок — как в списке окон на панели задач Windows. Перетащите окна в нужный порядок и нажмите «Применить»:
        окна, порядок которых изменился, пересоздадутся.
      </Typography>
      {busy && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Stack spacing={1}>
        {shown.map((w, i) => (
          <Box
            key={w.id}
            draggable={!busy}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => void drop(i)}
            sx={{ opacity: dragIndex === i ? 0.5 : 1 }}
          >
            <WindowCard window={w} uid={uids.get(w.id)} settings={settings} onChanged={reload} />
          </Box>
        ))}
      </Stack>
      {changed && (
        // Panel over the page at the bottom: windows are not touched until "Apply" is pressed.
        <Paper
          elevation={6}
          sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 'snackbar', px: 2, py: 1 }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography>Порядок окон изменён</Typography>
            <Button disabled={busy} onClick={() => setDraft(null)}>
              Отменить
            </Button>
            <Button variant="contained" disabled={busy} onClick={() => void apply()}>
              Применить
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

function WindowCard({
  window,
  uid,
  settings,
  onChanged,
}: {
  window: BrowserWindow;
  uid: string | undefined;
  settings: Settings | undefined;
  onChanged: () => void;
}) {
  const first = window.tabs[0];
  const name = (uid && settings?.windowNames[uid]) || '';
  const kept = !!uid && !!settings?.keepWindowUids.includes(uid);

  async function rename(value: string) {
    if (!uid || !settings || value === name) return;
    const windowNames = { ...settings.windowNames };
    if (value.trim()) windowNames[uid] = value.trim();
    else delete windowNames[uid];
    await updateSettings({ windowNames });
  }

  async function toggleKeep() {
    if (!uid || !settings) return;
    const keepWindowUids = kept ? settings.keepWindowUids.filter((u) => u !== uid) : [...settings.keepWindowUids, uid];
    await updateSettings({ keepWindowUids });
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: window.focused ? 'primary.main' : undefined }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            key={name}
            variant="standard"
            size="small"
            fullWidth
            defaultValue={name}
            placeholder={first?.title || first?.url || 'Окно'}
            onBlur={(e) => void rename(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            slotProps={{ htmlInput: { 'aria-label': 'Имя окна' } }}
          />
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {window.tabs.length} вкладок{window.focused ? ' · текущее окно' : ''}
            {name && first ? ` · ${first.title || first.url}` : ''}
          </Typography>
        </Box>
        <Tooltip title="Перейти в окно">
          <IconButton onClick={() => void browser.windows.update(window.id, { focused: true })}>
            <OpenInBrowserIcon />
          </IconButton>
        </Tooltip>
        <KeepLockButton kept={kept} onToggle={() => void toggleKeep()} disabled={!uid} />
        <SaveCloseButton windowId={window.id} onDone={onChanged} />
      </Stack>
      {window.groups.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, ml: 4, flexWrap: 'wrap', rowGap: 1 }}>
          {window.groups.map((g) => (
            <Stack key={g.id} direction="row" sx={{ alignItems: 'center' }}>
              <Chip size="small" label={`${g.title || 'Без названия'} · ${g.size}`} sx={{ bgcolor: groupColor(g.color), color: '#fff' }} />
              <SaveCloseButton groupId={g.id} onDone={onChanged} size="small" />
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
