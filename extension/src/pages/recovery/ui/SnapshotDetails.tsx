import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';
import RestoreIcon from '@mui/icons-material/Restore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { countTabs, type Snapshot, type SnapshotWindow } from '@/entities/snapshot';
import { restoreTabs, restoreWindows } from '@/features/restore-windows';
import { formatDateTime } from '@/shared/lib';
import type { RunAction } from './RecoveryPage';

/** Chrome называет цвета групп словами; здесь — близкие цвета для метки. */
const GROUP_COLORS: Record<string, string> = {
  grey: '#5f6368', blue: '#1a73e8', red: '#d93025', yellow: '#f9ab00', green: '#188038',
  pink: '#d01884', purple: '#a142f4', cyan: '#007b83', orange: '#fa903e',
};

export function SnapshotDetails({ snapshot, run }: { snapshot: Snapshot; run: RunAction }) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Typography variant="h6">Снимок {formatDateTime(snapshot.takenAt)}</Typography>
          <Typography variant="body2" color="text.secondary">
            окон: {snapshot.windows.length} · вкладок: {countTabs(snapshot.windows)}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<RestoreIcon />}
          onClick={() => run(() => restoreWindows(snapshot.windows), 'Все окна снимка открыты.')}
        >
          Восстановить всё
        </Button>
      </Stack>
      <div>
        {snapshot.windows.map((w, i) => (
          <WindowAccordion key={`${snapshot.id}-${w.uid}-${i}`} index={i + 1} window={w} run={run} />
        ))}
      </div>
    </Stack>
  );
}

function WindowAccordion({ index, window, run }: { index: number; window: SnapshotWindow; run: RunAction }) {
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const first = window.tabs[0];

  return (
    <Accordion variant="outlined" disableGutters slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 500 }}>
            Окно {index} · {window.tabs.length} вкладок
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {first?.title || first?.url}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RestoreIcon />} onClick={() => run(() => restoreWindows([window]), 'Окно открыто.')}>
            Восстановить окно
          </Button>
          <Button
            size="small"
            disabled={checked.size === 0}
            onClick={() =>
              run(() => restoreTabs(window, window.tabs.filter((_, i) => checked.has(i))), 'Вкладки открыты.').then(() =>
                setChecked(new Set()),
              )
            }
          >
            Восстановить выбранные ({checked.size})
          </Button>
        </Stack>
        <List dense disablePadding>
          {window.tabs.map((t, i) => {
            const group = t.group === -1 ? undefined : window.groups[t.group];
            return (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => toggle(i)} dense>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox edge="start" size="small" checked={checked.has(i)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  {t.pinned && <PushPinIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  {group && (
                    <Chip
                      size="small"
                      label={group.title || 'группа'}
                      sx={{ mr: 1, bgcolor: GROUP_COLORS[group.color] ?? 'grey.500', color: '#fff' }}
                    />
                  )}
                  <ListItemText primary={t.title || t.url} secondary={t.url} slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
