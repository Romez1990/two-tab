import React, { FC } from 'react';
import { ExpansionPanel, List } from '@material-ui/core';
import { TabList } from '../../services/TabList';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
}

export const TabListItem: FC<Props> = ({ tabList }) => (
  <ExpansionPanel>
    <List>
      {tabList.tabs.map(tab => (
        <TabItem tab={tab} />
      ))}
    </List>
  </ExpansionPanel>
);
