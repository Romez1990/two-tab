import { string, TypeOf } from 'io-ts';

export const MessageTypeT = string;

export type MessageType = TypeOf<typeof MessageTypeT>;
