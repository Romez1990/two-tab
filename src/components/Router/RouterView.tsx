import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { routes } from './routes';

export const RouterView: FC = () => (
  <Switch>
    {Object.values(routes).map(({ name, path, element }) => (
      <Route key={name} path={path} exact>
        {element}
      </Route>
    ))}
  </Switch>
);
