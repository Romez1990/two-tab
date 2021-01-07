export interface Connection {
  sendMessage(data: unknown): void;
  onMessage(handler: (data: unknown) => void): void;
}
