import React, { FC } from 'react';
import {
  makeStyles,
  createStyles,
  Theme,
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
import { TabList, Tab } from '../../../services/Storage/TabList';
import { run } from '../../../services/Utils/fp-ts/Task';
import { useService } from '../../Providers/ServiceContainer';
import { TabItem } from './Tab';

interface Props {
  readonly tabList: TabList;
  onTabListOpen(): Task<void>;
  onTabListOpenInNewWindow(focused: boolean): Task<void>;
  onTabListDelete(): Task<void>;
  onTabOpen(tab: Tab, shouldBeDeleted: boolean): Task<void>;
}

const useStyles = makeStyles(({ palette: { primary }, spacing, typography: { pxToRem } }: Theme) =>
  createStyles({
    summary: {
      alignItems: 'center',
    },
    name: {
      marginRight: spacing(1),
      fontSize: pxToRem(16),
      fontWeight: 700,
    },
    tabsCount: {
      width: pxToRem(20),
      height: pxToRem(20),
      background: primary.main,
      borderRadius: '50%',
      fontSize: pxToRem(12),
      textAlign: 'center',
      lineHeight: pxToRem(20),
    },
    datetimeSeparator: {
      flexGrow: 1,
    },
    datetime: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    date: {
      fontSize: pxToRem(14),
    },
    time: {
      fontSize: pxToRem(9),
    },
    actions: {
      justifyContent: 'flex-start',
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

  const date = datetimeService.toLocaleDateString(createdAt);
  const time = datetimeService.toLocaleTimeString(createdAt);

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
      <AccordionSummary classes={{ content: classes.summary }} expandIcon={<ExpandMoreIcon />}>
        {name.length !== 0 && (
          <Typography className={classes.name} component="h2">
            {name}
          </Typography>
        )}
        <Typography className={classes.tabsCount}>{tabs.length}</Typography>
        <div className={classes.datetimeSeparator} />
        <div className={classes.datetime}>
          <Typography className={classes.date}>{date}</Typography>
          <Typography className={classes.time}>{time}</Typography>
        </div>
      </AccordionSummary>
      <AccordionActions classes={{ root: classes.actions }}>
        <Button type="button" variant="outlined" color="primary" onClick={openTabList}>
          Open
        </Button>
        <Button type="button" variant="outlined" color="primary" onClick={openTabListInNewWindow}>
          Open in new window
        </Button>
        <Button type="button" variant="outlined" color="primary" onClick={deleteTabList}>
          Delete
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
