import React, { FC, useEffect, useState } from 'react';
import { pipe } from 'fp-ts/function';
import { Task, map } from 'fp-ts/Task';
import { useService } from '../ServiceContainer';
import { run } from '../../services/Utils/fp-ts/Task';

export const StorageConnector: FC = ({ children }) => {
  const storage = useService('storageService');

  useEffect((): void => {
    run(connect());
  }, []);

  const [isConnected, setConnected] = useState(false);

  const connect = (): Task<void> =>
    pipe(
      storage.connect(),
      map(() => setConnected(true)),
    );

  return <>{!isConnected ? 'Loading' : children}</>;
};
