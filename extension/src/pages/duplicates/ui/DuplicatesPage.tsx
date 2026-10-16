import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { addSaved, deleteSaved, getSaved, listSaved, removeSavedTab, savedItemPageUrl } from '@/entities/saved';
import { browser } from '@/shared/browser';
import { Favicon, usePaging } from '@/shared/ui';
import { findDuplicates, placeOf, type Copy, type Duplicate } from '../model/duplicates';
import { errorText } from '@/shared/lib';

/** "Duplicates" (docs/extension/pages/duplicates.md): identical open and saved tabs. */
export function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<Duplicate[] | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    void loadDuplicates()
      .then(setDuplicates)
      .catch((e: unknown) => setError(errorText(e)));
  }, []);
  useEffect(reload, [reload]);
  const { visible, footer } = usePaging(duplicates ?? [], { storageKey: 'tabsurd.duplicatesPaging' });

  async function remove(copy: Copy) {
    try {
      await removeCopy(copy);
    } catch (e) {
      setError(errorText(e));
    }
    reload();
  }

  if (duplicates === null) return <Typography color="text.secondary">Ищу одинаковые вкладки…</Typography>;
  return (
    <Stack spacing={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="body2" color="text.secondary">
        {duplicates.length ? `Адресов с копиями: ${duplicates.length}` : 'Одинаковых вкладок нет.'}
      </Typography>
      {visible.map((duplicate) => (
        <Accordion key={duplicate.key} disableGutters variant="outlined">
          <AccordionSummary>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
              <Favicon url={duplicate.copies[0]!.url} size={16} />
              <Typography noWrap sx={{ flex: 1 }} title={duplicate.copies[0]!.title}>
                {duplicate.copies[0]!.title || duplicate.copies[0]!.url}
              </Typography>
              <Chip size="small" label={`${duplicate.copies.length} раза`} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={0.5}>
              {duplicate.copies.map((copy) => (
                <Stack key={copy.kind === 'open' ? `o${copy.tabId}` : `s${copy.savedId}:${copy.index}`} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ width: 260, flexShrink: 0 }} noWrap>
                    {placeOf(copy)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }} title={copy.url}>
                    {copy.url}
                  </Typography>
                  <Button size="small" onClick={() => void goTo(copy, false)} onAuxClick={(e) => e.button === 1 && void goTo(copy, true)}>
                    Перейти
                  </Button>
                  <Button size="small" color="warning" onClick={() => void remove(copy)}>
                    {copy.kind === 'open' ? 'Закрыть' : 'Удалить из сохранённых'}
                  </Button>
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
      {footer}
    </Stack>
  );
}

async function loadDuplicates(): Promise<Duplicate[]> {
  const tabs = await browser.tabs.query({});
  const open = tabs
    .filter((tab) => tab.id !== undefined && tab.url)
    .map((tab) => ({ id: tab.id!, windowId: tab.windowId, title: tab.title ?? '', url: tab.url! }));
  return findDuplicates(open, await listSaved());
}

async function removeCopy(copy: Copy): Promise<void> {
  if (copy.kind === 'open') {
    await browser.tabs.remove(copy.tabId);
    return;
  }
  const item = await getSaved(copy.savedId);
  if (!item) return;
  // The tab index may have shifted: the tab with the same address closest to the old place is removed.
  const index = item.window.tabs[copy.index]?.url === copy.url ? copy.index : item.window.tabs.findIndex((t) => t.url === copy.url);
  if (index < 0) return;
  const after = removeSavedTab(item, index);
  if (after) await addSaved(after);
  else await deleteSaved(item.id);
}

async function goTo(copy: Copy, background: boolean): Promise<void> {
  if (copy.kind === 'open') {
    await browser.tabs.update(copy.tabId, { active: true });
    await browser.windows.update(copy.windowId, { focused: true });
  } else {
    await browser.tabs.create({ url: savedItemPageUrl(copy.savedId, copy.url), active: !background });
  }
}
