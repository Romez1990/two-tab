import { useEffect, useState } from 'react';
import { db } from '@/shared/db';

/** Состояние фоновой проверки сохранённых (docs/extension/specification.md, раздел 2.1). */
export interface CheckState {
  running: boolean;
  /** Проверено из `total`; `total` 0 — проверка ещё считает, что проверять. */
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

/** Состояние для страницы настроек; проверка идёт в другой странице расширения, поэтому оно перечитывается раз в секунду. */
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
