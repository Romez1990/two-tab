import React, { FC } from 'react';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, Typography } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { TabList } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
}

export const TabListItem: FC<Props> = ({ tabList: { name, date, tabs } }) => {
  const datetimeService = useService('datetimeService');

  const tabsCount = getTabCount();
  const datetime = datetimeService.toLocaleString(date);

  function getTabCount() {
    const tabCount = tabs.length;
    const tabWord = tabCount === 1 ? 'tab' : 'tabs';
    return `${tabCount} ${tabWord}`;
  }

  return (
    <ExpansionPanel defaultExpanded>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="h4" variant="h6">
          {name} ({tabsCount}) [{datetime}]
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List>
          {tabs.map(tab => (
            <TabItem key={tab.id} tab={tab} />
          ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
