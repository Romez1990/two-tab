import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { ReactNode } from 'react';
import type { BrowserWindow } from '../model/types';

export function WindowRow({ window, actions }: { window: BrowserWindow; actions?: ReactNode }) {
  const first = window.tabs[0];
  return (
    <ListItem secondaryAction={actions} sx={{ pr: 12 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: window.focused ? 'primary.main' : 'action.selected', color: window.focused ? undefined : 'text.primary', fontSize: 14 }}>
          {window.tabs.length}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={first?.title || first?.url || '—'}
        secondary={`${window.tabs.length} вкладок${window.focused ? ' · текущее окно' : ''}`}
        slotProps={{ primary: { noWrap: true } }}
        sx={{ pr: 2 }}
      />
    </ListItem>
  );
}
