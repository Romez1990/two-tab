import { createTheme } from '@mui/material/styles';

/** Material Design theme: light and dark schemes, chosen by the system theme. */
export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  palette: { primary: { main: '#3b5bdb' } },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
  },
});
