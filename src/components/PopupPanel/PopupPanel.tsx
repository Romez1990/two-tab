import React, { FC, useEffect, useState } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { map, Task } from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import { PopupForm } from './PopupForm';
import { BrowserTab } from '../../services/BrowserTab';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';

export const PopupPanel: FC = () => {
  const popupService = useService('popupService');

  useEffect(() => {
    run(getTabs());
  }, []);

  const [tabs, setTabs] = useState<ReadonlyArray<BrowserTab> | null>(null);

  const getTabs = (): Task<void> => pipe(popupService.getTabsInCurrentWindow(false), map(setTabs));

  const save = (listName: string, checkedTabs: ReadonlyArray<BrowserTab>): Task<void> =>
    popupService.saveTabs(listName, checkedTabs);

  const { appUrl } = popupService;

  return (
    <>
      <Button variant="contained" color="primary" href={appUrl} target="_blank">
        Open in full screen
      </Button>
      {tabs === null ? <CircularProgress /> : <PopupForm tabs={tabs} onSave={save} />}
    </>
  );
};
