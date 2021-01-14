import React, { FC } from 'react';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, Typography } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { TabList } from '../../services/TabList';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
}

export const TabListItem: FC<Props> = ({ tabList }) => (
  <ExpansionPanel defaultExpanded>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <Typography component="h4" variant="h6">
        {tabList.name} {tabList.date.toLocaleDateString()}
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
