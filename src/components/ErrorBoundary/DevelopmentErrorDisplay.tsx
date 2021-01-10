import React, { FC, MouseEvent } from 'react';
import { isSome } from 'fp-ts/Option';
import { TryAgainButton } from './TryAgainButton';
import { useService } from '../../services/ServiceContainer';

interface Props {
  error: Error;
  resetErrorBoundary(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): void;
}

export const DevelopmentErrorDisplay: FC<Props> = ({ error, resetErrorBoundary }) => {
  const errorProcessingService = useService('errorProcessingService');

  const header = errorProcessingService.getHeader(error);
  const json = errorProcessingService.toJson(error);

  return (
    <div>
      <h1>Error has occurred</h1>
      <h2>{header}</h2>
      {isSome(json) && <pre>{json.value}</pre>}
      <TryAgainButton onClick={resetErrorBoundary} />
    </div>
  );
};
