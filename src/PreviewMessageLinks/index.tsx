import { clearCSS, injectCSS, Patcher } from 'bdapi';
import {
    MessageAccessories,
    MessageContent,
    MessageContextMenuModulePromise,
    SystemMessageContextMenuModulePromise,
} from 'discord/components';
import type { MessageContextMenuProps, MessageContentProps } from 'discord/components';
import { SettingsPanel, PatchedMessageContent, PatchedMessageAccessories } from './components';
import { Dispatcher, MessageStore } from 'discord/stores';
import * as MessageCache from './MessageCache';
import * as subscriptions from './subscriptions';
import css from './styles.scss';
import { jumpToMessage, transitionToGuild } from 'discord/utils';
import type { FunctionComponent } from 'react';

let pluginHasStopped = false;
const JumpingActionIds = new Set(['edit', 'reply', 'mark-unread']);
type MenuItemProps = { id: string; label: string; action(...args: any[]): any };

function traverseMenuItems({ props }: any, callback: (props: MenuItemProps) => void) {
    if (props.action) return callback(props);
    for (const child of props.children ?? []) {
        if (!child?.props) continue;
        traverseMenuItems(child, callback);
    }
}

function patchContextMenu(_: unknown, [{ target, message, channel }]: [MessageContextMenuProps], contextMenu: any) {
    if (!target.closest('.messageEmbed')) return contextMenu;
    traverseMenuItems(contextMenu, (props) => {
        const { action, id } = props;
        if (!JumpingActionIds.has(id)) return;
        props.action = (...args: any[]) => {
            transitionToGuild(channel.guild_id, message.channel_id);
            jumpToMessage({
                channelId: message.channel_id,
                messageId: message.id,
                flash: true,
            });
            return action(...args);
        };
    });
}

function patchContextMenuModule(ContextMenuModule: { default: FunctionComponent<MessageContextMenuProps> }) {
    if (pluginHasStopped) return;
    Patcher.after(ContextMenuModule, 'default', patchContextMenu);
}

export function start() {
    Object.entries(subscriptions).forEach(([rpcEvent, callback]) => Dispatcher.subscribe(rpcEvent, callback));

    Patcher.instead(MessageContent, 'type', (_, [props]: [MessageContentProps], MessageContent) => (
        <PatchedMessageContent MessageContent={MessageContent} {...props} />
    ));

    Patcher.after(MessageAccessories.prototype, 'render', ({ props }, _, otherAccessories) => (
        <PatchedMessageAccessories {...props}>{otherAccessories}</PatchedMessageAccessories>
    ));

    Patcher.after(MessageStore, 'getMessage', (_, [channelId, messageId], returnValue) => {
        if (returnValue) returnValue;
        const cachedMessage = MessageCache.get(channelId, messageId);
        if (cachedMessage?.status !== 'SUCCESS') return;
        return cachedMessage.message;
    });

    injectCSS(css);

    MessageContextMenuModulePromise.then(patchContextMenuModule);
    SystemMessageContextMenuModulePromise.then(patchContextMenuModule);
}

export function stop() {
    pluginHasStopped = true;
    Object.entries(subscriptions).forEach(([rpcEvent, callback]) => Dispatcher.unsubscribe(rpcEvent, callback));
    Patcher.unpatchAll();
    clearCSS();
}

export function getSettingsPanel() {
    return <SettingsPanel />;
}
