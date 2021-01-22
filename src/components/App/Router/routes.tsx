import React from 'react';
import { ViewList as ViewListIcon } from '@material-ui/icons';
import { TabListsPage } from '../TabListsPage';
import { Route } from './Route';

export const routes = {
  tabLists: new Route('Tab lists', '/', <ViewListIcon />, <TabListsPage />),
  importExport: new Route('Import/Export', '/import/export', <ViewListIcon />, <div>Import/export</div>),
  settings: new Route('Settings', '/settings', <ViewListIcon />, <div>settings</div>),
};

type RouteName = keyof typeof routes;

export const getRoute = (name: RouteName): string => routes[name].path;
