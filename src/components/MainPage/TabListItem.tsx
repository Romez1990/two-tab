import React, { FC } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
  List,
  Typography,
  Button,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { pipe } from 'fp-ts/function';
import { Tab, TabList } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';
import { run } from '../../services/Utils/fp-ts/Task';

interface Props {
  readonly tabList: TabList;
}

export const TabListItem: FC<Props> = ({ tabList }) => {
  const { name, date, tabs } = tabList;

  const browserTabService = useService('browserTabService');
  const keyboard = useService('keyboardService');
  const datetimeService = useService('datetimeService');

  const tabsCount = getTabCount();
  const datetime = datetimeService.toLocaleString(date);

  function getTabCount() {
    const tabCount = tabs.length;
    const tabWord = tabCount === 1 ? 'tab' : 'tabs';
    return `${tabCount} ${tabWord}`;
  }

  const removeTab = (tab: Tab) => (): void => {
    //
  };

  const removeTabList = (): void => {
    //
  };

  const openTabList = (): Promise<void> => pipe(browserTabService.openTabList(tabList), run);

  const openTabListInNewWindow = (): Promise<void> =>
    pipe(
      browserTabService.openTabListInNewWindow(
        tabList,
        keyboard.isPressed.control && keyboard.isPressed.shift ? true : !keyboard.isPressed.control,
      ),
      run,
    );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="h2" variant="h6">
          {name} ({tabsCount}) [{datetime}]
        </Typography>
      </AccordionSummary>
      <AccordionActions>
        <Button type="button" onClick={openTabList}>
          Open list
        </Button>
        <Button type="button" onClick={openTabListInNewWindow}>
          Open list in new window
        </Button>
        <Button type="button" onClick={removeTabList}>
          Remove list
        </Button>
      </AccordionActions>
      <AccordionDetails>
        <List>
          {tabs.map(tab => (
            <TabItem key={tab.id} tab={tab} onOpen={removeTab(tab)} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
