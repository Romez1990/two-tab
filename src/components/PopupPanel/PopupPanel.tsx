import React, { FC, useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Option, some, none } from 'fp-ts/Option';
import { Task, map } from 'fp-ts/Task';
import { PopupForm } from './PopupForm';
import { BrowserTab } from '../../services/BrowserTab';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';

export const PopupPanel: FC = () => {
  const popupService = useService('popupService');

  useEffect(() => {
    run(getTabs());
  }, []);

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

  const { appUrl } = popupService;

  return (
    <>
      <Button variant="contained" color="primary" href={appUrl} target="_blank" rel="noreferrer">
        Open in full screen
      </Button>
      <PopupForm tabs={tabs} onSave={save} />
    </>
  );
};
