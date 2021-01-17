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
import { Task } from 'fp-ts/Task';
import { TabList, Tab } from '../../services/TabList';
import { run } from '../../services/Utils/fp-ts/Task';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
  onTabListOpen(): Task<void>;
  onTabListOpenInNewWindow(focused: boolean): Task<void>;
  onTabListRemove(): Task<void>;
  onTabRemove(tab: Tab): Task<void>;
}

export const TabListItem: FC<Props> = ({
  tabList,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListRemove,
  onTabRemove,
}) => {
  const { name, date, tabs } = tabList;

  const keyboard = useService('keyboardService');
  const datetimeService = useService('datetimeService');

  const tabsCount = getTabCount();
  const datetime = datetimeService.toLocaleString(date);

  function getTabCount() {
    const tabCount = tabs.length;
    const tabWord = tabCount === 1 ? 'tab' : 'tabs';
    return `${tabCount} ${tabWord}`;
  }

  const openTabList = (): Promise<void> => run(onTabListOpen());

  const openTabListInNewWindow = (): Promise<void> =>
    run(
      onTabListOpenInNewWindow(
        keyboard.isPressed.control && keyboard.isPressed.shift ? true : !keyboard.isPressed.control,
      ),
    );

  const removeTabList = (): Promise<void> => run(onTabListRemove());

  const removeTab = (tab: Tab) => (): Promise<void> => run(onTabRemove(tab));

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
