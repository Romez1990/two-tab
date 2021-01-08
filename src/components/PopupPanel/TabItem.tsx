import React, { FC, ChangeEvent } from 'react';
import {
  makeStyles,
  createStyles,
  Theme,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Checkbox,
} from '@material-ui/core';
import { TabElement } from './TabElement';

interface Props {
  readonly name: string;
  readonly tab: TabElement;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

const useStyles = makeStyles(({ spacing }: Theme) =>
  createStyles({
    itemText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }),
);

export const TabItem: FC<Props> = ({ name, tab: { title, favIconUrl, checked }, onChange }) => {
  const classes = useStyles();

  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox name={`${name}.checked`} checked={checked} onChange={onChange} />
      </ListItemIcon>
      <ListItemIcon>
        <Avatar src={favIconUrl} />
      </ListItemIcon>
      <ListItemText className={classes.itemText}>{title}</ListItemText>
    </ListItem>
  );
};
