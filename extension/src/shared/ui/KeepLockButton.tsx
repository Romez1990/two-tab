import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/** The "Do not close automatically" lock: closed and blue is on, open and grey is off. The same look on the windows page and in settings. */
export function KeepLockButton({
  kept,
  onToggle,
  disabled,
}: {
  kept: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip title={kept ? 'Не закрывать автоматически — включено' : 'Не закрывать это окно автоматически'}>
      <span>
        <IconButton onClick={onToggle} color={kept ? 'primary' : 'default'} disabled={disabled} aria-pressed={kept}>
          {kept ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
