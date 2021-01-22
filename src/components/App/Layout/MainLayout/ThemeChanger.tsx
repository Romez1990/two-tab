import React, { FC } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@material-ui/icons';
// import { useProfileStore } from '../Store';

export const ThemeChanger: FC = () => {
  // const profileStore = useProfileStore();
  const profileStore = {
    darkMode: true,
  };

  function changeTheme(): void {
    // await profileStore.saveDarkTheme(!profileStore.darkMode)();
  }

  return (
    <Tooltip title={profileStore.darkMode ? 'Dark mode' : 'Light mode'}>
      <IconButton color="inherit" onClick={changeTheme}>
        {profileStore.darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};
