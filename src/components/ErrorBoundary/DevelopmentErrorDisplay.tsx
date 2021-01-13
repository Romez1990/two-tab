import React, { FC, MouseEvent } from 'react';
import { isSome } from 'fp-ts/Option';
import { useService } from '../ServiceContainer';
import { TryAgainButton } from './TryAgainButton';

interface Props {
  error: Error;
  resetErrorBoundary(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): void;
}

export const DevelopmentErrorDisplay: FC<Props> = ({ error, resetErrorBoundary }) => {
  const errorProcessing = useService('errorProcessingService');

  const header = errorProcessing.getHeader(error);
  const json = errorProcessing.toJson(error);
  const trace = errorProcessing.getTrace(error);

  return (
    <div>
      <h1>Error has occurred</h1>
      <h2>{header}</h2>
      {isSome(json) && <pre>{json.value}</pre>}
      {isSome(trace) && <pre>{trace.value}</pre>}
      <TryAgainButton onClick={resetErrorBoundary} />
    </div>
  );
};
