import React, { FC } from 'react';
import {
  makeStyles,
  createStyles,
  Theme,
  useTheme,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import { ThemeChanger } from './ThemeChanger';

interface Props {
  drawerOpen: boolean;
  toggleDrawerOpen(): void;
}

const useStyles = makeStyles(({ spacing, typography: { pxToRem }, zIndex }: Theme) =>
  createStyles({
    appBar: {
      zIndex: zIndex.drawer + 1,
    },
    title: {
      marginLeft: spacing(2),
      flexGrow: 1,
      fontSize: pxToRem(24),
    },
  }),
);

export const AppBar: FC<Props> = ({ drawerOpen, toggleDrawerOpen }) => {
  const theme = useTheme();

  const lightTheme = theme.palette.type === 'light';

  const classes = useStyles();

  return (
    <MuiAppBar position="fixed" className={classes.appBar} color={lightTheme ? 'primary' : 'inherit'}>
      <Toolbar>
        <Tooltip title={drawerOpen ? 'Hide drawer' : 'Show drawer'}>
          <IconButton edge="start" color="inherit" onClick={toggleDrawerOpen} aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Typography component="h1" variant="h6" className={classes.title}>
          Two Tab
        </Typography>
        <ThemeChanger />
      </Toolbar>
    </MuiAppBar>
  );
};
