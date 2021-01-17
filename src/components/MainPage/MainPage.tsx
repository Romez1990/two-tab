import React, { FC, useEffect, useState } from 'react';
import { Container, CircularProgress } from '@material-ui/core';
import { pipe, constVoid } from 'fp-ts/function';
import { updateAt, findIndex, isEmpty } from 'fp-ts/ReadonlyArray';
import { fold, getOrElseW } from 'fp-ts/Option';
import { Task, map } from 'fp-ts/Task';
import { MainLayout } from '../Layout';
import { TabListsList } from './TabListsList';
import { Tab, TabList } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';
import { TabListNotFoundInTabListsError } from './Errors';

export const MainPage: FC = () => {
  const mainPageService = useService('mainPageService');

  useEffect((): void => {
    run(getTabLists());
  }, []);

  const [tabLists, setTabLists] = useState<ReadonlyArray<TabList> | null>(null);

  const getTabLists = (): Task<void> => pipe(mainPageService.getTabLists(), map(setTabLists));

  const openTabList = (tabList: TabList): Task<void> => mainPageService.openTabList(tabList);

  const openTabListInNewWindow = (tabList: TabList, focused: boolean): Task<void> =>
    mainPageService.openTabListInNewWindow(tabList, focused);

  const removeTabList = (tabList: TabList): Task<void> => mainPageService.removeTabList(tabList);

  const removeTab = (tabList: TabList, tab: Tab): Task<void> =>
    pipe(
      mainPageService.removeTab(tabList, tab),
      map(newTabList => setTabLists(updateTabLists(newTabList))),
      map(constVoid),
    );

  const updateTabLists = (newTabList: TabList) => (oldTabLists: ReadonlyArray<TabList>): ReadonlyArray<TabList> =>
    pipe(
      oldTabLists,
      findIndex(currentTabList => currentTabList.id === newTabList.id),
      fold(throwTabListNotFound(newTabList), index => updateAt(index, newTabList)(oldTabLists)),
      getOrElseW(throwTabListNotFound(newTabList)),
    );

  const throwTabListNotFound = (tabList: TabList) => (): never => new TabListNotFoundInTabListsError(tabList).throw();

  return (
    <MainLayout>
      <Container>
        {/* eslint-disable-next-line no-nested-ternary */}
        {tabLists === null ? (
          <CircularProgress />
        ) : isEmpty(tabLists) ? (
          'No tabs'
        ) : (
          <TabListsList
            tabLists={tabLists}
            onTabListOpen={openTabList}
            onTabListOpenInNewWindow={openTabListInNewWindow}
            onTabListRemove={removeTabList}
            onTabRemove={removeTab}
          />
        )}
      </Container>
    </MainLayout>
  );
};
