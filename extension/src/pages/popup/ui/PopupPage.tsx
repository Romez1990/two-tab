import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import CompressIcon from '@mui/icons-material/Compress';
import DownloadingIcon from '@mui/icons-material/Downloading';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { findSavedByUrl, SavedMatches, type SavedMatch } from '@/entities/saved';
import { openSavedItem } from '@/features/saved-banner';
import { useWindows, WindowRow } from '@/entities/window';
import { useAttention } from '@/entities/queue';
import { openDownloadWindow } from '@/features/download-banner';
import { SaveCloseButton } from '@/features/save-close';
import { browser } from '@/shared/browser';
import { useSettings } from '@/shared/config';
import { groupColor } from '@/shared/ui';

export function PopupPage() {
  const { windows, reload } = useWindows();
  const [saved, setSaved] = useState<SavedMatch[]>([]);
  const [tabUrl, setTabUrl] = useState('');
  // "Download" works for any page, including sites outside the banner patterns (docs/extension/pages/site_page.md, section 3).
  const connected = Boolean(useSettings()?.localServiceKey);
  // Each queue has its own count of videos waiting for a decision (docs/extension/pages/popup.md).
  // From the background script's connection, at once and without asking the service.
  const attention = useAttention();
  const decisions = { downloads: attention?.downloads.decisions ?? 0, recompress: attention?.recompress.decisions ?? 0 };
  useEffect(() => {
    void browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        setTabUrl(tab?.url ?? '');
        return tab?.url ? findSavedByUrl(tab.url) : [];
      })
      .then(setSaved);
  }, []);

  return (
    <Box sx={{ width: 420, maxHeight: 580, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Tabsurd
        </Typography>
        {connected && /^https?:/i.test(tabUrl) && (
          <Tooltip title="Скачать видео или канал этой страницы">
            <IconButton onClick={() => void openDownloadWindow(tabUrl).then(() => window.close())}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
        {connected && (
          <Tooltip title={decisions.downloads ? `Очередь скачивания (${decisions.downloads})` : 'Очередь скачивания'}>
            <IconButton onClick={() => openSection('downloads')}>
              <Badge badgeContent={decisions.downloads} color="warning">
                <DownloadingIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        {connected && (
          <Tooltip title={decisions.recompress ? `Очередь сжатия (${decisions.recompress})` : 'Очередь сжатия'}>
            <IconButton onClick={() => openSection('recompress')}>
              <Badge badgeContent={decisions.recompress} color="warning">
                <CompressIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Сохранённые">
          <IconButton onClick={() => openSection('saved')}>
            <BookmarksOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Окна">
          <IconButton onClick={() => openSection('windows')}>
            <ViewQuiltOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Восстановление">
          <IconButton onClick={() => openSection('recovery')}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {saved.length > 0 && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <SavedMatches matches={saved} onOpen={(id) => void openSavedItem(id, tabUrl).then(() => window.close())} />
        </Box>
      )}
      <Typography variant="overline" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
        Окна: {windows.length}
      </Typography>
      <List dense sx={{ overflowY: 'auto', pt: 0 }}>
        {windows.map((w) => (
          <Box key={w.id}>
            <WindowRow
              window={w}
              actions={
                <SaveCloseButton windowId={w.id} onDone={reload} />
              }
            />
            {w.groups.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ px: 2, pb: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                {w.groups.map((g) => (
                  <Stack key={g.id} direction="row" sx={{ alignItems: 'center' }}>
                    <Chip size="small" label={`${g.title || 'Без названия'} · ${g.size}`} sx={{ bgcolor: groupColor(g.color), color: '#fff' }} />
                    <SaveCloseButton groupId={g.id} onDone={reload} size="small" />
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );
}

function openSection(section: string) {
  void browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#${section}` });
}
