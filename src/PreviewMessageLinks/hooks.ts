import EventEmitter from 'events';
import * as MessageCache from './MessageCache';
import { saveData, loadData } from 'bdapi';
import { useState, useEffect } from 'bdapi/React';
import { snowflake } from 'discord/types';
import { ChannelStore, MessageStore } from 'discord/stores';
import { Endpoints, HelpMessageTypes, LocaleMessages } from 'discord/constants';
import { createMessageRecord, RequestModule } from 'discord/utils';

const settingsEmitter = new EventEmitter();
const defaultSettings = {
    hideLinks: true,
    interactive: true,
    maxDepth: 3,
};

export function useSetting<T extends keyof typeof defaultSettings>(key: T) {
    const [setting, setSetting] = useState<typeof defaultSettings[T]>(loadData(key) ?? defaultSettings[key]);

    useEffect(() => {
        settingsEmitter.addListener(key, setSetting);
        return () => void settingsEmitter.removeListener(key, setSetting);
    }, []);

    function saveSetting(value: typeof defaultSettings[T]) {
        saveData(key, value);
        settingsEmitter.emit(key, value);
    }

    return [setting, saveSetting] as const;
}

export function formatErrorMessage(name: string, message: string) {
    return `${name.endsWith('.') ? name.slice(0, -1) : name}: ${message}`;
}

async function fetchMessage(channelId: snowflake, messageId: snowflake): Promise<MessageCache.Record> {
    const { REPLY_QUOTE_MESSAGE_NOT_LOADED: MESSAGE_NOT_LOADED, REPLY_QUOTE_MESSAGE_DELETED: MESSAGE_DELETED } =
        LocaleMessages;

    const response = await RequestModule.get({
        url: Endpoints.MESSAGES(channelId),
        query: {
            limit: 1,
            around: messageId,
        },
        retries: 2,
    }).catch((response) => response);

    if (response instanceof Error)
        return {
            status: 'ERROR',
            errorType: HelpMessageTypes.ERROR,
            errorMessage: `${response.name}: ${response.message}`,
        };

    if (!response.ok)
        return {
            status: 'ERROR',
            errorType: HelpMessageTypes.WARNING,
            errorMessage: formatErrorMessage(MESSAGE_NOT_LOADED, response.body?.message ?? `Status ${response.status}`),
        };

    const message = response.body?.[0];
    if (!message || message.id !== messageId)
        return {
            status: 'ERROR',
            errorType: HelpMessageTypes.ERROR,
            errorMessage: MESSAGE_DELETED,
        };

    if (!ChannelStore.hasChannel(message.channel_id))
        return {
            status: 'ERROR',
            errorType: HelpMessageTypes.WARNING,
            errorMessage: formatErrorMessage(MESSAGE_NOT_LOADED, 'Channel not in store'),
        };

    return {
        status: 'SUCCESS',
        message: createMessageRecord(message),
    };
}

export function useMessageCache(channelId: snowflake, messageId: snowflake) {
    useEffect(() => {
        MessageCache.addListener(channelId, messageId, setCache);
        return () => MessageCache.removeListener(channelId, messageId, setCache);
    }, []);

    const [cache, setCache] = useState<MessageCache.Record | undefined>(() => {
        const cache = MessageCache.get(channelId, messageId);
        if (cache) return cache;

        const message = MessageStore?.getMessage(channelId, messageId);
        if (message) return MessageCache.set(channelId, messageId, { status: 'SUCCESS', message });

        fetchMessage(channelId, messageId).then((message) => MessageCache.set(channelId, messageId, message));
    });
    return cache;
}
