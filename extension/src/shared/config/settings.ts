import { useEffect, useState } from 'react';
import { browser } from '@/shared/browser';

/**
 * Настройки (docs/extension/specification.md, раздел 1.2): общие для компьютеров — в `storage.sync`,
 * только для этого компьютера — в `storage.local`. Изменения сразу видят все части расширения.
 */
export interface SyncSettings {
  /** Через сколько дней работы Chrome без перехода на вкладки окно или группа закрываются. 0 — не закрывать. */
  autoCloseDays: number;
  /** «Не закрывать»: окна по постоянному номеру. */
  keepWindowUids: string[];
  /** Имена окон по постоянному номеру. */
  windowNames: Record<string, string>;
  syncServerUrl: string;
}

export interface LocalSettings {
  profileName: string;
  /** Случайный номер профиля для локального сервиса; создаётся при первом подключении. */
  profileId: string;
  /** Порт локального сервиса Tidy Reel на 127.0.0.1. */
  localServicePort: number;
  /** Ключ доступа к локальному сервису; пустой — профиль не подключён. */
  localServiceKey: string;
}

export interface Settings extends SyncSettings, LocalSettings {}

const SYNC_DEFAULTS: SyncSettings = {
  autoCloseDays: 30,
  keepWindowUids: [],
  windowNames: {},
  syncServerUrl: '',
};
const LOCAL_DEFAULTS: LocalSettings = { profileName: '', profileId: '', localServicePort: 47810, localServiceKey: '' };
const SYNC_KEY = 'settings';
const LOCAL_KEY = 'localSettings';

export async function getSettings(): Promise<Settings> {
  const [sync, local] = await Promise.all([browser.storage.sync.get(SYNC_KEY), browser.storage.local.get(LOCAL_KEY)]);
  return { ...SYNC_DEFAULTS, ...(sync[SYNC_KEY] as Partial<SyncSettings>), ...LOCAL_DEFAULTS, ...(local[LOCAL_KEY] as Partial<LocalSettings>) };
}

export async function updateSettings(change: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const next = { ...current, ...change };
  const sync: SyncSettings = {
    autoCloseDays: next.autoCloseDays,
    keepWindowUids: next.keepWindowUids,
    windowNames: next.windowNames,
    syncServerUrl: next.syncServerUrl,
  };
  const local: LocalSettings = {
    profileName: next.profileName,
    profileId: next.profileId,
    localServicePort: next.localServicePort,
    localServiceKey: next.localServiceKey,
  };
  await Promise.all([browser.storage.sync.set({ [SYNC_KEY]: sync }), browser.storage.local.set({ [LOCAL_KEY]: local })]);
}

/** Настройки для страниц; обновляются, когда их меняет любая часть расширения. */
export function useSettings(): Settings | undefined {
  const [settings, setSettings] = useState<Settings>();
  useEffect(() => {
    const load = () => void getSettings().then(setSettings);
    load();
    browser.storage.onChanged.addListener(load);
    return () => browser.storage.onChanged.removeListener(load);
  }, []);
  return settings;
}
