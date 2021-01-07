import { serviceContainer } from './services/ServiceContainer';
import { MessageServiceImpl, ChromeMessageSender } from './services/MessageService';

const loggerService = serviceContainer.get('loggerService');

loggerService.registerReceiver();

// const messageSender = new ChromeMessageSender();
// const messageService = new MessageServiceImpl(messageSender);
// messageService.addHandler('test', function (data: any) {
//   console.log('from popup', data);
// });
