import React, { FC, MouseEvent } from 'react';
import { isSome } from 'fp-ts/Option';
import { TryAgainButton } from './TryAgainButton';
import { useService } from '../ServiceContainer';

interface Props {
  error: Error;
  resetErrorBoundary(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): void;
}

export const DevelopmentErrorDisplay: FC<Props> = ({ error, resetErrorBoundary }) => {
  const errorProcessing = useService('errorProcessingService');

  const header = errorProcessing.getHeader(error);
  const json = errorProcessing.toJson(error);

  return (
    <div>
      <h1>Error has occurred</h1>
      <h2>{header}</h2>
      {isSome(json) && <pre>{json.value}</pre>}
      <TryAgainButton onClick={resetErrorBoundary} />
    </div>
  );
};
