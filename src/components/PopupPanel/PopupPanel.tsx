import React, { FC, useEffect, useState } from 'react';
import { Button, CircularProgress, Container, List } from '@material-ui/core';
import { TabList } from './TabList';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { run } from '../../services/Utis/fp-ts/Task';
import { MessageServiceImpl, ChromeMessageSender } from '../../services/MessageService';

export const PopupPanel: FC = () => {
  const extensionService = useService('extensionService');
  const tabService = useService('tabService');
  const loggerService = useService('loggerService');

  const appUrl = extensionService.getURL('index.html');

  const [tabs, setTabs] = useState<ReadonlyArray<Tab> | null>(null);

  const [number, setNumber] = useState(4);

  useEffect(() => {
    // setNumber(5);
    // getTabs().then();
    // const messageSender = new ChromeMessageSender();
    // const messageService = new MessageServiceImpl(messageSender);
    // messageService.sendMessage({ type: 'test', data: { greeting: 'hello' } });
  });

  loggerService.log(`number ${number}`);

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
