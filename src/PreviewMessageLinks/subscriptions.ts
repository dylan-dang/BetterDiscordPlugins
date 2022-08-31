import * as MessageCache from './MessageCache';
import { createMessageRecord, updateMessageRecord } from 'discord/utils';
import { HelpMessageTypes, LocaleMessages } from 'discord/constants';
import { UserStore } from 'discord/stores';

type Subscription = (update: any) => void;

export const MESSAGE_CREATE: Subscription = ({ message }) => {
    if (!MessageCache.has(message.channel_id, message.id)) return;

    MessageCache.set(message.channel_id, message.id, {
        status: 'SUCCESS',
        message: createMessageRecord(message),
    });
};

export const MESSAGE_UPDATE: Subscription = ({ message }) => {
    const cachedMessage = MessageCache.get(message.channel_id, message.id);
    if (cachedMessage?.status !== 'SUCCESS') return;

    MessageCache.set(message.channel_id, message.id, {
        status: 'SUCCESS',
        message: updateMessageRecord(cachedMessage.message, message),
    });
};

export const MESSAGE_DELETE: Subscription = ({ channelId, id }) => {
    if (!MessageCache.has(channelId, id)) return;

    MessageCache.set(channelId, id, {
        status: 'ERROR',
        errorType: HelpMessageTypes.ERROR,
        errorMessage: LocaleMessages.REPLY_QUOTE_MESSAGE_DELETED,
    });
};

export const MESSAGE_REACTION_ADD: Subscription = ({ channelId, messageId, userId, emoji, optimistic }) => {
    const self = userId === UserStore.getId();
    if (!optimistic && self) return;
    if (!optimistic && userId === UserStore.getId()) return;

    const cachedMessage = MessageCache.get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;

    MessageCache.set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.addReaction(emoji, self),
    });
};

export const MESSAGE_REACTION_REMOVE: Subscription = ({ channelId, messageId, userId, emoji, optimistic }) => {
    const self = userId === UserStore.getId();
    if (!optimistic && self) return;

    const cachedMessage = MessageCache.get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;

    MessageCache.set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.removeReaction(emoji, self),
    });
};

export const MESSAGE_REACTION_REMOVE_ALL: Subscription = ({ channelId, messageId }) => {
    const cachedMessage = MessageCache.get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;

    MessageCache.set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.set('reactions', []),
    });
};

export const MESSAGE_REACTION_REMOVE_EMOJI: Subscription = ({ channelId, messageId, emoji }) => {
    const cachedMessage = MessageCache.get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;

    MessageCache.set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.removeReactionsForEmoji(emoji),
    });
};
