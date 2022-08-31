import { HelpMessageTypes } from 'discord/constants';
import { MessageRecord, snowflake } from 'discord/types';
import EventEmitter from 'events';

export type Record =
    | {
          status: 'SUCCESS';
          message: MessageRecord;
      }
    | {
          status: 'ERROR';
          errorType: HelpMessageTypes;
          errorMessage: string;
      };

const cache = new Map<`${snowflake}, ${snowflake}`, Record>();
const emitter = new EventEmitter();
type MessageCacheListener = (message: Record) => void;

function hash(channelId: snowflake, messageId: snowflake) {
    return `${channelId}, ${messageId}` as const;
}

export function has(channelId: snowflake, messageId: snowflake) {
    return cache.has(hash(channelId, messageId));
}

export function get(channelId: snowflake, messageId: snowflake) {
    return cache.get(hash(channelId, messageId));
}

export function set(channelId: snowflake, messageId: snowflake, message: Record) {
    emitter.emit(hash(channelId, messageId), message);
    cache.set(hash(channelId, messageId), message);
    return message;
}

export function addListener(channelId: snowflake, messageId: snowflake, listener: MessageCacheListener) {
    emitter.addListener(hash(channelId, messageId), listener);
}

export function removeListener(channelId: snowflake, messageId: snowflake, listener: MessageCacheListener) {
    emitter.removeListener(hash(channelId, messageId), listener);
}
