import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

/**
 * Необязательный доступ к сайтам: нужен, чтобы загружать заголовки и значки сохранённых вкладок
 * (docs/extension/pages/saved.md, раздел 1). Спрашивается только по нажатию кнопки.
 */
const ORIGINS = ['<all_urls>'];

export function hasSiteAccess(): Promise<boolean> {
  return browser.permissions.contains({ origins: ORIGINS });
}

export function requestSiteAccess(): Promise<boolean> {
  return browser.permissions.request({ origins: ORIGINS });
}

/** Есть ли доступ (`undefined`, пока неизвестно) и функция, которая его спрашивает. */
export function useSiteAccess(): [boolean | undefined, () => void] {
  const [access, setAccess] = useState<boolean>();
  useEffect(() => {
    void hasSiteAccess().then(setAccess);
  }, []);
  const request = useCallback(() => void requestSiteAccess().then(setAccess), []);
  return [access, request];
}
