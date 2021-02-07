import { AxiosError, AxiosStatic } from 'axios';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';
import { flow } from 'fp-ts/function';
import { RequestService } from './RequestService';
import { RequestOptions } from './RequestOptions';
import { RequestError } from './RequestError';
import { ErrorProcessingService } from '../../Infrastructure/Error';

export class AxiosRequestService implements RequestService {
  public constructor(private readonly axios: AxiosStatic, private readonly errorProcessing: ErrorProcessingService) {}

  public request = (options: RequestOptions): TaskEither<RequestError, unknown> =>
    tryCatch(
      () => this.axios.request(options),
      flow(this.errorProcessing.refine.bind(this.errorProcessing), this.getRequestError.bind(this)),
    );

  private getRequestError(error: Error): RequestError {
    if (!this.axios.isAxiosError(error)) throw error;
    const axiosError = error as AxiosError<unknown>;
    console.log(axiosError);
    return new RequestError();
  }
}
