import React, { ChangeEvent, FC, useEffect } from 'react';
import { List } from '@material-ui/core';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';
import { BrowserTabElement } from './BrowserTabElement';

interface Props {
  readonly name: string;
  readonly tabs: ReadonlyNonEmptyArray<BrowserTabElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  onChangeRange(start: number, end: number): void;
  readonly disabled: boolean;
}

let lastCheckIndex: number;

export const TabList: FC<Props> = ({ name, tabs, onChange, onChangeRange, disabled }) => {
  const keyboard = useService('keyboardService');

  useEffect((): void => {
    lastCheckIndex = 0;
  }, []);

  const change = (currentCheckIndex: number) => (e: ChangeEvent<HTMLInputElement>): void => {
    const rangeKeyPressed = keyboard.isPressed.shift;
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
        <TabItem key={tab.id} name={`${name}.${i}`} tab={tab} onChange={change(i)} disabled={disabled} />
      ))}
    </List>
  );
};
