import React, { FC, ReactNode } from 'react';
import { Formik, Form } from 'formik';
import { List, Button } from '@material-ui/core';
import { pipe } from 'fp-ts/lib/pipeable';
import { map, filter } from 'fp-ts/lib/ReadonlyArray';
import { TabItem } from './TabItem';
import { Tab } from '../../services/Tab';
import { TabElement } from './TabElement';

interface Props {
  tabs: ReadonlyArray<Tab>;
  onSave(checkedTabs: ReadonlyArray<Tab>): void;
}

export const TabList: FC<Props> = ({ tabs, onSave }) => {
  const tabElements = pipe(
    tabs,
    map(tab => new TabElement(tab)),
  );

  function submit(values: ReadonlyArray<TabElement>): void {
    pipe(
      values,
      filter(tab => tab.checked),
      map(tabElement => tabElement.toTab()),
      onSave,
    );
  }

  return (
    <Formik<ReadonlyArray<TabElement>> initialValues={tabElements} onSubmit={submit}>
      {({ values, handleChange }): ReactNode => (
        <Form>
          <List>
            {values.map((tab, i) => (
              <TabItem key={i} name={i} tab={tab} onChange={handleChange} />
            ))}
          </List>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};
