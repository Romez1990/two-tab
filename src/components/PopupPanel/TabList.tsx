import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { Checkbox, List } from '@material-ui/core';
import { Predicate, not } from 'fp-ts/function';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
import { useService } from '../ServiceContainer';
import { TabItem } from './TabItem';
import { BrowserTabElement, checkedLens } from './BrowserTabElement';
import { AllChecked } from './AllChecked';

interface Props {
  readonly name: string;
  readonly tabs: ReadonlyNonEmptyArray<BrowserTabElement>;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  onRangeChange(start: number, end: number): void;
  onAllChange(checked: boolean): void;
  readonly disabled: boolean;
}

let lastCheckIndex: number;

export const TabList: FC<Props> = ({ name, tabs, onChange, onRangeChange, onAllChange, disabled }) => {
  const keyboard = useService('keyboardService');

  useEffect((): void => {
    lastCheckIndex = 0;
  }, []);

  const [allChecked, setAllChecked] = useState(AllChecked.None);

  function changeAll(e: ChangeEvent<HTMLInputElement>): void {
    const value = e.target.checked ? AllChecked.All : AllChecked.None;
    setAllChecked(value);
    onAllChange(value === AllChecked.All);
  }

  const change = (currentCheckIndex: number) => (e: ChangeEvent<HTMLInputElement>): void => {
    const { checked } = e.target;

    const rangeKeyPressed = keyboard.isPressed('shift');
    if (rangeKeyPressed) {
      changeRange(currentCheckIndex);
      return;
    }

    updateAllChecked(checked);

    if (checked && !rangeKeyPressed) {
      lastCheckIndex = currentCheckIndex;
    }
    onChange(e);
  };

  function changeRange(currentCheckIndex: number): void {
    const rangeStart = Math.min(currentCheckIndex, lastCheckIndex);
    const rangeEnd = Math.max(currentCheckIndex, lastCheckIndex);
    onRangeChange(rangeStart, rangeEnd);
  }

  function updateAllChecked(currentChecked: boolean): void {
    if ((allChecked === AllChecked.All && !currentChecked) || (allChecked === AllChecked.None && currentChecked)) {
      setAllChecked(AllChecked.Some);
    } else if (allChecked === AllChecked.Some) {
      if (currentChecked && everyTabButCurrent(checkedLens.get)) {
        setAllChecked(AllChecked.All);
      } else if (!currentChecked && everyTabButCurrent(not(checkedLens.get))) {
        setAllChecked(AllChecked.None);
      }
    }
  }

  const everyTabButCurrent = (predicate: Predicate<BrowserTabElement>): boolean =>
    tabs.filter(predicate).length === tabs.length - 1;

  return (
    <List>
      <Checkbox
        checked={allChecked > AllChecked.None}
        indeterminate={allChecked === AllChecked.Some}
        onChange={changeAll}
      />
      Check all
      {tabs.map((tab, i) => (
        <TabItem key={tab.id} name={`${name}.${i}`} tab={tab} onChange={change(i)} disabled={disabled} />
      ))}
    </List>
  );
};
