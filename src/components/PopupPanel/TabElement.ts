import { Tab } from '../../services/Tab';

export class TabElement implements Tab {
  public constructor(tab: Tab) {
    this.id = tab.id;
    this.windowId = tab.windowId;
    this.title = tab.title;
    this.url = tab.url;
    this.favIconUrl = tab.favIconUrl;
    this.pinned = tab.pinned;
    this.checked = false;
  }

  public readonly id: number;
  public readonly windowId: number;
  public readonly title: string;
  public readonly url: string;
  public readonly favIconUrl?: string;
  public readonly pinned: boolean;
  public checked: boolean;

  public toTab(): Tab {
    return {
      id: this.id,
      windowId: this.windowId,
      title: this.title,
      url: this.url,
      favIconUrl: this.favIconUrl,
      pinned: this.pinned,
    };
  }
}
