import React, { FC, useState } from 'react';
import { makeStyles, createStyles, Theme, ListItem, Typography, Avatar, Link } from '@material-ui/core';
import { Tab } from '../../services/TabList';
import { useService } from '../ServiceContainer';

interface Props {
  readonly tab: Tab;
  onOpen(shouldBeRemoved: boolean): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(({ spacing }: Theme) =>
  createStyles({
    item: {
      textDecoration: 'none',
      cursor: 'pointer',
    },
  }),
);

export const TabItem: FC<Props> = ({ tab: { title, url, favIconUrl }, onOpen }) => {
  const urlProcessing = useService('urlProcessingService');

  const hostName = urlProcessing.getHostName(url);

  const [isSelected, setSelected] = useState(false);

  const select = (): void => setSelected(true);
  const unSelect = (): void => setSelected(false);

  const onClick = (): void => onOpen(true);

  const onAuxClick = (): void => onOpen(false);

  const classes = useStyles();

  return (
    <Link
      className={classes.item}
      color="inherit"
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      onAuxClick={onAuxClick}
    >
      <ListItem selected={isSelected} onMouseEnter={select} onMouseLeave={unSelect}>
        <Avatar src={favIconUrl} />
        <Typography>{title}</Typography>
        &nbsp;
        <Typography>[{hostName}]</Typography>
      </ListItem>
    </Link>
  );
};
