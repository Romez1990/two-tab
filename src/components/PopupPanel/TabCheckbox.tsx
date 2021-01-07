import React, { FC, ChangeEvent } from 'react';
import { ListItem, ListItemIcon, ListItemText, Avatar, Checkbox } from '@material-ui/core';
import { TabElement } from './TabElement';

interface Props {
  tab: TabElement;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export const TabCheckbox: FC<Props> = ({ tab, onChange }) => {
  const { title, favIconUrl, checked } = tab;

  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox checked={checked} onChange={onChange} />
      </ListItemIcon>
      <ListItemIcon>
        <Avatar src={favIconUrl} />
      </ListItemIcon>
      <ListItemText>{title}</ListItemText>
    </ListItem>
  );
};
