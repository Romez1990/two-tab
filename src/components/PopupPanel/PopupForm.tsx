import React, { FC, ReactNode } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { Button } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { filter, map, mapWithIndex, difference } from 'fp-ts/ReadonlyArray';
import { TabList } from './TabList';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { inRange } from '../../services/Utils/Math';
import { TabElement, toTabElement, toTab, eqTab } from './TabElement';

interface Props {
  readonly tabs: ReadonlyArray<Tab>;
  onSave(tabs: ReadonlyArray<Tab>): void;
}

interface Values {
  readonly tabs: ReadonlyArray<TabElement>;
}

export const PopupForm: FC<Props> = ({ tabs, onSave }) => {
  const loggerService = useService('loggerService');

  const initialValues = {
    tabs: pipe(tabs, map(toTabElement)),
  };

  loggerService.log('PopupForm render');

  function submit(values: Values, { setValues }: FormikHelpers<Values>): void {
    const checkedTabs = pipe(
      values.tabs,
      filter(tab => tab.checked),
    );
    setValues(oldValues => ({
      ...oldValues,
      tabs: removeCheckedTabs(oldValues.tabs, checkedTabs),
    }));
    onSave(pipe(checkedTabs, map(toTab)));
  }

  function removeCheckedTabs(
    oldTabs: ReadonlyArray<TabElement>,
    checkedTabs: ReadonlyArray<TabElement>,
  ): ReadonlyArray<TabElement> {
    return difference(eqTab)(oldTabs, checkedTabs);
  }

  return (
    <Formik<Values> initialValues={initialValues} onSubmit={submit}>
      {({ values, setValues, handleChange }): ReactNode => {
        function changeRange(start: number, end: number): void {
          setValues(oldValues => ({
            ...oldValues,
            tabs: pipe(
              oldValues.tabs,
              mapWithIndex((i, tab) => ({
                ...tab,
                checked: inRange(i, start, end),
              })),
            ),
          }));
        }

        return (
          <Form>
            <TabList name="tabs" tabs={values.tabs} onChange={handleChange} onChangeRange={changeRange} />
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};
