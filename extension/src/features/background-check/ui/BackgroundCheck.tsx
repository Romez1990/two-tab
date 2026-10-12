import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSiteAccess } from '@/shared/browser';
import { formatDateTime } from '@/shared/lib';
import { sendCheckMessage } from '../model/control';
import { useCheckState } from '../model/state';

/** Кнопки «Запустить» и «Остановить» фоновой проверки сохранённых и её ход. */
export function BackgroundCheck() {
  const state = useCheckState();
  const [access, requestAccess] = useSiteAccess();
  if (!state || access === undefined) return null;

  if (!access) {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">Для проверки расширению нужен доступ к сайтам.</Typography>
        <Button variant="outlined" onClick={requestAccess}>
          Разрешить
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {state.running ? (
          <Button variant="outlined" color="error" startIcon={<StopIcon />} onClick={() => void sendCheckMessage({ type: 'tabsurd:check-stop' })}>
            Остановить
          </Button>
        ) : (
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => void sendCheckMessage({ type: 'tabsurd:check-start' })}>
            Запустить
          </Button>
        )}
        <Typography variant="body2" color="text.secondary">
          {state.running
            ? state.total === 0
              ? 'Считаю, что проверять…'
              : `Проверено ${state.checked} из ${state.total}`
            : state.finishedAt
              ? `Последняя проверка закончилась ${formatDateTime(state.finishedAt)}`
              : state.startedAt
                ? `Остановлено: проверено ${state.checked} из ${state.total}`
                : 'Ещё не запускалась'}
        </Typography>
      </Stack>
      {state.running && (
        <LinearProgress variant={state.total === 0 ? 'indeterminate' : 'determinate'} value={state.total ? (state.checked / state.total) * 100 : 0} />
      )}
    </Stack>
  );
}
