import ErrorOutline from '@mui/icons-material/ErrorOutlineOutlined';
import PriorityHigh from '@mui/icons-material/PriorityHigh';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { LocalServiceSchemas } from '@/shared/api';

export type QueueMessage = LocalServiceSchemas['QueueMessageModel'];

/** Значок вида (tidy-reel/docs/recompress.md, раздел 6.5): жёлтый — решение, голубой — сведения, красный — ошибка. */
function KindIcon({ kind }: { kind: string }) {
  if (kind === 'error') return <ErrorOutline fontSize="small" color="error" />;
  return <PriorityHigh fontSize="small" color={kind === 'decision' ? 'warning' : 'info'} />;
}

/**
 * Сообщение у видео: текст, кнопки своего случая (`children`) и «Прочитано» у сведений и ошибок,
 * только у каждого сообщения отдельно. Прочитанное и решённое остаётся в истории бледным.
 */
export function MessageLine({ message, onRead, children }: { message: QueueMessage; onRead: () => void; children?: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', opacity: message.done ? 0.55 : 1, pl: 4 }}>
      <KindIcon kind={message.kind} />
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap title={message.text}>
        {message.text}
      </Typography>
      {!message.done && children}
      {!message.done && message.kind !== 'decision' && (
        <Button size="small" onClick={onRead}>
          Прочитано
        </Button>
      )}
    </Stack>
  );
}
