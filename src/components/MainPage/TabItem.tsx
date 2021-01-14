import React, { FC } from 'react';
import { ListItem } from '@material-ui/core';
import { Tab } from '../../services/TabList';
import { useService } from '../ServiceContainer';

interface Props {
  readonly tab: Tab;
}

export const TabItem: FC<Props> = ({ tab }) => {
  const urlProcessing = useService('urlProcessingService');

  const hostName = urlProcessing.getHostName(tab.url);

  return (
    <ListItem>
      <a href={tab.url} target="_blank" rel="noreferrer">
        {tab.title} <span>{hostName}</span>
      </a>
    </ListItem>
  );
};
