import React, { FC, useEffect } from 'react';
import { pipe, constant } from 'fp-ts/function';
import { fromNullable, map, getOrElse } from 'fp-ts/Option';

export interface LayoutProps {
  readonly title?: string;
}

export const BaseLayout: FC<LayoutProps> = ({ title: inputTitle, children }) => {
  useEffect((): void => {
    processTitle();
  }, [inputTitle]);

  const appTitle = 'Two Tab';

  const processTitle = (): void =>
    pipe(fromNullable(inputTitle), map(addAppTitle), getOrElse(constant(appTitle)), setTitle);

  const addAppTitle = (pageTitle: string) => `${pageTitle} | ${appTitle}`;

  const setTitle = (title: string) => {
    document.title = title;
  };

  return <>{children}</>;
};
