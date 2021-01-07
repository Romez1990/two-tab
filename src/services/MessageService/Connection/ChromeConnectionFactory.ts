import { ConnectionFactory } from './ConnectionFactory';
import { Connection } from './Connection';
import { ChromeConnection } from './ChromeConnection';

export class ChromeConnectionFactory implements ConnectionFactory {
  public create(name: string): Connection {
    return new ChromeConnection(name);
  }
}
