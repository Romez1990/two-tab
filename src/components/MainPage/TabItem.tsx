import React, { FC, useState } from 'react';
import { makeStyles, createStyles, Theme, ListItem, Typography, Avatar } from '@material-ui/core';
import { Tab } from '../../services/TabList';
import { useService } from '../ServiceContainer';

interface Props {
  readonly tab: Tab;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(({ spacing }: Theme) =>
  createStyles({
    item: {
      cursor: 'pointer',
    },
  }),
);

export const TabItem: FC<Props> = ({ tab: { title, url, favIconUrl } }) => {
  const urlProcessing = useService('urlProcessingService');

  const hostName = urlProcessing.getHostName(url);

  const [isSelected, setSelected] = useState(false);

  const select = (): void => setSelected(true);
  const unSelect = (): void => setSelected(false);

  const classes = useStyles();

  return (
    <ListItem className={classes.item} selected={isSelected} onMouseEnter={select} onMouseLeave={unSelect}>
      <Avatar src={favIconUrl} />
      <Typography>{title}</Typography>
      &nbsp;
      <Typography>[{hostName}]</Typography>
    </ListItem>
  );
};
