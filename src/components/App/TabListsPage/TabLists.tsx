import React, { FC } from 'react';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task } from 'fp-ts/Task';
import { TabListItem } from './TabList';
import { Tab, TabList } from '../../../services/Storage/TabList';

interface Props {
  readonly tabLists: ReadonlyNonEmptyArray<TabList>;
  onTabListOpen(tabList: TabList): Task<void>;
  onTabListOpenInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  onTabListDelete(tabList: TabList): Task<void>;
  onTabOpen(tabList: TabList, tab: Tab, shouldBeDeleted: boolean): Task<void>;
}

export const TabLists: FC<Props> = ({
  tabLists,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListDelete,
  onTabOpen,
}) => {
  const openTabList = (tabList: TabList) => (): Task<void> => onTabListOpen(tabList);

  const openTabListInNewWindow = (tabList: TabList) => (focused: boolean): Task<void> =>
    onTabListOpenInNewWindow(tabList, focused);

  const deleteTabList = (tabList: TabList) => (): Task<void> => onTabListDelete(tabList);

  const onTabOpened = (tabList: TabList) => (tab: Tab, shouldBeDeleted: boolean): Task<void> =>
    onTabOpen(tabList, tab, shouldBeDeleted);

  return (
    <>
      {tabLists.map(tabList => (
        <TabListItem
          key={tabList.id}
          tabList={tabList}
          onTabListOpen={openTabList(tabList)}
          onTabListOpenInNewWindow={openTabListInNewWindow(tabList)}
          onTabListDelete={deleteTabList(tabList)}
          onTabOpen={onTabOpened(tabList)}
        />
      ))}
    </>
  );
};
