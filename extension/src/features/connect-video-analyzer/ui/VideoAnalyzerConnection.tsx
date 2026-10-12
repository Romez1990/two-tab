import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSettings } from '@/shared/config';
import { checkConnection, connectVideoAnalyzer, disconnectVideoAnalyzer, type ConnectionStatus } from '../model/connection';

type Message = { severity: 'success' | 'info' | 'warning' | 'error'; text: string };

const MENU_HINT = 'Отключить его можно в его настройках или командой «Отключить профиль Tabsurd» в меню video-analyzer.';

function sinceText(since: string): string {
  return new Date(since).toLocaleDateString('ru-RU');
}

/** Блок «video-analyzer» для «Первого запуска» и настроек (docs/extension/specification.md, раздел 1.2). */
export function VideoAnalyzerConnection() {
  const settings = useSettings();
  const [port, setPort] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>();
  const [message, setMessage] = useState<Message>();
  const [busy, setBusy] = useState(false);
  const key = settings?.localServiceKey;

  useEffect(() => {
    if (settings && !port) setPort(String(settings.localServicePort));
  }, [settings, port]);

  // Связь проверяется при открытии блока и после каждого подключения или отключения.
  useEffect(() => {
    if (key === undefined) return;
    let alive = true;
    // «Отключён в video-analyzer» остаётся, пока не подключились снова: после него ключ пуст, и проверка вернёт «нет».
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
    const result = await connectVideoAnalyzer(portNumber);
    setBusy(false);
    if (result.ok) return;
    if (result.reason === 'taken') {
      setMessage({ severity: 'warning', text: `В video-analyzer уже подключён профиль «${result.name}». ${MENU_HINT}` });
    } else if (result.reason === 'unreachable') {
      setMessage({ severity: 'error', text: `video-analyzer не отвечает на порту ${portNumber}: запущен ли локальный сервис?` });
    } else {
      setMessage({ severity: 'error', text: `Не удалось подключиться: ${result.message}` });
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setMessage(undefined);
    const forgotten = await disconnectVideoAnalyzer();
    setBusy(false);
    if (!forgotten) {
      setMessage({
        severity: 'warning',
        text: 'video-analyzer не ответил: подключение забыто только здесь. В video-analyzer отключите профиль командой «Отключить профиль Tabsurd» в меню.',
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
          Профиль подключён, но video-analyzer не отвечает на порту {settings.localServicePort}: запущен ли локальный сервис?
        </Alert>
      )}
      {status.state === 'revoked' && <Alert severity="info">Отключён в video-analyzer. Можно подключиться снова.</Alert>}
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
            Отключиться от video-analyzer
          </Button>
        ) : (
          <Button variant="contained" disabled={busy || !portValid} onClick={() => void connect()}>
            Подключить
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
