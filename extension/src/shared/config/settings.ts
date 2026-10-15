import { useEffect, useState } from 'react';
import { browser } from '@/shared/browser';

/**
 * Settings (docs/extension/specification.md, section 1.2): shared between computers in `storage.sync`,
 * this computer only in `storage.local`. All parts of the extension see changes at once.
 */
export interface SyncSettings {
  /** After how many days of Chrome running without visiting its tabs a window or group is closed. 0 means never. */
  autoCloseDays: number;
  /** "Do not close": windows by permanent id. */
  keepWindowUids: string[];
  /** Window names by permanent id. */
  windowNames: Record<string, string>;
  syncServerUrl: string;
}

export interface LocalSettings {
  profileName: string;
  /** Random profile id for the local service; created on the first connection. */
  profileId: string;
  /** Port of the local Tidy Reel service on 127.0.0.1. */
  localServicePort: number;
  /** Access key to the local service; empty means the profile is not connected. */
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

/** Settings for pages; updated when any part of the extension changes them. */
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
