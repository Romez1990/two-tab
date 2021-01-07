import { Connection } from './Connection';

type Port = chrome.runtime.Port;

export class ChromeConnection implements Connection {
  public constructor(name: string) {
    this.port = chrome.runtime.connect({ name });
  }

  private readonly port: Port;

  public sendMessage(data: unknown): void {
    this.port.postMessage(data);
  }

  public onMessage(handler: (data: unknown) => void): void {
    this.port.onMessage.addListener(handler);
  }
}
