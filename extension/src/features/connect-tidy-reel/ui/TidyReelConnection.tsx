import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSettings } from '@/shared/config';
import { checkConnection, connectTidyReel, disconnectTidyReel, type ConnectionStatus } from '../model/connection';

type Message = { severity: 'success' | 'info' | 'warning' | 'error'; text: string };

const MENU_HINT = 'Отключить его можно в его настройках или командой «Отключить профиль Tabsurd» в меню Tidy Reel.';

function sinceText(since: string): string {
  return new Date(since).toLocaleDateString('ru-RU');
}

/**
 * The "Tidy Reel" block for "First run" and settings (docs/extension/pages/settings.md, section 1).
 * `disabled`: connecting is not possible yet (on "First run" the profile name is empty).
 */
export function TidyReelConnection({ disabled = false }: { disabled?: boolean }) {
  const settings = useSettings();
  const [port, setPort] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>();
  const [message, setMessage] = useState<Message>();
  const [busy, setBusy] = useState(false);
  const key = settings?.localServiceKey;

  useEffect(() => {
    if (settings && !port) setPort(String(settings.localServicePort));
  }, [settings, port]);

  // The connection is checked when the block opens and after every connect or disconnect.
  useEffect(() => {
    if (key === undefined) return;
    let alive = true;
    // "Disconnected in Tidy Reel" stays until connected again: after it the key is empty and the check would say "no".
    void checkConnection().then((s) => alive && setStatus((prev) => (prev?.state === 'revoked' && s.state === 'none' ? prev : s)));
    return () => {
      alive = false;
    };
  }, [key]);

  if (!settings || !status) return null;
  const portNumber = Number(port);
  const portValid = Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65535;

  const connect = async () => {
    setBusy(true);
    setMessage(undefined);
    const result = await connectTidyReel(portNumber);
    setBusy(false);
    if (result.ok) return;
    if (result.reason === 'taken') {
      setMessage({ severity: 'warning', text: `В Tidy Reel уже подключён профиль «${result.name}». ${MENU_HINT}` });
    } else if (result.reason === 'unreachable') {
      setMessage({ severity: 'error', text: `tidy-reel не отвечает на порту ${portNumber}: запущен ли локальный сервис?` });
    } else {
      setMessage({ severity: 'error', text: `Не удалось подключиться: ${result.message}` });
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setMessage(undefined);
    const forgotten = await disconnectTidyReel();
    setBusy(false);
    if (!forgotten) {
      setMessage({
        severity: 'warning',
        text: 'Tidy Reel не ответил: подключение забыто только здесь. В Tidy Reel отключите профиль командой «Отключить профиль Tabsurd» в меню.',
      });
    }
  };

  const connected = status.state === 'connected' || status.state === 'unreachable';
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      {status.state === 'connected' && (
        <Typography>
          Подключён как «{status.name}» с {sinceText(status.since)}
        </Typography>
      )}
      {status.state === 'unreachable' && (
        <Alert severity="warning">
          Профиль подключён, но Tidy Reel не отвечает на порту {settings.localServicePort}: запущен ли локальный сервис?
        </Alert>
      )}
      {status.state === 'revoked' && <Alert severity="info">Отключён в Tidy Reel. Можно подключиться снова.</Alert>}
      {message && <Alert severity={message.severity}>{message.text}</Alert>}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <TextField
          label="Порт"
          value={port}
          onChange={(e) => setPort(e.target.value.replace(/\D/g, ''))}
          error={!portValid}
          disabled={connected}
          size="small"
          sx={{ width: 120 }}
        />
        {connected ? (
          <Button variant="outlined" color="warning" disabled={busy} onClick={() => void disconnect()}>
            Отключиться от Tidy Reel
          </Button>
        ) : (
          <Button variant="contained" disabled={disabled || busy || !portValid} onClick={() => void connect()}>
            Подключить
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
