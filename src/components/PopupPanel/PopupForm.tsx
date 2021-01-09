import React, { FC, ReactNode } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { Button } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { filter, map, mapWithIndex, difference } from 'fp-ts/ReadonlyArray';
import { Lens } from 'monocle-ts';
import { TabList } from './TabList';
import { useService } from '../../services/ServiceContainer';
import { Tab } from '../../services/Tab';
import { inRange } from '../../services/Utils/Math';
import { TabElement, toTabElement, toTab, eqTab, checkedLens } from './TabElement';

interface Props {
  readonly tabs: ReadonlyArray<Tab>;
  onSave(tabs: ReadonlyArray<Tab>): void;
}

interface Values {
  readonly tabs: ReadonlyArray<TabElement>;
}

const tabsLens = Lens.fromProp<Values>()('tabs');

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
    setValues(tabsLens.modify(oldTabs => removeCheckedTabs(oldTabs, checkedTabs)));
    onSave(pipe(checkedTabs, map(toTab)));
  }

  const removeCheckedTabs = (
    oldTabs: ReadonlyArray<TabElement>,
    checkedTabs: ReadonlyArray<TabElement>,
  ): ReadonlyArray<TabElement> => difference(eqTab)(oldTabs, checkedTabs);

  return (
    <Formik<Values> initialValues={initialValues} onSubmit={submit}>
      {({ values, setValues, handleChange }): ReactNode => {
        const changeRange = (start: number, end: number): void =>
          setValues(
            tabsLens.modify(oldTabs =>
              pipe(
                oldTabs,
                mapWithIndex((i, tab) => checkedLens.modify(checked => checked || inRange(i, start, end))(tab)),
              ),
            ),
          );

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
