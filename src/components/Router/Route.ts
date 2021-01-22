import { ReactElement, ReactNode } from 'react';

export class Route {
  public constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly icon: ReactElement,
    public readonly element: ReactNode,
  ) {}

  public isActive(): boolean {
    return false;
  }
}
