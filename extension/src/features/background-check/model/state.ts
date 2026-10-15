import { useEffect, useState } from 'react';
import { db } from '@/shared/db';

/** State of the background check of saved items (docs/extension/pages/saved.md, section 1). */
export interface CheckState {
  running: boolean;
  /** Checked out of `total`; `total` 0 means the check is still counting what to check. */
  checked: number;
  total: number;
  startedAt?: number;
  finishedAt?: number;
}

const STATE_KEY = 'backgroundCheck';
const IDLE: CheckState = { running: false, checked: 0, total: 0 };

export async function getCheckState(): Promise<CheckState> {
  return ((await db.meta.get(STATE_KEY))?.value as CheckState | undefined) ?? IDLE;
}

export async function updateCheckState(change: Partial<CheckState>): Promise<void> {
  await db.transaction('rw', db.meta, async () => {
    await db.meta.put({ key: STATE_KEY, value: { ...(await getCheckState()), ...change } });
  });
}

/** State for the settings page; the check runs in another extension page, so it is re-read every second. */
export function useCheckState(): CheckState | undefined {
  const [state, setState] = useState<CheckState>();
  useEffect(() => {
    const read = () => void getCheckState().then(setState);
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, []);
  return state;
}
