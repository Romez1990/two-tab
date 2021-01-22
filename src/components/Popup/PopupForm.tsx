import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { CircularProgress, Button } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { object, string } from 'yup';
import { pipe, constUndefined } from 'fp-ts/function';
import { map as mapR, mapWithIndex, filter, difference, isNonEmpty, some as someR } from 'fp-ts/ReadonlyArray';
import { ReadonlyNonEmptyArray, map as mapN } from 'fp-ts/ReadonlyNonEmptyArray';
import { Option, some, map as mapO, fold, getOrElseW, isNone } from 'fp-ts/Option';
import { Task, map } from 'fp-ts/Task';
import { Lens, Optional } from 'monocle-ts';
import { TabList } from './TabList';
import { BrowserTab } from '../../services/Browser/BrowserTab';
import { inRange } from '../../services/Utils/Math';
import { run } from '../../services/Utils/fp-ts/Task';
import { TabsNotInitializedError } from './Errors';
import {
  BrowserTabElement,
  toBrowserTabElement,
  toBrowserTab,
  eqBrowserTab,
  checkedLens,
  tabsTraversal,
} from './BrowserTabElement';

interface Props {
  readonly tabs: Option<ReadonlyArray<BrowserTab>>;
  onSave(listName: string, tabs: ReadonlyNonEmptyArray<BrowserTab>): Task<void>;
}

interface Values {
  readonly listName: string;
  readonly tabs: Option<ReadonlyArray<BrowserTabElement>>;
}

interface FormErrors {
  readonly tabs?: string;
}

const tabsErrorsLens = Lens.fromProp<FormErrors>()('tabs');

const validationSchema = object().shape({
  listName: string().required(),
});

const tabsLens = Optional.fromOptionProp<Values>()('tabs');
const tabsCheckedTraversal = tabsLens.composeTraversal(tabsTraversal).composeLens(checkedLens);

export const PopupForm: FC<Props> = ({ tabs: initTabs, onSave }) => {
  const initialValues: Values = {
    listName: '',
    tabs: pipe(
      initTabs,
      mapO(mapR(toBrowserTabElement)),
      //
    ),
  };

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validate = ({ tabs }: Values): void =>
    pipe(
      tabs,
      mapO(someR(checkedLens.get)),
      fold(constUndefined, someTabsAreChecked => (someTabsAreChecked ? undefined : 'No tabs checked')),
      tabsErrorsLens.set,
      setFormErrors,
    );

  const submit = (
    { listName, tabs: tabsOption }: Values,
    { resetForm, setSubmitting }: FormikHelpers<Values>,
  ): Promise<void> =>
    pipe(
      tabsOption,
      getOrElseW(() => new TabsNotInitializedError().throw()),
      tabs => {
        const checkedTabs = filterCheckedTabs(tabs);
        const newTabs = deleteCheckedTabs(tabs, checkedTabs);
        return pipe(
          checkedTabs,
          mapN(toBrowserTab),
          browserTabs => onSave(listName, browserTabs),
          map(() => {
            resetForm({
              values: {
                ...initialValues,
                tabs: some(newTabs),
              },
            });
            setSubmitting(false);
          }),
          run,
        );
      },
    );

  function filterCheckedTabs(tabs: ReadonlyArray<BrowserTabElement>): ReadonlyNonEmptyArray<BrowserTabElement> {
    const checkedTabs = pipe(
      tabs,
      filter(checkedLens.get),
      //
    );
    if (!isNonEmpty(checkedTabs)) throw new Error();
    return checkedTabs;
  }

  const deleteCheckedTabs = (
    oldTabs: ReadonlyArray<BrowserTabElement>,
    checkedTabs: ReadonlyArray<BrowserTabElement>,
  ): ReadonlyArray<BrowserTabElement> => difference(eqBrowserTab)(oldTabs, checkedTabs);

  const changeRange = (setValues: Dispatch<SetStateAction<Values>>) => (start: number, end: number): void =>
    setValues(
      tabsLens.modify(mapWithIndex((i, tab) => checkedLens.modify(checked => checked || inRange(i, start, end))(tab))),
    );

  const changeAll = (setValues: Dispatch<SetStateAction<Values>>) => (checked: boolean): void =>
    pipe(
      checked,
      tabsCheckedTraversal.set.bind(tabsCheckedTraversal),
      setValues,
      //
    );

  return (
    <Formik<Values>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={validate}
      onSubmit={submit}
      enableReinitialize
    >
      {({ values: { tabs }, setValues, handleChange, isSubmitting }) => (
        <Form>
          {isNone(tabs) ? (
            <CircularProgress />
          ) : (
            <>
              {!isNonEmpty(tabs.value) ? (
                'No tabs to save. Try to remove filtering'
              ) : (
                <TabList
                  name="tabs.value"
                  tabs={tabs.value}
                  onChange={handleChange}
                  onRangeChange={changeRange(setValues)}
                  onAllChange={changeAll(setValues)}
                  disabled={isSubmitting}
                />
              )}
            </>
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
