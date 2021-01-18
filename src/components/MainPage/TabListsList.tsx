import React, { FC } from 'react';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabListItem } from './TabListItem';
import { Tab, TabList } from '../../services/TabList';

interface Props {
  readonly tabLists: ReadonlyNonEmptyArray<TabList>;
  onTabListOpen(tabList: TabList): Task<void>;
  onTabListOpenInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  onTabListRemove(tabList: TabList): Task<void>;
  onTabOpen(tabList: TabList, tab: Tab, shouldBeRemoved: boolean): Task<void>;
}

export const TabListsList: FC<Props> = ({
  tabLists,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListRemove,
  onTabOpen,
}) => {
  const openTabList = (tabList: TabList) => (): Task<void> => onTabListOpen(tabList);

  const openTabListInNewWindow = (tabList: TabList) => (focused: boolean): Task<void> =>
    onTabListOpenInNewWindow(tabList, focused);

  const removeTabList = (tabList: TabList) => (): Task<void> => onTabListRemove(tabList);

  const openTab = (tabList: TabList) => (tab: Tab, shouldBeRemoved: boolean): Task<void> =>
    onTabOpen(tabList, tab, shouldBeRemoved);

  return (
    <>
      {tabLists.map(tabList => (
        <TabListItem
          key={tabList.id}
          tabList={tabList}
          onTabListOpen={openTabList(tabList)}
          onTabListOpenInNewWindow={openTabListInNewWindow(tabList)}
          onTabListRemove={removeTabList(tabList)}
          onTabOpen={openTab(tabList)}
        />
      ))}
    </>
  );
};
