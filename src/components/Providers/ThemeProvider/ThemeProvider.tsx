import React, { FC } from 'react';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { darkTheme, lightTheme } from './theme';

export const ThemeProvider: FC = ({ children }) => {
  const darkMode = true;

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
