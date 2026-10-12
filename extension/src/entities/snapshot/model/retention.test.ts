import { describe, expect, it } from 'vitest';
import { DAY, HOUR, MINUTE } from '@/shared/lib';
import { snapshotsToDelete } from './retention';

const now = new Date(2026, 9, 12, 12, 0).getTime();
const at = (id: number, ago: number) => ({ id, takenAt: now - ago });

describe('snapshotsToDelete', () => {
  it('за последние сутки хранятся все', () => {
    expect(snapshotsToDelete([at(1, 10 * MINUTE), at(2, 20 * MINUTE), at(3, 23 * HOUR)], now)).toEqual([]);
  });

  it('до 7 дней — самый поздний снимок за час', () => {
    const base = 2 * DAY + 30 * MINUTE; // 2 дня назад, 11:30
    expect(snapshotsToDelete([at(1, base), at(2, base - 10 * MINUTE), at(3, base - 40 * MINUTE)], now)).toEqual([1]);
  });

  it('до 30 дней — один за сутки, сутки с 6:00', () => {
    // 10 дней назад: 7:00 и 23:00 — одни сутки; 5:00 следующего дня — те же сутки.
    const day = now - 10 * DAY;
    const t = (h: number) => new Date(day).setHours(h, 0, 0, 0);
    const items = [{ id: 1, takenAt: t(7) }, { id: 2, takenAt: t(23) }, { id: 3, takenAt: t(29) }];
    expect(snapshotsToDelete(items, now)).toEqual([2, 1]);
  });

  it('старше 30 дней — один за месяц, без срока', () => {
    const items = [
      { id: 1, takenAt: new Date(2025, 2, 3, 12).getTime() },
      { id: 2, takenAt: new Date(2025, 2, 20, 12).getTime() },
      { id: 3, takenAt: new Date(2024, 0, 1, 12).getTime() },
    ];
    expect(snapshotsToDelete(items, now)).toEqual([1]);
  });
});
