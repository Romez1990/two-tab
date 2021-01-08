import React, { ChangeEvent, FC } from 'react';
import { List } from '@material-ui/core';
import { TabItem } from './TabItem';
import { TabElement } from './TabElement';

interface Props {
  readonly name: string;
  readonly tabs: ReadonlyArray<TabElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export const TabList: FC<Props> = ({ name, tabs, onChange }) => (
  <List>
    {tabs.map((tab, i) => (
      <TabItem key={i} name={`${name}.${i}`} tab={tab} onChange={onChange} />
    ))}
  </List>
);
