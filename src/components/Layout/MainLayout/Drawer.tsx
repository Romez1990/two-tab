import React, { FC } from 'react';
import { makeStyles, createStyles, Theme, Drawer as MuiDrawer } from '@material-ui/core';

interface StyleProps {
  width: number;
}

interface Props extends StyleProps {
  open: boolean;
}

const useStyles = makeStyles(({ mixins: { toolbar } }: Theme) =>
  createStyles({
    drawer: ({ width }: StyleProps) => ({
      width,
    }),
    drawerPaper: ({ width }: StyleProps) => ({
      width,
    }),
    toolbar,
  }),
);

export const Drawer: FC<Props> = ({ width, open }) => {
  const classes = useStyles({ width });

  return (
    <MuiDrawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.toolbar} />
    </MuiDrawer>
  );
};
