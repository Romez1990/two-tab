export interface MessageSender {
  sendMessage(data: unknown): void;
  addHandler(handler: (data: unknown) => void): void;
}
