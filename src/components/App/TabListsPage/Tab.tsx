import React, { FC, useState } from 'react';
import { makeStyles, createStyles, Theme, ListItem, Typography, Avatar, Link } from '@material-ui/core';
import { Tab } from '../../../services/Storage/TabList';
import { useService } from '../../Providers/ServiceContainer';

interface Props {
  readonly tab: Tab;
  onOpen(shouldBeDeleted: boolean): void;
}

const useStyles = makeStyles(({ spacing, typography: { pxToRem } }: Theme) =>
  createStyles({
    item: {
      cursor: 'pointer',
    },
    icon: {
      marginRight: spacing(1),
      height: pxToRem(42),
      width: pxToRem(42),
    },
    title: {
      fontSize: pxToRem(16),
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
      href={url}
      target="_blank"
      rel="noreferrer"
      color="inherit"
      underline="none"
      onClick={onClick}
      onAuxClick={onAuxClick}
    >
      <ListItem selected={isSelected} onMouseEnter={select} onMouseLeave={unSelect}>
        <Avatar className={classes.icon} src={favIconUrl} />
        <Typography className={classes.title}>
          {title} [{hostName}]
        </Typography>
      </ListItem>
    </Link>
  );
};
