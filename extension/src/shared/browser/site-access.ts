import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

/**
 * Optional site access: needed to load titles and icons of saved tabs
 * (docs/extension/pages/saved.md, section 1). Requested only on a button click.
 */
const ORIGINS = ['<all_urls>'];

export function hasSiteAccess(): Promise<boolean> {
  return browser.permissions.contains({ origins: ORIGINS });
}

export function requestSiteAccess(): Promise<boolean> {
  return browser.permissions.request({ origins: ORIGINS });
}

/** Whether there is access (`undefined` while unknown) and a function that requests it. */
export function useSiteAccess(): [boolean | undefined, () => void] {
  const [access, setAccess] = useState<boolean>();
  useEffect(() => {
    void hasSiteAccess().then(setAccess);
  }, []);
  const request = useCallback(() => void requestSiteAccess().then(setAccess), []);
  return [access, request];
}
