import React, { FC } from 'react';
import { ListItem, ListItemIcon, ListItemText, Avatar, Checkbox } from '@material-ui/core';
import { Tab } from '../../services/Tab';

interface Props {
  tab: Tab;
}

export const TabCheckbox: FC<Props> = ({ tab }) => {
  const { title, favIconUrl } = tab;

  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox />
      </ListItemIcon>
      <ListItemIcon>
        <Avatar src={favIconUrl} />
      </ListItemIcon>
      <ListItemText>{title}</ListItemText>
    </ListItem>
  );
};
