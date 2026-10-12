import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { deleteClosedTab, type ClosedTab } from '@/entities/closed-tab';
import { browser } from '@/shared/browser';
import { formatDateTime } from '@/shared/lib';
import type { RunAction } from './RecoveryPage';

/** Вкладки, закрытые по одной; хранятся 30 дней. */
export function ClosedTabsList({ tabs, run }: { tabs: ClosedTab[]; run: RunAction }) {
  if (tabs.length === 0) return <Alert severity="info">Закрытых вкладок нет. Они хранятся 30 дней.</Alert>;
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {tabs.map((t) => (
          <ListItem
            key={t.id}
            divider
            secondaryAction={
              <Tooltip title="Открыть и убрать из списка">
                <IconButton
                  edge="end"
                  onClick={() =>
                    run(async () => {
                      await browser.tabs.create({ url: t.url, active: false });
                      if (t.id !== undefined) await deleteClosedTab(t.id);
                    }, 'Вкладка открыта.')
                  }
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={t.title || t.url}
              secondary={`${formatDateTime(t.closedAt)} · ${t.url}`}
              slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
              sx={{ pr: 4 }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
