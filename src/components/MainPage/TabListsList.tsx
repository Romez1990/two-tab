import React, { FC } from 'react';
import { TabList } from '../../services/TabList';
import { TabListItem } from './TabListItem';

interface Props {
  readonly tabLists: ReadonlyArray<TabList>;
}

export const TabListsList: FC<Props> = ({ tabLists }) => (
  <>
    {tabLists.map((tabList, i) => (
      <TabListItem key={i} tabList={tabList} />
    ))}
  </>
);
