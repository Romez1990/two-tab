import React, { FC, ReactNode } from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@material-ui/core';
import { TabCheckbox } from './TabCheckbox';
import { Tab } from '../../services/Tab';
import { useService } from '../../services/ServiceContainer';
import { TabElement, mapTab } from './TabElement';

interface Props {
  tabs: ReadonlyArray<Tab>;
}

export const TabList: FC<Props> = ({ tabs }) => {
  const tabElements = tabs.map(mapTab);

  const loggerService = useService('loggerService');

  loggerService.log('hello from popup');

  function submit(values: ReadonlyArray<TabElement>): void {
    loggerService.log(values);
  }

  return (
    <Formik<ReadonlyArray<TabElement>> initialValues={tabElements} onSubmit={submit}>
      {({ values }): ReactNode => (
        <Form>
          {values.map((tab, i) => (
            <TabCheckbox
              key={i}
              tab={tab}
              onChange={e => {
                loggerService.log(e);
              }}
            />
          ))}
          <Button variant="contained" color="primary">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};
