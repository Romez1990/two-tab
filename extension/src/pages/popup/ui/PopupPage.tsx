import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { listWindows, WindowRow, type BrowserWindow } from '@/entities/window';
import { RecreateWindowButton } from '@/features/recreate-window';
import { browser } from '@/shared/browser';

export function PopupPage() {
  const [windows, setWindows] = useState<BrowserWindow[]>([]);
  const reload = useCallback(() => {
    void listWindows().then(setWindows);
  }, []);
  useEffect(reload, [reload]);

  return (
    <Box sx={{ width: 400, maxHeight: 580, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Tabsurd
        </Typography>
        <Button
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => void browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#recovery` })}
        >
          Восстановление
        </Button>
      </Stack>
      <Typography variant="overline" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
        Окна: {windows.length}
      </Typography>
      <List dense sx={{ overflowY: 'auto', pt: 0 }}>
        {windows.map((w) => (
          <WindowRow key={w.id} window={w} actions={<RecreateWindowButton window={w} onDone={reload} />} />
        ))}
      </List>
    </Box>
  );
}
