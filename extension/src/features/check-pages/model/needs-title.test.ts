import { describe, expect, it } from 'vitest';
import { detectCharset, needsTitle } from './needs-title';

describe('needsTitle', () => {
  it('нет заголовка, адрес или домен вместо заголовка', () => {
    expect(needsTitle({ url: 'https://spankbang.com/s/x/', title: '' })).toBe(true);
    expect(needsTitle({ url: 'https://spankbang.com/s/x/', title: 'spankbang.com' })).toBe(true);
    expect(needsTitle({ url: 'https://www.example.com/a', title: 'www.example.com' })).toBe(true);
    expect(needsTitle({ url: 'https://example.com/a', title: 'https://example.com/a' })).toBe(true);
    expect(needsTitle({ url: 'https://example.com/a', title: 'example.com/a' })).toBe(true);
  });

  it('настоящий заголовок и не веб-адреса не трогаются', () => {
    expect(needsTitle({ url: 'https://example.com/a', title: 'Пример' })).toBe(false);
    expect(needsTitle({ url: 'chrome://settings/', title: '' })).toBe(false);
    expect(needsTitle({ url: 'file:///C:/a.html', title: '' })).toBe(false);
  });
});

describe('detectCharset', () => {
  it('из заголовка ответа, из meta, по умолчанию utf-8', () => {
    expect(detectCharset('text/html; charset=windows-1251', '')).toBe('windows-1251');
    expect(detectCharset('text/html', '<meta charset="KOI8-R">')).toBe('koi8-r');
    expect(detectCharset(null, '<meta http-equiv="Content-Type" content="text/html; charset=cp1251">')).toBe('cp1251');
    expect(detectCharset(null, '')).toBe('utf-8');
  });
});
