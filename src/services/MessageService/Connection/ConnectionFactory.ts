import { Connection } from './Connection';

export interface ConnectionFactory {
  create(name: string): Connection;
}
