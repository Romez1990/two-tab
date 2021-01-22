import React, { FC, useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Option, some, none } from 'fp-ts/Option';
import { Task, map } from 'fp-ts/Task';
import { PopupForm } from './PopupForm';
import { BrowserTab } from '../../services/Browser/BrowserTab';
import { useService } from '../Providers/ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';

export const PopupView: FC = () => {
  const popupService = useService('popupService');

  useEffect(() => {
    run(getTabs());
  }, []);

  const openApp = (): Promise<void> =>
    pipe(
      popupService.openApp(),
      run,
      //
    );

  const [tabs, setTabs] = useState<Option<ReadonlyArray<BrowserTab>>>(none);

  const getTabs = (): Task<void> =>
    pipe(
      popupService.getTabsInCurrentWindow(false),
      map(some),
      map(setTabs),
      //
    );

  const save = (listName: string, checkedTabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void> =>
    popupService.saveTabs(listName, checkedTabs);

  return (
    <>
      <Button variant="contained" color="primary" onClick={openApp}>
        Open in full screen
      </Button>
      <PopupForm tabs={tabs} onSave={save} />
    </>
  );
};
