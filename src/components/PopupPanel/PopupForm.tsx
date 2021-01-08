import React, { FC, ReactNode } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { pipe } from 'fp-ts/pipeable';
import { filter, map } from 'fp-ts/ReadonlyArray';
import { Button } from '@material-ui/core';
import { TabElement } from './TabElement';
import { Tab } from '../../services/Tab';
import { TabList } from './TabList';

interface Props {
  readonly tabs: ReadonlyArray<Tab>;
  onSave(tabs: ReadonlyArray<Tab>): void;
}

interface Values {
  readonly tabs: ReadonlyArray<TabElement>;
}

export const PopupForm: FC<Props> = ({ tabs, onSave }) => {
  const tabElements = pipe(
    tabs,
    map(tab => new TabElement(tab)),
  );

  const initialValues = {
    tabs: tabElements,
  };

  function submit(values: Values, { setValues }: FormikHelpers<Values>): void {
    const checkedTabs = pipe(
      values.tabs,
      filter(tab => tab.checked),
    );
    setValues(oldValues => ({
      ...oldValues,
      tabs: removeCheckedTabs(oldValues.tabs, checkedTabs),
    }));
    onSave(
      pipe(
        checkedTabs,
        map(tabElement => tabElement.toTab()),
      ),
    );
  }

  function removeCheckedTabs(
    oldTabs: ReadonlyArray<TabElement>,
    checkedTabs: ReadonlyArray<TabElement>,
  ): ReadonlyArray<TabElement> {
    const checkedTabIds = pipe(
      checkedTabs,
      map(tab => tab.id),
    );
    return pipe(
      oldTabs,
      filter(tab => !checkedTabIds.includes(tab.id)),
    );
  }

  return (
    <Formik<Values> initialValues={initialValues} onSubmit={submit}>
      {({ values, handleChange }): ReactNode => (
        <Form>
          <TabList name="tabs" tabs={values.tabs} onChange={handleChange} />
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
