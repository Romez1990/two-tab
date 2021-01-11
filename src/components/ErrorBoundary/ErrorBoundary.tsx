import React, { FC } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useService } from '../../services/ServiceContainer';
import { ErrorDisplay } from './ErrorDisplay';

interface ErrorInfo {
  readonly componentStack: string;
}

export const ErrorBoundary: FC = ({ children }) => {
  const errorReportingService = useService('errorReportingService');

  function reportError(error: Error, { componentStack }: ErrorInfo): void {
    errorReportingService.report(error, componentStack);
  }

  return (
    <ReactErrorBoundary FallbackComponent={ErrorDisplay} onError={reportError}>
      {children}
    </ReactErrorBoundary>
  );
};