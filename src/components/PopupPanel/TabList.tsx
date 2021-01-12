import React, { ChangeEvent, FC, useEffect } from 'react';
import { List } from '@material-ui/core';
import { Key } from '../../services/KeyPressingService';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';
import { BrowserTabElement } from './BrowserTabElement';

interface Props {
  readonly name: string;
  readonly tabs: ReadonlyArray<BrowserTabElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  onChangeRange(start: number, end: number): void;
  readonly disabled: boolean;
}

let lastCheckIndex: number;

export const TabList: FC<Props> = ({ name, tabs, onChange, onChangeRange, disabled }) => {
  const keyPressing = useService('keyPressingService');

  useEffect((): void => {
    lastCheckIndex = 0;
  }, []);

  const rangeKey: Key = 'shift';

  const change = (currentCheckIndex: number) => (e: ChangeEvent<HTMLInputElement>): void => {
    const rangeKeyPressed = keyPressing.isPressed[rangeKey];
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
        <TabItem key={i} name={`${name}.${i}`} tab={tab} onChange={change(i)} disabled={disabled} />
      ))}
    </List>
  );
};
