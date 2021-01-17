import React, { FC } from 'react';
import { Task } from 'fp-ts/Task';
import { TabListItem } from './TabListItem';
import { Tab, TabList } from '../../services/TabList';

interface Props {
  readonly tabLists: ReadonlyArray<TabList>;
  onTabListOpen(tabList: TabList): Task<void>;
  onTabListOpenInNewWindow(tabList: TabList, focused: boolean): Task<void>;
  onTabListRemove(tabList: TabList): Task<void>;
  onTabRemove(tabList: TabList, tab: Tab): Task<void>;
}

export const TabListsList: FC<Props> = ({
  tabLists,
  onTabListOpen,
  onTabListOpenInNewWindow,
  onTabListRemove,
  onTabRemove,
}) => {
  const openTabList = (tabList: TabList) => (): Task<void> => onTabListOpen(tabList);

  const openTabListInNewWindow = (tabList: TabList) => (focused: boolean): Task<void> =>
    onTabListOpenInNewWindow(tabList, focused);

  const removeTabList = (tabList: TabList) => (): Task<void> => onTabListRemove(tabList);

  const removeTab = (tabList: TabList) => (tab: Tab): Task<void> => onTabRemove(tabList, tab);

  return (
    <>
      {tabLists.map(tabList => (
        <TabListItem
          key={tabList.id}
          tabList={tabList}
          onTabListOpen={openTabList(tabList)}
          onTabListOpenInNewWindow={openTabListInNewWindow(tabList)}
          onTabListRemove={removeTabList(tabList)}
          onTabRemove={removeTab(tabList)}
        />
      ))}
    </>
  );
};
