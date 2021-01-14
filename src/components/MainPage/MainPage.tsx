import React, { FC, useEffect, useState } from 'react';
import { Container, CircularProgress } from '@material-ui/core';
import { pipe } from 'fp-ts/function';
import { isEmpty } from 'fp-ts/ReadonlyArray';
import { map, Task } from 'fp-ts/Task';
import { MainLayout } from '../Layout';
import { TabListsList } from './TabListsList';
import { TabList } from '../../services/TabList';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';

export const MainPage: FC = () => {
  const mainPageService = useService('mainPageService');

  useEffect((): void => {
    run(getTabLists());
  }, []);

  const [tabLists, setTabLists] = useState<ReadonlyArray<TabList> | null>(null);

  const getTabLists = (): Task<void> => pipe(mainPageService.getTabLists(), map(setTabLists));

  return (
    <MainLayout>
      <Container>
        {/* eslint-disable-next-line no-nested-ternary */}
        {tabLists === null ? (
          <CircularProgress />
        ) : isEmpty(tabLists) ? (
          'No tabs'
        ) : (
          <TabListsList tabLists={tabLists} />
        )}
      </Container>
    </MainLayout>
  );
};
