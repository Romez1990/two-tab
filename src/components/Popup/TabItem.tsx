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
import { BrowserTabElement } from './BrowserTabElement';

interface Props {
  readonly name: string;
  readonly tab: BrowserTabElement;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  readonly disabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(({ spacing }: Theme) =>
  createStyles({
    itemText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }),
);

export const TabItem: FC<Props> = ({ name, tab: { title, favIconUrl, checked }, onChange, disabled }) => {
  const classes = useStyles();

  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox name={`${name}.checked`} checked={checked} onChange={onChange} disabled={disabled} />
      </ListItemIcon>
      <ListItemIcon>
        <Avatar src={favIconUrl} />
      </ListItemIcon>
      <ListItemText className={classes.itemText}>{title}</ListItemText>
    </ListItem>
  );
};
