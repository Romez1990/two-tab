import React, { FC, useEffect, useState } from 'react';
import { Container, CircularProgress } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { findIndex, unsafeInsertAt, updateAt, deleteAt, isNonEmpty } from 'fp-ts/ReadonlyArray';
import { Option, some, none, fold, getOrElseW, isNone } from 'fp-ts/Option';
import { Task, map, of } from 'fp-ts/Task';
import { TabLists } from './TabLists';
import { Tab, TabList, tabListsAreEquals } from '../../../services/Storage/TabList';
import { useService } from '../../Providers/ServiceContainer';
import { run } from '../../../services/Utils/fp-ts/Task';
import { TabListNotFoundInTabListsError, TabListsNotInitializedError } from './Errors';

export const TabListsPage: FC = () => {
  const mainPageService = useService('mainPageService');

  useEffect(() => {
    addUpdateHandlers();
    run(getTabLists());
    return (): void => {
      removeUpdateHandlers();
    };
  }, []);

  const addUpdateHandlers = (): void =>
    mainPageService.addUpdateHandlers({
      add: addTabListToTabLists,
      update: updateTabListsWithNewTabList,
      delete: deleteTabListFromTabLists,
    });

  const removeUpdateHandlers = (): void => mainPageService.removeUpdateHandlers();

  const [tabLists, setTabLists] = useState<Option<ReadonlyArray<TabList>>>(none);

  const getTabLists = (): Task<void> =>
    pipe(
      mainPageService.getTabLists(),
      map(some),
      map(setTabLists),
      //
    );

  const openTabList = (tabList: TabList): Task<void> =>
    pipe(
      mainPageService.openTabList(tabList),
      map(() => deleteTabListFromTabLists(tabList)),
    );

  const openTabListInNewWindow = (tabList: TabList, focused: boolean): Task<void> =>
    pipe(
      mainPageService.openTabListInNewWindow(tabList, focused),
      map(() => deleteTabListFromTabLists(tabList)),
    );

  const deleteTabList = (tabList: TabList): Task<void> =>
    pipe(
      mainPageService.deleteTabList(tabList),
      map(() => deleteTabListFromTabLists(tabList)),
    );

  const deleteTabIfShould = (tabList: TabList, tab: Tab, shouldBeDeleted: boolean): Task<void> =>
    shouldBeDeleted
      ? pipe(
          mainPageService.deleteTab(tabList, tab),
          map(fold(() => deleteTabListFromTabLists(tabList), updateTabListsWithNewTabList)),
        )
      : of(undefined);

  const addTabListToTabLists = (newTabList: TabList): void =>
    setTabListsState(oldTabLists => unsafeInsertAt(0, newTabList, oldTabLists));

  const updateTabListsWithNewTabList = (newTabList: TabList): void =>
    setTabListsState(oldTabLists =>
      pipe(
        oldTabLists,
        findIndex(tabListsAreEquals(newTabList)),
        fold(throwTabListNotFound(newTabList), index => updateAt(index, newTabList)(oldTabLists)),
        getOrElseW(throwTabListNotFound(newTabList)),
      ),
    );

  const deleteTabListFromTabLists = (tabList: TabList): void =>
    setTabListsState(oldTabLists =>
      pipe(
        oldTabLists,
        findIndex(tabListsAreEquals(tabList)),
        fold(throwTabListNotFound(tabList), index => deleteAt(index)(oldTabLists)),
        getOrElseW(throwTabListNotFound(tabList)),
      ),
    );

  const throwTabListNotFound = (tabList: TabList) => (): never => new TabListNotFoundInTabListsError(tabList).throw();

  const setTabListsState = (updateTabLists: (oldTabLists: ReadonlyArray<TabList>) => ReadonlyArray<TabList>): void =>
    setTabLists(oldTabLists =>
      isNone(oldTabLists)
        ? new TabListsNotInitializedError().throw()
        : pipe(
            oldTabLists.value,
            updateTabLists,
            some,
            //
          ),
    );

  return (
    <Container>
      {isNone(tabLists) ? (
        <CircularProgress />
      ) : (
        <>
          {!isNonEmpty(tabLists.value) ? (
            'No tabs'
          ) : (
            <TabLists
              tabLists={tabLists.value}
              onTabListOpen={openTabList}
              onTabListOpenInNewWindow={openTabListInNewWindow}
              onTabListDelete={deleteTabList}
              onTabOpen={deleteTabIfShould}
            />
          )}
        </>
      )}
    </Container>
  );
};
