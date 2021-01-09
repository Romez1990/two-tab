import React, { FC, useEffect, useState } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { PopupForm } from './PopupForm';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { run } from '../../services/Utils/fp-ts/Task';

export const PopupPanel: FC = () => {
  const popupService = useService('popupService');

  const [tabs, setTabs] = useState<ReadonlyArray<Tab> | null>(null);

  useEffect(() => {
    getTabs();
  }, []);

  const getTabs = async (): Promise<void> => setTabs(await run(popupService.getTabsInCurrentWindow(false)));

  const save = async (checkedTabs: ReadonlyArray<Tab>): Promise<void> => run(popupService.saveTabs(checkedTabs));

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
