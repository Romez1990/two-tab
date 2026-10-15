import type { SavedItem } from './types';

/**
 * Import from BetterOneTab and SupaTabs (docs/extension/pages/saved.md, section 1): every group of the file is a saved
 * group with the name from the file (or empty), the time from the file and no color. The record id is derived from the content
 * so that a repeated import does not duplicate anything.
 */

interface ForeignTab {
  url: string;
  title: string;
}

/** BetterOneTab: `[{ title, time, tabs: [{ url, title, pinned }] }]`. */
export function parseBetterOneTab(data: unknown): SavedItem[] | undefined {
  if (!Array.isArray(data) || !data.every((g) => isObject(g) && Array.isArray(g.tabs))) return undefined;
  return (data as Record<string, unknown>[]).flatMap((g) =>
    toItem(str(g.title), typeof g.time === 'number' ? g.time : 0, (g.tabs as unknown[]).flatMap(foreignTab)),
  );
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function toItem(title: string, time: number, tabs: ForeignTab[]): SavedItem[] {
  if (tabs.length === 0) return [];
  return [
    {
      id: `import-${hash(`${time}\n${title}\n${tabs.map((t) => t.url).join('\n')}`)}`,
      kind: 'group',
      title,
      savedAt: time,
      reason: 'manual',
      window: {
        uid: '',
        focused: false,
        state: 'normal',
        groups: [{ title, color: '', collapsed: false }],
        tabs: tabs.map((t, i) => ({ url: t.url, title: t.title, pinned: false, active: i === 0, group: 0 })),
      },
    },
  ];
}

/** Two 32-bit FNV-1a hashes make 64 bits, so that different groups do not collide. */
function hash(text: string): string {
  let a = 0x811c9dc5;
  let b = 0x050c5d1f;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x01000193 + 0x200);
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function foreignTab(t: unknown): ForeignTab[] {
  if (!isObject(t) || typeof t.url !== 'string' || !t.url || t.url.startsWith('chrome://newtab')) return [];
  return [{ url: t.url, title: str(t.title) }];
}

/** SupaTabs: `{ groups: { id: { title, date, tabIds } }, tabs: { id: { url, title } }, workspaces: { id: { groupOrder } } }`. */
export function parseSupaTabs(data: unknown): SavedItem[] | undefined {
  if (!isObject(data) || !isObject(data.groups) || !isObject(data.tabs)) return undefined;
  const groups = data.groups;
  const tabs = data.tabs;
  const order = isObject(data.workspaces)
    ? Object.values(data.workspaces).flatMap((w) => (isObject(w) && Array.isArray(w.groupOrder) ? w.groupOrder : []))
    : [];
  const ids = [...new Set([...order.map(String), ...Object.keys(groups)])].filter((id) => id in groups);
  return ids.flatMap((id) => {
    const g = groups[id];
    if (!isObject(g)) return [];
    const tabIds = Array.isArray(g.tabIds) ? g.tabIds.map(String) : [];
    return toItem(str(g.title), typeof g.date === 'number' ? g.date : 0, tabIds.flatMap((t) => foreignTab(tabs[t])));
  });
}
