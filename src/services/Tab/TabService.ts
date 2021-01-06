type Tab = chrome.tabs.Tab;

export interface TabService {
  getAllInWindow(): Promise<Tab>;
}
