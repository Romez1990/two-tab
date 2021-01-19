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
import { pipe } from 'fp-ts/function';
import { TabList, Tab } from '../../services/TabList';
import { run } from '../../services/Utils/fp-ts/Task';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
  onTabListOpen(): Task<void>;
  onTabListOpenInNewWindow(focused: boolean): Task<void>;
  onTabListRemove(): Task<void>;
  onTabOpen(tab: Tab, shouldBeRemoved: boolean): Task<void>;
}

export const TabListItem: FC<Props> = ({
  tabList,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListRemove,
  onTabOpen,
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

  const openTabList = (): Promise<void> =>
    pipe(
      onTabListOpen(),
      run,
      //
    );

  const openTabListInNewWindow = (): Promise<void> =>
    pipe(
      shouldWindowBeFocused(),
      onTabListOpenInNewWindow,
      run,
      //
    );

  function shouldWindowBeFocused(): boolean {
    const { control, shift } = keyboard.isPressed;
    if (control && shift) return true;
    if (control) return false;
    if (shift) return true;
    return true;
  }

  const removeTabList = (): Promise<void> =>
    pipe(
      onTabListRemove(),
      run,
      //
    );

  const openTab = (tab: Tab) => (shouldBeRemoved: boolean): Promise<void> =>
    pipe(
      onTabOpen(tab, shouldBeRemoved),
      run,
      //
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
            <TabItem key={tab.id} tab={tab} onOpen={openTab(tab)} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
