import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { saveAndCloseGroup, saveAndCloseWindow } from '../model/save-close';

/** "Save and close" button for a window (`windowId`) or a group (`groupId`). */
export function SaveCloseButton({
  windowId,
  groupId,
  onDone,
  size = 'medium',
}: {
  windowId?: number;
  groupId?: number;
  onDone?: () => void;
  size?: 'small' | 'medium';
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const what = groupId !== undefined ? 'группу' : 'окно';

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      if (groupId !== undefined) await saveAndCloseGroup(groupId);
      else if (windowId !== undefined) await saveAndCloseWindow(windowId);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tooltip title={error ?? `Сохранить и закрыть ${what}`}>
      <span>
        <IconButton size={size} disabled={busy} onClick={handleClick} color={error ? 'error' : 'default'}>
          {busy ? <CircularProgress size={18} /> : <ArchiveOutlinedIcon fontSize={size === 'small' ? 'small' : 'medium'} />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
