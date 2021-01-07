import { ConnectionService } from './ConnectionService';

export interface MessageService {
  connect(name: string): ConnectionService;
}
