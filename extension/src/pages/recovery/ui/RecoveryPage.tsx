import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { listClosedTabs, type ClosedTab } from '@/entities/closed-tab';
import { countTabs, listHistory, type Snapshot } from '@/entities/snapshot';
import { formatDateTime } from '@/shared/lib';
import { ClosedTabsList } from './ClosedTabsList';
import { SnapshotDetails } from './SnapshotDetails';

export type RunAction = (action: () => Promise<void>, done: string) => Promise<void>;

/** «Восстановление»: история снимков и недавно закрытые вкладки (docs/extension/specification.md, раздел 2.2). */
export function RecoveryPage() {
  const [tab, setTab] = useState<'snapshots' | 'closed'>('snapshots');
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [closed, setClosed] = useState<ClosedTab[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);

  const reload = useCallback(() => {
    void listHistory().then((h) => {
      setHistory(h);
      setSelectedId((id) => id ?? h[0]?.id);
    });
    void listClosedTabs().then(setClosed);
  }, []);
  useEffect(reload, [reload]);

  const run: RunAction = async (action, done) => {
    try {
      await action();
      setStatus({ text: done, error: false });
    } catch (e) {
      setStatus({ text: `Ошибка: ${e instanceof Error ? e.message : String(e)}`, error: true });
    }
    reload();
  };

  const selected = history.find((s) => s.id === selectedId);

  return (
    <>
      <Tabs value={tab} onChange={(_, v: typeof tab) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="snapshots" label={`Снимки окон (${history.length})`} />
        <Tab value="closed" label={`Недавно закрытые (${closed.length})`} />
      </Tabs>

      {tab === 'snapshots' &&
        (history.length === 0 ? (
          <Alert severity="info">
            Снимков пока нет: первый появится через 10 минут работы или при следующем запуске Chrome.
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2, alignItems: 'start' }}>
            <Paper variant="outlined" sx={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <List disablePadding>
                {history.map((s) => (
                  <ListItemButton key={s.id} selected={s.id === selectedId} onClick={() => setSelectedId(s.id)} divider>
                    <ListItemText
                      primary={formatDateTime(s.takenAt)}
                      secondary={`окон: ${s.windows.length} · вкладок: ${countTabs(s.windows)}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
            {selected ? (
              <SnapshotDetails snapshot={selected} run={run} />
            ) : (
              <Typography color="text.secondary">Выберите снимок слева.</Typography>
            )}
          </Box>
        ))}

      {tab === 'closed' && <ClosedTabsList tabs={closed} run={run} />}

      <Snackbar open={status !== null} autoHideDuration={4000} onClose={() => setStatus(null)}>
        <Alert severity={status?.error ? 'error' : 'success'} variant="filled" onClose={() => setStatus(null)}>
          {status?.text}
        </Alert>
      </Snackbar>
    </>
  );
}
