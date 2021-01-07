import { Tab } from '../../services/Tab';

export interface TabElement extends Tab {
  checked: boolean;
}

export const mapTab = (tab: Tab): TabElement => ({
  ...tab,
  checked: false,
});
