import { pipe, constVoid } from 'fp-ts/function';
import { Option, some, none, fold, isSome } from 'fp-ts/Option';
import { TabList } from '../TabList';
import { TabListsUpdateHandlersAlreadyAddedError } from './Errors';
import { TabListsUpdatingService } from './TabListsUpdatingService';
import { MessageService } from '../../../Browser/MessageService';
import { TabListsUpdateMessage, TabListsUpdateType, TabListsUpdateData } from './Message';
import { TabListsUpdateHandlers } from './TabListsUpdateHandlers';
import { TabListSerializer } from '../TabListSerializer';

export class TabListsUpdatingServiceImpl implements TabListsUpdatingService {
  public constructor(
    private readonly messageService: MessageService,
    private readonly tabListSerializer: TabListSerializer,
  ) {
    messageService.addHandler<TabListsUpdateMessage>()('tabListsUpdate', this.messageHandler.bind(this));
  }

  private handlers: Option<TabListsUpdateHandlers> = none;

  public addHandlers(handlers: TabListsUpdateHandlers): void {
    if (isSome(this.handlers)) {
      throw new TabListsUpdateHandlersAlreadyAddedError();
    }
    this.handlers = some(handlers);
  }

  public removeHandlers(): void {
    this.handlers = none;
  }

  private messageHandler = ({ type, tabList }: TabListsUpdateData): void =>
    pipe(
      this.handlers,
      fold(constVoid, handlers => {
        const method = handlers[type];
        const deserializedTabList = this.tabListSerializer.deserialize(tabList);
        method(deserializedTabList);
      }),
    );

  public addTabList(tabList: TabList): void {
    this.sendMessage('add', tabList);
  }

  public updateTabList(tabList: TabList): void {
    this.sendMessage('update', tabList);
  }

  public deleteTabList(tabList: TabList): void {
    this.sendMessage('delete', tabList);
  }

  private sendMessage(type: TabListsUpdateType, tabList: TabList): void {
    const serializedTabList = this.tabListSerializer.serialize(tabList);
    const message = new TabListsUpdateMessage(type, serializedTabList);
    this.messageService.sendMessage(message);
  }
}
