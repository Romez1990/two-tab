import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/** Замочек «Не закрывать автоматически»: закрытый и голубой — включено, открытый и серый — выключено. Один вид на странице окон и в настройках. */
export function KeepLockButton({ kept, onToggle, disabled }: { kept: boolean; onToggle: () => void; disabled?: boolean }) {
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
