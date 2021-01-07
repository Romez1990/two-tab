import React, { FC, useEffect, useState } from 'react';
import { Button, Container, List } from '@material-ui/core';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { run } from '../../services/Utis/fp-ts/Task';
import { TabCheckbox } from './TabCheckbox';

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
      <List>{tabs === null ? 'Spinner' : tabs.map((tab, i) => <TabCheckbox key={i} tab={tab} />)}</List>
    </Container>
  );
};
