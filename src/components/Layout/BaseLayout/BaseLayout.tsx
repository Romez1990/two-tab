import React, { FC, useEffect } from 'react';
import { pipe, constant } from 'fp-ts/function';
import { map, fromNullable, getOrElse } from 'fp-ts/Option';

export interface LayoutProps {
  readonly title?: string;
}

export const BaseLayout: FC<LayoutProps> = ({ title, children }) => {
  useEffect((): void => {
    document.title = processTitle(title);
  }, [title]);

  const appTitle = 'Two Tab';

  const processTitle = (pageTitle: string | undefined): string =>
    pipe(fromNullable(pageTitle), map(addAppTitle), getOrElse(constant(appTitle)));

  const addAppTitle = (pageTitle: string): string => `${pageTitle} | ${appTitle}`;

  return <>{children}</>;
};
