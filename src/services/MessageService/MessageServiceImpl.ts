import { ConnectionFactory } from './Connection';
import { MessageService } from './MessageService';
import { ConnectionService } from './ConnectionService';
import { ConnectionServiceImpl } from './ConnectionServiceImpl';

export class MessageServiceImpl implements MessageService {
  public constructor(private readonly connectionFactory: ConnectionFactory) {}

  public connect(name: string): ConnectionService {
    const connection = this.connectionFactory.create(name);
    return new ConnectionServiceImpl(connection);
  }
}
