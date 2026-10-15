import { sendCheckMessage } from './control';
import { updateCheckState } from './state';

/** How many are checked out of how many; written to the database at most twice a second. */
export type ReportProgress = (checked: number, total: number) => void;

/**
 * Runs the background check in the service page. The app layer passes what to check (`task`): the feature does not depend
 * on the title and icon features. `task` skips what is already checked by itself, so after a Chrome restart
 * the check continues from where it stopped.
 */
export async function runBackgroundCheck(task: (signal: AbortSignal, report: ReportProgress) => Promise<void>): Promise<void> {
  let last = 0;
  const report: ReportProgress = (checked, total) => {
    const now = Date.now();
    if (now - last < 500 && checked < total) return;
    last = now;
    void updateCheckState({ checked, total });
  };
  try {
    await task(new AbortController().signal, report);
  } finally {
    await sendCheckMessage({ type: 'tabsurd:check-done' });
  }
}
