import React, { FC, useEffect, useState } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { PopupForm } from './PopupForm';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { run } from '../../services/Utils/fp-ts/Task';

export const PopupPanel: FC = () => {
  const extensionService = useService('extensionService');
  const tabService = useService('tabService');

  const appUrl = extensionService.getURL('index.html');

  const [tabs, setTabs] = useState<ReadonlyArray<Tab> | null>(null);

  useEffect(() => {
    getTabs();
  }, []);

  async function getTabs(): Promise<void> {
    setTabs(await run(tabService.getTabsInCurrentWindow(false)));
  }

  async function save(checkedTabs: ReadonlyArray<Tab>): Promise<void> {
    await run(tabService.close(checkedTabs));
  }

  return (
    <>
      <Button variant="contained" color="primary" href={appUrl} target="_blank">
        Open in full screen
      </Button>
      {tabs === null ? <CircularProgress /> : <PopupForm tabs={tabs} onSave={save} />}
    </>
  );
};
