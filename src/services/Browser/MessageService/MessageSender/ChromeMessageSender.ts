import { MessageSender } from './MessageSender';

export class ChromeMessageSender implements MessageSender {
  public sendMessage(data: unknown): void {
    chrome.runtime.sendMessage(data);
  }

  public addHandler(handler: (data: unknown) => void): void {
    chrome.runtime.onMessage.addListener(handler);
  }
}
