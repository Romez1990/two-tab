import React, { FC, useEffect, useState } from 'react';
import { Button, CircularProgress, Container, List } from '@material-ui/core';
import { TabList } from './TabList';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { run } from '../../services/Utis/fp-ts/Task';

export const PopupPanel: FC = () => {
  const extensionService = useService('extensionService');
  const tabService = useService('tabService');

  const appUrl = extensionService.getURL('index.html');

  const [tabs, setTabs] = useState<ReadonlyArray<Tab> | null>(null);

  useEffect(() => {
    getTabs().then();
  });

  async function getTabs(): Promise<void> {
    setTabs(await run(tabService.getTabsInCurrentWindow(false)));
  }

  return (
    <Container maxWidth="md" fixed>
      <Button variant="contained" color="primary" href={appUrl} target="_blank">
        Open in full screen
      </Button>
      <List>{tabs === null ? <CircularProgress /> : <TabList tabs={tabs} />}</List>
    </Container>
  );
};
