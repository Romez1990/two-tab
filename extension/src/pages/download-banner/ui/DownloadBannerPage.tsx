import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { openDownloadWindow, type DownloadFrameMessage } from '@/features/download-banner';
import { AttentionBanner } from '@/features/queue-attention';
import { browser } from '@/shared/browser';

function post(message: DownloadFrameMessage) {
  parent.postMessage(message, '*');
}

/** Плашка «Скачать» в iframe на сайте (docs/extension/pages/site_page.md, раздел 3); адрес и вид — в `?url=&kind=&downloaded=`. */
export function DownloadBannerPage() {
  const params = new URLSearchParams(location.search);
  const url = params.get('url') ?? '';
  const channel = params.get('kind') === 'channel';
  const downloaded = params.get('downloaded') ?? '';
  const box = useRef<HTMLDivElement>(null);
  // Высота iframe — по содержимому.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => post({ tabsurd: 'download-banner-height', height: Math.ceil(el.getBoundingClientRect().height) }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Paper ref={box} sx={{ px: 1.5, py: 1 }}>
      {/* «Нужно ваше решение» — там же, где плашка видео (docs/extension/queues.md, раздел 4). */}
      <AttentionBanner dense onOpen={(section) => void browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#${section}` })} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" noWrap title={downloaded} sx={{ flex: 1, minWidth: 0 }}>
          {downloaded ? `Скачано: ${downloaded}` : channel ? 'Канал' : 'Видео'}
        </Typography>
        <Button size="small" variant={downloaded ? 'text' : 'contained'} onClick={() => void openDownloadWindow(url)}>
          {channel ? 'Скачать канал' : downloaded ? 'Скачать ещё раз' : 'Скачать'}
        </Button>
        <IconButton size="small" aria-label="Закрыть" onClick={() => post({ tabsurd: 'download-banner-close' })}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
