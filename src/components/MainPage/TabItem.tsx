import React, { FC } from 'react';
import { ListItem } from '@material-ui/core';
import { Tab } from '../../services/TabList';

interface Props {
  readonly tab: Tab;
}

export const TabItem: FC<Props> = ({ tab }) => (
  <ListItem>
    <div>{tab.title}</div>
  </ListItem>
);
