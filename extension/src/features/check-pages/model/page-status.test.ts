import { describe, expect, it } from 'vitest';
import { isSuspiciousRedirect, statusBadge } from './page-status';

const check = (code: number | undefined, finalUrl?: string) =>
  code === undefined ? { url: 'https://a.com/page', at: 1, failed: true as const } : { url: 'https://a.com/page', at: 1, code, finalUrl };

describe('statusBadge', () => {
  it('всё хорошо — без метки', () => {
    expect(statusBadge(check(200))).toBeNull();
    expect(statusBadge(undefined)).toBeNull();
    expect(statusBadge({ url: 'https://a.com/', at: 1 })).toBeNull();
  });

  it('404, 410 и нет ответа — красные', () => {
    expect(statusBadge(check(404))).toMatchObject({ label: '404', color: 'error' });
    expect(statusBadge(check(410))).toMatchObject({ label: '410', color: 'error' });
    expect(statusBadge(check(undefined))).toMatchObject({ label: 'нет ответа', color: 'error' });
  });

  it('сайт не пустил проверку — оранжевая, код в пояснении', () => {
    const badge = statusBadge(check(403));
    expect(badge).toMatchObject({ label: 'не пустил', color: 'warning' });
    expect(badge?.hint).toContain('403');
  });

  it('прочие ошибки — оранжевые с кодом', () => {
    expect(statusBadge(check(500))).toMatchObject({ label: '500', color: 'warning' });
  });

  it('подозрительное перенаправление — оранжевая стрелка', () => {
    expect(statusBadge(check(200, 'https://b.com/'))).toMatchObject({ label: '↪', color: 'warning' });
    expect(statusBadge(check(200, 'https://www.a.com/page'))).toBeNull();
  });
});

describe('isSuspiciousRedirect', () => {
  it('другой сайт или главная страница; https и www не в счёт', () => {
    expect(isSuspiciousRedirect('http://a.com/x', 'https://www.a.com/x')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://a.com/y')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://a.com/')).toBe(true);
    expect(isSuspiciousRedirect('https://a.com/', 'https://a.com/')).toBe(false);
    expect(isSuspiciousRedirect('https://a.com/x', 'https://b.com/x')).toBe(true);
  });
});
