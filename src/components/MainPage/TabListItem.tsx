import React, { FC } from 'react';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, Typography } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { TabList } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
}

export const TabListItem: FC<Props> = ({ tabList }) => {
  const datetimeService = useService('datetimeService');

  const tabsCount = getTabCount();
  const datetime = datetimeService.toLocaleString(tabList.date);

  function getTabCount() {
    const tabCount = tabList.tabs.length;
    const tabWord = tabCount === 1 ? 'tab' : 'tabs';
    return `${tabCount} ${tabWord}`;
  }

  return (
    <ExpansionPanel defaultExpanded>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="h4" variant="h6">
          {tabList.name} ({tabsCount}) [{datetime}]
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List>
          {tabList.tabs.map((tab, i) => (
            <TabItem key={i} tab={tab} />
          ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
