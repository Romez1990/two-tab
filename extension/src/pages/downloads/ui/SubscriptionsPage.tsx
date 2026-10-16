import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { checkSubscriptionsNow, unsubscribe, updateSubscription } from '@/entities/download';
import { useServiceTopic } from '@/shared/api';
import { errorText, formatDateTime } from '@/shared/lib';
import { describeFilters } from '../model/filters';

/** "Subscriptions" (docs/extension/pages/downloads.md, section 2): filters, pause, "Check now". */
export function SubscriptionsPage() {
  // The list comes over the WebSocket: after an action the service sends a new snapshot itself.
  const { snapshot: subscriptions, online } = useServiceTopic('subscriptions', true);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const run = (action: () => Promise<unknown>, done?: string) =>
    void action()
      .then(() => {
        if (done) setMessage({ text: done, error: false });
      })
      .catch((e: unknown) => setMessage({ text: errorText(e), error: true }));

  return (
    <Stack spacing={1}>
      {message && (
        <Alert severity={message.error ? 'error' : 'success'} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Каналы проверяются раз в 3 дня, пока работает Tidy Reel. Подписаться — на странице канала.
        </Typography>
        <Button onClick={() => run(() => checkSubscriptionsNow(), 'Подписки будут проверены в ближайшие секунды')}>
          Проверить все сейчас
        </Button>
      </Stack>
      {!online && <Alert severity="warning">Локальный сервис Tidy Reel не отвечает</Alert>}
      {subscriptions?.length === 0 && <Typography color="text.secondary">Подписок нет.</Typography>}
      {subscriptions?.map((s) => (
        <Paper key={s.id} variant="outlined" sx={{ px: 1.5, py: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap>
                {s.title}
                {s.paused ? ' — на паузе' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap title={s.folder}>
                {s.folder}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {describeFilters(s.filters)}
                {s.checked_at
                  ? ` · проверена ${formatDateTime(Date.parse(s.checked_at))}, новых: ${s.last_found ?? 0}`
                  : ' · проверка скоро'}
              </Typography>
            </Stack>
            <Button
              size="small"
              onClick={() => run(() => checkSubscriptionsNow(s.id), `«${s.title}» будет проверена в ближайшие секунды`)}
            >
              Проверить сейчас
            </Button>
            <Button size="small" onClick={() => run(() => updateSubscription(s.id, { paused: !s.paused }))}>
              {s.paused ? 'Продолжить' : 'Пауза'}
            </Button>
            <Button
              size="small"
              color="warning"
              onClick={() => run(() => unsubscribe(s.id), `Отписка от «${s.title}»`)}
            >
              Отписаться
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
