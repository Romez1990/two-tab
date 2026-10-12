import AutorenewIcon from '@mui/icons-material/Autorenew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import type { BrowserWindow } from '@/entities/window';
import { recreateWindow } from '../model/recreate-window';

export function RecreateWindowButton({ window, onDone }: { window: BrowserWindow; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      await recreateWindow(window);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tooltip title={error ?? 'Пересоздать: окно станет последним на панели задач'}>
      <span>
        <IconButton edge="end" disabled={busy} onClick={handleClick} color={error ? 'error' : 'default'}>
          {busy ? <CircularProgress size={20} /> : error ? <ErrorOutlineIcon /> : <AutorenewIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
