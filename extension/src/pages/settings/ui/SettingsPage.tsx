import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { getQueueSettings, saveQueueSettings, type QueueSettings } from '@/entities/queue';
import { useWindows } from '@/entities/window';
import { BackgroundCheck } from '@/features/background-check';
import { RecompressPresets } from '@/features/recompress-presets';
import { TidyReelConnection } from '@/features/connect-tidy-reel';
import { captureWindows } from '@/features/track-windows';
import { updateSettings, useSettings, type Settings } from '@/shared/config';
import { formatBytes, getDbUsageBytes } from '@/shared/db';
import { KeepLockButton } from '@/shared/ui';

/** Настройки (docs/extension/specification.md, раздел 1.2): автозакрытие, «Не закрывать», профиль, Tidy Reel, сервер синхронизации. */
export function SettingsPage() {
  const settings = useSettings();
  if (!settings) return null;

  return (
    <Stack spacing={2} sx={{ maxWidth: 760 }}>
      <Section title="Автозакрытие" hint="Окно или группа закрываются, если на их вкладки не переходили столько дней работы Chrome. Перед закрытием они сохраняются в «Сохранённые». 0 — не закрывать.">
        <TextField
          key={settings.autoCloseDays}
          type="number"
          label="Дней работы Chrome"
          defaultValue={settings.autoCloseDays}
          onBlur={(e) => {
            const days = Math.max(0, Math.round(Number(e.target.value) || 0));
            void updateSettings({ autoCloseDays: days });
          }}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ width: 220 }}
        />
      </Section>

      <Section title="Не закрывать" hint="Отмеченные окна не закрываются автоматически. Закреплённые вкладки не закрываются никогда.">
        <KeepWindows settings={settings} />
      </Section>

      <Section
        title="Проверка сохранённых"
        hint="Проверяет все сохранённые вкладки: открываются ли страницы, заголовки, значки. Идёт в фоне, пока не закончится или её не остановят, и продолжается после перезапуска Chrome. Проверенное меньше 30 дней назад пропускается."
      >
        <BackgroundCheck />
      </Section>

      <Section title="Профиль" hint="Название профиля Chrome на этом компьютере. Хранится только здесь.">
        <TextField
          key={settings.profileName}
          label="Название профиля"
          placeholder="Основной"
          defaultValue={settings.profileName}
          onBlur={(e) => void updateSettings({ profileName: e.target.value.trim() })}
          error={!settings.profileName}
          helperText={settings.profileName ? undefined : 'Заполните название: его видно в Tidy Reel'}
          sx={{ width: 320 }}
        />
      </Section>

      <Section
        title="Tidy Reel"
        hint="Локальный сервис Tidy Reel на этом компьютере: время просмотра, оценки, скачивание. Подключён может быть только один профиль Chrome."
      >
        <TidyReelConnection />
      </Section>

      {settings.localServiceKey && (
        <Section title="Сжатие видео" hint="Пресеты сжатия в AV1 после скачивания. «По умолчанию» действует на все сайты, пресет сайта задаёт только то, что отличается.">
          <RecompressPresets />
        </Section>
      )}

      {settings.localServiceKey && (
        <Section title="Очереди" hint="Скачивание и сжатие в Tidy Reel. Настройки хранятся в локальном сервисе.">
          <QueueSettingsForm />
        </Section>
      )}

      <Section title="Хранилище" hint="Сколько места на этом компьютере занимает база расширения: сохранённые окна, снимки, недавно закрытые вкладки.">
        <DbUsage />
      </Section>

      <Section title="Сервер синхронизации" hint="Синхронизация появится на этапе 6.">
        <TextField
          key={settings.syncServerUrl}
          label="Адрес сервера"
          placeholder="https://…"
          defaultValue={settings.syncServerUrl}
          onBlur={(e) => void updateSettings({ syncServerUrl: e.target.value.trim() })}
          fullWidth
        />
      </Section>
    </Stack>
  );
}

/** «Повтор уведомлений, минут» и «Строгий порядок» (docs/extension/pages/settings.md, раздел 5). */
function QueueSettingsForm() {
  const [value, setValue] = useState<QueueSettings | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void getQueueSettings()
      .then(setValue)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);
  const save = (next: QueueSettings) =>
    void saveQueueSettings(next)
      .then(setValue)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  if (!value) return <Typography color={error ? 'error' : 'text.secondary'}>{error || '…'}</Typography>;
  return (
    <Stack spacing={1}>
      <TextField
        key={value.notify_every_minutes}
        type="number"
        label="Повтор уведомлений, минут"
        helperText="Как часто звучит уведомление, пока очереди нужно ваше решение"
        defaultValue={value.notify_every_minutes}
        onBlur={(e) => save({ ...value, notify_every_minutes: Math.min(1440, Math.max(1, Math.round(Number(e.target.value) || 1))) })}
        slotProps={{ htmlInput: { min: 1, max: 1440 } }}
        sx={{ width: 320 }}
      />
      <FormControlLabel
        control={<Checkbox checked={value.strict_order} onChange={(_, on) => save({ ...value, strict_order: on })} />}
        label="Строгий порядок: ошибка или нужные куки у видео ставят на паузу всю очередь"
      />
      {error && <Typography color="error">{error}</Typography>}
    </Stack>
  );
}

function DbUsage() {
  const [bytes, setBytes] = useState<number | undefined>();
  useEffect(() => {
    void getDbUsageBytes().then(setBytes);
  }, []);
  return <Typography>{bytes === undefined ? '…' : `≈ ${formatBytes(bytes)}`}</Typography>;
}

/**
 * Окна, которые не закрываются: открытые сейчас — с галочками, отмеченные запоминаются по постоянному номеру
 * окна (docs/extension/specification.md, раздел 3.1). Отмеченные, но закрытые сейчас окна тоже в списке.
 */
function KeepWindows({ settings }: { settings: Settings }) {
  const { windows, uids, reload } = useWindows();
  // Номер окну выдаёт фоновый скрипт с задержкой, поэтому при открытии настроек не у всех окон он уже есть: выдаём недостающие сразу.
  useEffect(() => {
    void captureWindows().then(reload);
  }, [reload]);
  const keep = new Set(settings.keepWindowUids);
  const toggle = (uid: string, on: boolean) =>
    void updateSettings({ keepWindowUids: on ? [...settings.keepWindowUids, uid] : settings.keepWindowUids.filter((u) => u !== uid) });
  const open = windows.flatMap((w) => {
    const uid = uids.get(w.id);
    return uid ? [{ uid, window: w }] : [];
  });
  const openUids = new Set(open.map((o) => o.uid));
  const closed = settings.keepWindowUids.filter((u) => !openUids.has(u));

  return (
    <Stack sx={{ mb: 2 }}>
      {open.map(({ uid, window: w }) => {
        const first = w.tabs[0];
        return (
          <KeepRow key={uid} kept={keep.has(uid)} onToggle={() => toggle(uid, !keep.has(uid))}>
            {settings.windowNames[uid] || first?.title || first?.url || 'Окно'}
            <Typography component="span" variant="body2" color="text.secondary">
              {' '}· {w.tabs.length} вкладок{w.focused ? ' · текущее окно' : ''}
            </Typography>
          </KeepRow>
        );
      })}
      {closed.map((uid) => (
        <KeepRow key={uid} kept onToggle={() => toggle(uid, false)}>
          {settings.windowNames[uid] || `Окно ${uid.slice(0, 6)}`}
          <Typography component="span" variant="body2" color="text.secondary">
            {' '}· сейчас закрыто
          </Typography>
        </KeepRow>
      ))}
    </Stack>
  );
}

function KeepRow({ kept, onToggle, children }: { kept: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', minWidth: 0 }}>
      <KeepLockButton kept={kept} onToggle={onToggle} />
      <Typography noWrap sx={{ minWidth: 0 }}>
        {children}
      </Typography>
    </Stack>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {hint}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

