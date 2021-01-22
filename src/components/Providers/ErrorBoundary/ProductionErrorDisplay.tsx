import React, { FC, MouseEvent } from 'react';
import { TryAgainButton } from './TryAgainButton';

interface Props {
  resetErrorBoundary(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): void;
}

export const ProductionErrorDisplay: FC<Props> = ({ resetErrorBoundary }) => (
  <div>
    <h1>Something went wrong</h1>
    <TryAgainButton onClick={resetErrorBoundary} />
  </div>
);
