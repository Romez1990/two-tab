import React, { ChangeEvent, FC, useEffect } from 'react';
import { List } from '@material-ui/core';
import { TabItem } from './TabItem';
import { BrowserTabElement } from './BrowserTabElement';
import { useService } from '../../services/ServiceContainer';
import { Key, KeyState } from '../../services/KeyPressingService';

interface Props {
  readonly name: string;
  readonly tabs: ReadonlyArray<BrowserTabElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  onChangeRange(start: number, end: number): void;
}

let lastCheckIndex: number;

export const TabList: FC<Props> = ({ name, tabs, onChange, onChangeRange }) => {
  const keyPressingService = useService('keyPressingService');

  useEffect((): void => {
    lastCheckIndex = 0;
  }, []);

  const rangeKey: Key = 'shift';

  const change = (currentCheckIndex: number) => (e: ChangeEvent<HTMLInputElement>): void => {
    const rangeKeyPressed = keyPressingService.keyStates[rangeKey] === KeyState.Pressed;
    if (rangeKeyPressed) {
      const rangeStart = Math.min(currentCheckIndex, lastCheckIndex);
      const rangeEnd = Math.max(currentCheckIndex, lastCheckIndex);
      onChangeRange(rangeStart, rangeEnd);
    }

    if (e.target.checked && !rangeKeyPressed) {
      lastCheckIndex = currentCheckIndex;
    }
    onChange(e);
  };

  return (
    <List>
      {tabs.map((tab, i) => (
        <TabItem key={i} name={`${name}.${i}`} tab={tab} onChange={change(i)} />
      ))}
    </List>
  );
};
