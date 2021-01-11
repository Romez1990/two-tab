import React, { FC, ReactNode, Dispatch, SetStateAction } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { Button } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { object, string } from 'yup';
import { pipe } from 'fp-ts/function';
import { filter, map, mapWithIndex, difference } from 'fp-ts/ReadonlyArray';
import { Lens } from 'monocle-ts';
import { TabList } from './TabList';
import { BrowserTab } from '../../services/BrowserTab';
import { inRange } from '../../services/Utils/Math';
import { BrowserTabElement, toBrowserTabElement, toBrowserTab, eqBrowserTab, checkedLens } from './BrowserTabElement';

interface Props {
  readonly tabs: ReadonlyArray<BrowserTab>;
  onSave(listName: string, tabs: ReadonlyArray<BrowserTab>): void;
}

interface Values {
  readonly listName: string;
  readonly tabs: ReadonlyArray<BrowserTabElement>;
}

const validationSchema = object().shape({
  listName: string().required(),
});

const tabsLens = Lens.fromProp<Values>()('tabs');

export const PopupForm: FC<Props> = ({ tabs: initTabs, onSave }) => {
  const initialValues: Values = {
    listName: '',
    tabs: map(toBrowserTabElement)(initTabs),
  };

  function submit({ listName, tabs }: Values, { setValues }: FormikHelpers<Values>): void {
    const checkedTabs = pipe(
      tabs,
      filter(tab => tab.checked),
    );
    setValues(tabsLens.modify(oldTabs => removeCheckedTabs(oldTabs, checkedTabs)));
    const browserTabs = map(toBrowserTab)(checkedTabs);
    onSave(listName, browserTabs);
  }

  const removeCheckedTabs = (
    oldTabs: ReadonlyArray<BrowserTabElement>,
    checkedTabs: ReadonlyArray<BrowserTabElement>,
  ): ReadonlyArray<BrowserTabElement> => difference(eqBrowserTab)(oldTabs, checkedTabs);

  const changeRange = (setValues: Dispatch<SetStateAction<Values>>) => (start: number, end: number): void =>
    setValues(
      tabsLens.modify(mapWithIndex((i, tab) => checkedLens.modify(checked => checked || inRange(i, start, end))(tab))),
    );

  return (
    <Formik<Values> initialValues={initialValues} validationSchema={validationSchema} onSubmit={submit}>
      {({ values: { tabs }, setValues, handleChange }): ReactNode => (
        <Form>
          <TabList name="tabs" tabs={tabs} onChange={handleChange} onChangeRange={changeRange(setValues)} />
          <Field name="listName" component={TextField} placeholder="List name" />
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
