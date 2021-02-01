import React, { FC } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
  List,
  Typography,
  Button,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { Task } from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import { TabList, Tab } from '../../../services/Storage/TabList';
import { run } from '../../../services/Utils/fp-ts/Task';
import { useService } from '../../Providers/ServiceContainer';
import { TabItem } from './TabItem';

interface Props {
  readonly tabList: TabList;
  onTabListOpen(): Task<void>;
  onTabListOpenInNewWindow(focused: boolean): Task<void>;
  onTabListDelete(): Task<void>;
  onTabOpen(tab: Tab, shouldBeDeleted: boolean): Task<void>;
}

const useStyles = makeStyles(() =>
  createStyles({
    deleteButton: {
      color: 'red',
    },
  }),
);

export const TabListItem: FC<Props> = ({
  tabList,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListDelete,
  onTabOpen,
}) => {
  const { name, createdAt, tabs } = tabList;

  const keyboard = useService('keyboardService');
  const datetimeService = useService('datetimeService');

  const tabsCount = getTabCount();
  const datetime = datetimeService.toLocaleDatetimeString(createdAt);

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
    const control = keyboard.isPressed('control');
    const shift = keyboard.isPressed('shift');
    if (control && shift) return true;
    if (control) return false;
    if (shift) return true;
    return true;
  }

  const deleteTabList = (): Promise<void> =>
    pipe(
      onTabListDelete(),
      run,
      //
    );

  const onTabOpened = (tab: Tab) => (shouldBeDeleted: boolean): Promise<void> =>
    pipe(
      onTabOpen(tab, shouldBeDeleted),
      run,
      //
    );

  const classes = useStyles();

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
        <Button type="button" onClick={deleteTabList} className={classes.deleteButton}>
          Delete list
        </Button>
      </AccordionActions>
      <AccordionDetails>
        <List>
          {tabs.map(tab => (
            <TabItem key={tab.id} tab={tab} onOpen={onTabOpened(tab)} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
