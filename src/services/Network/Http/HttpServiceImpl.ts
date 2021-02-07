import { Type } from 'io-ts';
import { map, mapLeft, TaskEither } from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Config } from '../../Infrastructure/Config';
import { NetworkError } from './Errors';
import { HttpService } from './HttpService';
import { RequestService } from './RequestService';
import { RequestOptions } from './RequestOptions';
import { TypeCheckingService } from '../../DataProcessing/TypeChecking';
import { RequestError } from './RequestError';
import { HttpServiceError } from './Errors/HttpServiceError';

export class HttpServiceImpl implements HttpService {
  public constructor(
    private readonly requestService: RequestService,
    private readonly typeChecking: TypeCheckingService,
    private readonly config: Config,
  ) {}

  public get = <T>(url: string, type: Type<T>, auth?: boolean): TaskEither<NetworkError, T> =>
    this.request(type, auth, {
      method: 'get',
      url,
    });

  public post = <T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T> =>
    this.request(type, auth, {
      method: 'post',
      url,
      body,
    });

  public put = <T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T> =>
    this.request(type, auth, {
      method: 'put',
      url,
      body,
    });

  public patch = <T>(url: string, type: Type<T>, body?: unknown, auth?: boolean): TaskEither<NetworkError, T> =>
    this.request(type, auth, {
      method: 'patch',
      url,
      body,
    });

  public delete = <T>(url: string, type: Type<T>, auth?: boolean): TaskEither<NetworkError, T> =>
    this.request(type, auth, {
      method: 'delete',
      url,
    });

  private request = <T>(
    type: Type<T>,
    auth: boolean | undefined,
    { url, ...options }: RequestOptions,
  ): TaskEither<NetworkError, T> =>
    pipe(
      this.requestService.request({
        url: this.addBaseUrl(url),
        ...options,
      }),
      map(this.typeChecking.checkAndThrow(type)),
      mapLeft(this.toNetworkError),
    );

  private addBaseUrl = (url: string) => {
    if (url.startsWith('/')) {
      throw new HttpServiceError('url must not start with /');
    }
    if (url.endsWith('/')) {
      throw new HttpServiceError('url must not end with /');
    }
    return `${this.config.backendUrl}/api/${url}`;
  };

  private toNetworkError = (requestError: RequestError): NetworkError => {
    throw new Error('not implemented');
  };
}
