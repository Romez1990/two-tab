import { createTheme } from '@mui/material/styles';

/** Тема Material Design: светлая и тёмная схемы, выбор — по теме системы. */
export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  palette: { primary: { main: '#3b5bdb' } },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
  },
});
