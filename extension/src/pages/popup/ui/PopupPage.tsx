import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import HistoryIcon from '@mui/icons-material/History';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useWindows, WindowRow } from '@/entities/window';
import { SaveCloseButton } from '@/features/save-close';
import { browser } from '@/shared/browser';
import { groupColor } from '@/shared/ui';

function openSection(section: string) {
  void browser.tabs.create({ url: `${browser.runtime.getURL('/app.html')}#${section}` });
}

export function PopupPage() {
  const { windows, reload } = useWindows();

  return (
    <Box sx={{ width: 420, maxHeight: 580, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Tabsurd
        </Typography>
        <Tooltip title="Окна">
          <IconButton onClick={() => openSection('windows')}>
            <ViewQuiltOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Сохранённые">
          <IconButton onClick={() => openSection('saved')}>
            <BookmarksOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Восстановление">
          <IconButton onClick={() => openSection('recovery')}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Stack>
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
