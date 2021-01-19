import React, { FC, useEffect, useState } from 'react';
import { Container, CircularProgress } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { findIndex, updateAt, deleteAt, isNonEmpty } from 'fp-ts/ReadonlyArray';
import { Option, some, none, fold, getOrElseW, isNone } from 'fp-ts/Option';
import { Task, map, of } from 'fp-ts/Task';
import { MainLayout } from '../Layout';
import { TabListsList } from './TabListsList';
import { Tab, TabList, tabListsAreEquals } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';
import { TabListNotFoundInTabListsError, TabListsNotInitializedError } from './Errors';

export const MainPage: FC = () => {
  const mainPageService = useService('mainPageService');

  useEffect((): void => {
    run(getTabLists());
  }, []);

  const [tabLists, setTabLists] = useState<Option<ReadonlyArray<TabList>>>(none);

  const getTabLists = (): Task<void> => pipe(mainPageService.getTabLists(), map(some), map(setTabLists));

  const openTabList = (tabList: TabList): Task<void> =>
    pipe(
      mainPageService.openTabList(tabList),
      map(() => pipe(removeTabListFromTabLists(tabList), setTabListsState)),
    );

  const openTabListInNewWindow = (tabList: TabList, focused: boolean): Task<void> =>
    pipe(
      mainPageService.openTabListInNewWindow(tabList, focused),
      map(() => pipe(removeTabListFromTabLists(tabList), setTabListsState)),
    );

  const removeTabList = (tabList: TabList): Task<void> =>
    pipe(
      mainPageService.removeTabList(tabList),
      map(() => pipe(removeTabListFromTabLists(tabList), setTabListsState)),
    );

  const openTab = (tabList: TabList, tab: Tab, shouldBeRemoved: boolean): Task<void> =>
    shouldBeRemoved
      ? pipe(
          mainPageService.removeTab(tabList, tab),
          map(newTabListOption =>
            pipe(
              newTabListOption,
              fold(
                () => pipe(removeTabListFromTabLists(tabList), setTabListsState),
                newTabList => pipe(updateTabListsWithNewTabList(newTabList), setTabListsState),
              ),
            ),
          ),
        )
      : of(undefined);

  const updateTabListsWithNewTabList = (newTabList: TabList) => (
    oldTabLists: ReadonlyArray<TabList>,
  ): ReadonlyArray<TabList> =>
    pipe(
      oldTabLists,
      findIndex(tabListsAreEquals(newTabList)),
      fold(throwTabListNotFound(newTabList), index => updateAt(index, newTabList)(oldTabLists)),
      getOrElseW(throwTabListNotFound(newTabList)),
    );

  const removeTabListFromTabLists = (tabList: TabList) => (
    oldTabLists: ReadonlyArray<TabList>,
  ): ReadonlyArray<TabList> =>
    pipe(
      oldTabLists,
      findIndex(tabListsAreEquals(tabList)),
      fold(throwTabListNotFound(tabList), index => deleteAt(index)(oldTabLists)),
      getOrElseW(throwTabListNotFound(tabList)),
    );

  const throwTabListNotFound = (tabList: TabList) => (): never => new TabListNotFoundInTabListsError(tabList).throw();

  const setTabListsState = (updateTabLists: (oldTabLists: ReadonlyArray<TabList>) => ReadonlyArray<TabList>): void =>
    setTabLists(oldTabLists =>
      isNone(oldTabLists) ? new TabListsNotInitializedError().throw() : pipe(oldTabLists.value, updateTabLists, some),
    );

  return (
    <MainLayout>
      <Container>
        {isNone(tabLists) ? (
          <CircularProgress />
        ) : (
          <>
            {!isNonEmpty(tabLists.value) ? (
              'No tabs'
            ) : (
              <TabListsList
                tabLists={tabLists.value}
                onTabListOpen={openTabList}
                onTabListOpenInNewWindow={openTabListInNewWindow}
                onTabListRemove={removeTabList}
                onTabOpen={openTab}
              />
            )}
          </>
        )}
      </Container>
    </MainLayout>
  );
};
