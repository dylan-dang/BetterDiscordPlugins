import { getModule } from 'bdapi/webpack';
import { byDisplayName, byProps } from 'bdapi/webpack/filters';
import type { MouseEventHandler, ReactNode } from 'react';
import { MessageComponentProps } from './components';
import { MessageReferenceState, Store } from './stores';
import { ChannelRecord, MessageRecord, ReactionObject, snowflake } from './types';

export const { openContextMenu } = getModule(byProps('openContextMenu'));
export const MessageParser = getModule(byProps('renderMessageMarkupToAST'));
export const { renderMessageMarkupToAST } = MessageParser;
export const { transitionToGuild } = getModule(byProps('transitionTo', 'replaceWith', 'getHistory'));
export const { jumpToMessage } = getModule(byProps('jumpToMessage'));

export const { useStateFromStores }: { useStateFromStores: <T>(stores: Store[], callback: () => T) => T } = getModule(
    byProps('useStateFromStores')
);

export const { useRoleIcon }: { useRoleIcon: (info: { guildId?: snowflake; roleId?: snowflake }) => unknown } =
    getModule(byProps('useRoleIcon'));

export interface Author {
    colorRoleName?: string;
    colorString?: string;
    guildMemberAvatar?: unknown;
    iconRoleId?: snowflake;
    nick: string;
}

export const { default: useAuthor }: { default: (message: MessageRecord) => Author } = getModule(
    byProps('getMessageAuthor')
);
export interface Popouts {
    avatarProfile: boolean;
    contextMenu: boolean;
    emojiPicker: boolean;
    interactionAvatarProfile: boolean;
    interactionData: boolean;
    interactionUsernameProfile: boolean;
    moreUtilities: boolean;
    referencedAvatarProfile: boolean;
    referencedUsernameProfile: boolean;
    usernameProfile: boolean;
}

export type PopoutSetter = (popout: Partial<Popouts>) => void;

export const usePopout: (
    messageId: snowflake,
    popouts: Popouts
) => { popouts: Popouts; selected: boolean; setPopout: PopoutSetter } = getModule(byProps('isSelected')).default;

export interface DiscordResponse {
    ok: boolean;
    headers: any;
    body: any;
    status: number;
    text: string;
}

export const RequestModule = getModule(byProps('getAPIBaseURL')) as {
    get(options: any): Promise<DiscordResponse>;
};

export const {
    createMessageRecord,
    updateMessageRecord,
}: {
    createMessageRecord(
        messageObject: any,
        data?: { reactions?: ReactionObject[]; interactionData?: any }
    ): MessageRecord;
    updateMessageRecord(messageObject: any, updates?: any): MessageRecord;
} = getModule(byProps('createMessageRecord'));

interface MessageHooks {
    useClickInteractionCommandName(e: unknown, t: unknown): unknown;
    useClickInteractionUserAvatar(e: unknown, t: unknown): unknown;
    useClickInteractionUserUsername(e: unknown, t: unknown, n: unknown, r: unknown): unknown;
    useClickMessage(e: unknown, t: unknown): unknown;
    useClickMessageAuthorAvatar(avatarProfile: boolean, setPopout: PopoutSetter): () => void;
    useClickMessageAuthorUsername(
        message: MessageRecord,
        channel: ChannelRecord,
        usernameProfile: boolean,
        setPopout: PopoutSetter
    ): () => void;
    useClickReferencedMessageAuthorAvatar(e: unknown, t: unknown): unknown;
    useClickReferencedMessageAuthorUsername(e: unknown, t: unknown, n: unknown, r: unknown): unknown;
    useClickReply(e: unknown, t: unknown, n: unknown): unknown;
    useContextMenuMessage(message: MessageRecord, channel: ChannelRecord, setPopout: PopoutSetter): MouseEventHandler;
    useContextMenuModerateUser(e: unknown, t: unknown): unknown;
    useContextMenuUser(authorId: snowflake, channelId: snowflake): () => void;
    useFocusInside(e: unknown, t: unknown): unknown;
    useHoveredMessage(e: unknown, t: unknown, n: unknown): unknown;
}

export const {
    useClickInteractionCommandName,
    useClickInteractionUserAvatar,
    useClickInteractionUserUsername,
    useClickMessage,
    useClickMessageAuthorAvatar,
    useClickMessageAuthorUsername,
    useClickReferencedMessageAuthorAvatar,
    useClickReferencedMessageAuthorUsername,
    useClickReply,
    useContextMenuMessage,
    useContextMenuModerateUser,
    useContextMenuUser,
    useFocusInside,
    useHoveredMessage,
}: MessageHooks = getModule(byProps('useContextMenuUser'));

export type PopoutRenderer = (e: unknown, t: unknown) => void;
export const renderUserGuildPopout: PopoutRenderer = getModule(byDisplayName('renderUserGuildPopout'));
export const useRepliedMessage: (
    props: MessageComponentProps,
    setPopout: PopoutSetter,
    popouts: Popouts,
    messageReference: MessageRecord['messageReference'],
    messageReferenceState: MessageReferenceState
) => ReactNode = getModule((m) => m.default?.toString?.().includes('referencedAvatarProfile')).default;
