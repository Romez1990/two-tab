import { describe, expect, it } from 'vitest';
import { isSuspiciousRedirect, statusBadge } from './page-status';

const check = (code: number | undefined, finalUrl?: string) =>
  code === undefined
    ? { url: 'https://a.com/page', at: 1, failed: true as const }
    : { url: 'https://a.com/page', at: 1, code, ...(finalUrl ? { finalUrl } : {}) };

describe('statusBadge', () => {
  it('shows no badge when the page is fine', () => {
    expect(statusBadge(check(200))).toBeNull();
    expect(statusBadge(undefined)).toBeNull();
    expect(statusBadge({ url: 'https://a.com/', at: 1 })).toBeNull();
  });

  it('shows red for 404, 410 and no response', () => {
    expect(statusBadge(check(404))).toMatchObject({ label: '404', color: 'error' });
    expect(statusBadge(check(410))).toMatchObject({ label: '410', color: 'error' });
    expect(statusBadge(check(undefined))).toMatchObject({ label: 'нет ответа', color: 'error' });
  });

  it('shows orange with the code when the site blocked the check', () => {
    const badge = statusBadge(check(403));
    expect(badge).toMatchObject({ label: 'не пустил', color: 'warning' });
    expect(badge?.hint).toContain('403');
  });

  it('shows other errors orange with the code', () => {
    expect(statusBadge(check(500))).toMatchObject({ label: '500', color: 'warning' });
  });

  it('shows an orange arrow for a suspicious redirect', () => {
    expect(statusBadge(check(200, 'https://b.com/'))).toMatchObject({ label: '↪', color: 'warning' });
    expect(statusBadge(check(200, 'https://www.a.com/page'))).toBeNull();
  });
});

describe('isSuspiciousRedirect', () => {
  it('treats another site or the home page as suspicious, ignoring https and www', () => {
    expect(isSuspiciousRedirect('http://a.com/x', 'https://www.a.com/x')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://a.com/y')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://a.com/')).toBe(true);
    expect(isSuspiciousRedirect('https://a.com/', 'https://a.com/')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://b.com/x')).toBe(true);
  });
});
