import { restoreTabs, restoreWindows } from '@/features/restore-windows';
import {
  HISTORY_ALARM,
  LOSS_NOTIFICATION,
  clearLastLoss,
  ensureHistoryAlarm,
  getLastLoss,
  onHistoryAlarm,
  onTabRemoved,
  scheduleSnapshot,
  startTracking,
} from '@/features/track-windows';
import { browser, type Browser } from '@/shared/browser';

/** Обработчики фонового скрипта. Регистрируются синхронно при каждом пробуждении, иначе Chrome их не вызовет. */
export function startBackground(): void {
  browser.runtime.onInstalled.addListener(onExtensionInstalled);

  const changed = () => scheduleSnapshot();
  browser.tabs.onCreated.addListener(changed);
  browser.tabs.onUpdated.addListener(changed);
  browser.tabs.onMoved.addListener(changed);
  browser.tabs.onAttached.addListener(changed);
  browser.tabs.onDetached.addListener(changed);
  browser.tabs.onActivated.addListener(changed);
  browser.tabs.onReplaced.addListener(changed);
  browser.tabs.onRemoved.addListener((id, info) => void onTabRemoved(id, info));
  browser.windows.onCreated.addListener(changed);
  browser.windows.onRemoved.addListener(changed);
  browser.windows.onBoundsChanged.addListener(changed);
  browser.tabGroups.onCreated.addListener(changed);
  browser.tabGroups.onUpdated.addListener(changed);
  browser.tabGroups.onMoved.addListener(changed);
  browser.tabGroups.onRemoved.addListener(changed);

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === HISTORY_ALARM) void onHistoryAlarm();
  });
  browser.notifications.onButtonClicked.addListener((id) => {
    if (id === LOSS_NOTIFICATION) void restoreLastLoss();
  });
  browser.notifications.onClicked.addListener((id) => {
    if (id !== LOSS_NOTIFICATION) return;
    void browser.notifications.clear(id);
    void openRecoveryPage();
  });

  void ensureHistoryAlarm();
  void startTracking();
}

/** После установки открывается страница «Первый запуск» (docs/extension/specification.md, раздел 1.1). */
async function onExtensionInstalled(details: Browser.runtime.InstalledDetails): Promise<void> {
  if (details.reason !== 'install') return;
  await browser.tabs.create({ url: browser.runtime.getURL('/onboarding.html') });
}

async function restoreLastLoss(): Promise<void> {
  await browser.notifications.clear(LOSS_NOTIFICATION);
  const loss = await getLastLoss();
  if (!loss) return;
  await clearLastLoss();
  await restoreWindows(loss.windows);
  for (const { window, tabs } of loss.tabs) await restoreTabs(window, tabs);
}

async function openRecoveryPage(): Promise<void> {
  await browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#recovery` });
}
