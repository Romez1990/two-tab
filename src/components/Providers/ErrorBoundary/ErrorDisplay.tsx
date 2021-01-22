import React, { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useService } from '../ServiceContainer';
import { ProductionErrorDisplay } from './ProductionErrorDisplay';
import { DevelopmentErrorDisplay } from './DevelopmentErrorDisplay';

export const ErrorDisplay: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const config = useService('config');

  return config.isProduction ? (
    <ProductionErrorDisplay resetErrorBoundary={resetErrorBoundary} />
  ) : (
    <DevelopmentErrorDisplay error={error} resetErrorBoundary={resetErrorBoundary} />
  );
};
