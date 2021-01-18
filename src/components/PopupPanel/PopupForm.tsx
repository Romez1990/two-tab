import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { Button } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { object, string } from 'yup';
import { pipe } from 'fp-ts/function';
import { map as mapR, mapWithIndex, filter, difference, isNonEmpty } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapN } from 'fp-ts/ReadonlyNonEmptyArray';
import { Task, map } from 'fp-ts/Task';
import { Lens } from 'monocle-ts';
import { TabList } from './TabList';
import { BrowserTab } from '../../services/BrowserTab';
import { inRange } from '../../services/Utils/Math';
import { run } from '../../services/Utils/fp-ts/Task';
import { BrowserTabElement, toBrowserTabElement, toBrowserTab, eqBrowserTab, checkedLens } from './BrowserTabElement';

interface Props {
  readonly tabs: ReadonlyArray<BrowserTab>;
  onSave(listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}

interface Values {
  readonly listName: string;
  readonly tabs: ReadonlyArray<BrowserTabElement>;
}

interface FormErrors {
  readonly tabs?: string;
}

const tabsErrorsLens = Lens.fromProp<FormErrors>()('tabs');

const validationSchema = object().shape({
  listName: string().required(),
});

const tabsLens = Lens.fromProp<Values>()('tabs');

export const PopupForm: FC<Props> = ({ tabs: initTabs, onSave }) => {
  const initialValues: Values = {
    listName: '',
    tabs: mapR(toBrowserTabElement)(initTabs),
  };

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function validate({ tabs }: Values): void {
    const areAnyTabsChecked = tabs.some(tab => tab.checked);
    const tabsErrorMessage = areAnyTabsChecked ? undefined : 'No tabs checked';
    setFormErrors(tabsErrorsLens.set(tabsErrorMessage));
  }

  function submit({ listName, tabs }: Values, { resetForm, setSubmitting }: FormikHelpers<Values>): Promise<void> {
    const checkedTabs = filterCheckedTabs(tabs);
    const newTabs = removeCheckedTabs(tabs, checkedTabs);
    return pipe(
      checkedTabs,
      mapN(toBrowserTab),
      browserTabs => onSave(listName, browserTabs),
      map(() => {
        resetForm({
          values: {
            ...initialValues,
            tabs: newTabs,
          },
        });
        setSubmitting(false);
      }),
      run,
    );
  }

  function filterCheckedTabs(tabs: ReadonlyArray<BrowserTabElement>): ReadonlyNonEmptyArray<BrowserTabElement> {
    const checkedTabs = pipe(tabs, filter(checkedLens.get));
    if (!isNonEmpty(checkedTabs)) throw new Error();
    return checkedTabs;
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
    <Formik<Values>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={validate}
      onSubmit={submit}
    >
      {({ values: { tabs }, setValues, handleChange, isSubmitting }) => (
        <Form>
          {!isNonEmpty(tabs) ? (
            'No tabs to save. Try to remove filtering'
          ) : (
            <TabList
              name="tabs"
              tabs={tabs}
              onChange={handleChange}
              onChangeRange={changeRange(setValues)}
              disabled={isSubmitting}
            />
          )}
          {typeof formErrors.tabs !== 'undefined' && <div>{formErrors.tabs}</div>}
          <Field name="listName" component={TextField} placeholder="List name" disabled={isSubmitting} />
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
