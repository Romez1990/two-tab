import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { muteAttention, useAttention } from '@/entities/queue';

/** Extension page section by the queue of the case. */
export const QUEUE_SECTIONS: Record<string, string> = { download: 'downloads', recompress: 'recompress' };

/**
 * The "Needs your decision" banner (docs/extension/queues.md, section 4): cases the queue waits on
 * the user for, a link to the queue and "Mute". The sound is a Windows notification from the local service.
 * The cases are kept by the background script (docs/extension/queues.md, section 6).
 */
export function AttentionBanner({ onOpen, dense = false }: { onOpen: (section: string) => void; dense?: boolean }) {
  // The cases come over the WebSocket into session storage; "Mute" changes them there too.
  const cases = useAttention()?.cases ?? [];
  if (!cases.length) return null;
  const loud = cases.some((c) => !c.muted);

  return (
    <Alert
      severity="warning"
      sx={dense ? { py: 0 } : undefined}
      action={
        loud && (
          <Button color="inherit" size="small" onClick={() => void muteAttention()}>
            Заглушить
          </Button>
        )
      }
    >
      <strong>Нужно ваше решение</strong>
      <Stack spacing={0.25}>
        {cases.map((c) => (
          <span key={`${c.queue}:${c.reason}:${c.since}`}>
            {c.text}{' '}
            <Button
              size="small"
              sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}
              onClick={() => onOpen(QUEUE_SECTIONS[c.queue] ?? 'downloads')}
            >
              Открыть очередь
            </Button>
          </span>
        ))}
      </Stack>
    </Alert>
  );
}
