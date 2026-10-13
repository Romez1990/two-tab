import { getSaved } from '@/entities/saved';
import { AUTO_CLOSE_NOTIFICATION_PREFIX, runAutoClose } from '@/features/auto-close';
import { onCheckMessage, resumeBackgroundCheck } from '@/features/background-check';
import { showBannerIfSaved } from '@/features/saved-banner';
import { restoreTabs, restoreWindows, returnSaved } from '@/features/restore-windows';
import { saveAndCloseGroup, saveAndCloseWindow } from '@/features/save-close';
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
  browser.tabs.onUpdated.addListener((id, info, tab) => {
    // Сразу при начале загрузки; при полной загрузке — ещё раз, если в начале во вкладке был старый документ.
    if (info.status === 'loading' || info.url) void showBannerIfSaved(id, tab.url, 'start');
    if (info.status === 'complete') void showBannerIfSaved(id, tab.url, 'complete');
  });
  browser.tabs.onRemoved.addListener((id, info) => void onTabRemoved(id, info));
  browser.windows.onCreated.addListener(changed);
  browser.windows.onRemoved.addListener(changed);
  browser.windows.onBoundsChanged.addListener(changed);
  browser.tabGroups.onCreated.addListener(changed);
  browser.tabGroups.onUpdated.addListener(changed);
  browser.tabGroups.onMoved.addListener(changed);
  browser.tabGroups.onRemoved.addListener(changed);

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === HISTORY_ALARM) void onHistoryAlarm().then(autoClose);
  });
  browser.notifications.onButtonClicked.addListener((id) => {
    if (id === LOSS_NOTIFICATION) void restoreLastLoss();
    if (id.startsWith(AUTO_CLOSE_NOTIFICATION_PREFIX)) void returnAutoClosed(id);
  });
  browser.notifications.onClicked.addListener((id) => {
    const section = id === LOSS_NOTIFICATION ? 'recovery' : id.startsWith(AUTO_CLOSE_NOTIFICATION_PREFIX) ? 'saved' : null;
    if (!section) return;
    void browser.notifications.clear(id);
    void openAppSection(section);
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => onCheckMessage(message, sendResponse));

  void ensureHistoryAlarm();
  void resumeBackgroundCheck();
  void startTracking();
}

/** После установки открывается страница «Первый запуск» (docs/extension/pages/onboarding.md). */
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

/** Автозакрытие (docs/extension/specification.md, раздел 3.2) — вместе с историей снимков, раз в 10 минут. */
function autoClose(): Promise<void> {
  return runAutoClose({
    window: (id) => saveAndCloseWindow(id, 'auto'),
    group: (id) => saveAndCloseGroup(id, 'auto'),
  });
}

async function returnAutoClosed(notificationId: string): Promise<void> {
  await browser.notifications.clear(notificationId);
  const item = await getSaved(notificationId.slice(AUTO_CLOSE_NOTIFICATION_PREFIX.length));
  if (item) await returnSaved(item);
}

async function openAppSection(section: string): Promise<void> {
  await browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#${section}` });
}
