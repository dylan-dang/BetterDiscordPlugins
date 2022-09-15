import {
    Anchor,
    FormSection,
    FormText,
    FormTitle,
    HelpMessage,
    HelpMessageTypes,
    MessagePlaceholder,
    Slider,
    SwitchItem,
    ChannelMessage,
    ConnectedMessageAccessories,
    MessageAccessoriesProps,
    ChannelMessageProps,
    MessageHeader,
} from 'discord/components';
import { DEFAULT_POPOUTS, linkRegex, LocaleMessages, USER_MESSAGE_TYPES } from 'discord/constants';
import { formatErrorMessage, useMessageCache, useSetting } from './hooks';
import type { MessageContentProps } from 'discord/components';
import type { FunctionComponent, ReactNode, MouseEvent, MouseEventHandler } from 'react';
import { useState, Children, useCallback, memo } from 'react';
import { ChannelRecord, MessageRecord, snowflake } from 'discord/types';
import { ChannelStore, ReferencedMessageStore } from 'discord/stores';
import {
    Popouts,
    PopoutSetter,
    renderMessageMarkupToAST,
    renderUserGuildPopout,
    transitionToGuild,
    useAuthor,
    useClickMessageAuthorAvatar,
    useClickMessageAuthorUsername,
    useContextMenuMessage,
    useContextMenuUser,
    usePopout,
    useRepliedMessage,
    useRoleIcon,
    useStateFromStores,
} from 'discord/utils';

export function PatchedMessageContent({
    MessageContent,
    ...props
}: MessageContentProps & { MessageContent: FunctionComponent<MessageContentProps> }) {
    const [hideLinks] = useSetting('hideLinks');
    if (!hideLinks || Children.count(props.content) === 0) return MessageContent(props);

    const content = Children.toArray(props.content).filter((part: any) => !part?.props?.href?.match(linkRegex));
    const { 0: firstPart, [content.length - 1]: lastPart } = content;
    if (typeof firstPart === 'string') content.splice(0, 1, firstPart.trimStart());
    if (typeof lastPart === 'string') content.splice(-1, 1, lastPart.trimEnd());

    return MessageContent({ ...props, content });
}

export function PatchedMessageAccessories({
    children,
    message,
    depth,
    compact,
}: MessageAccessoriesProps & { depth?: number }) {
    const messageLinks = (renderMessageMarkupToAST(message).content as any[])
        .filter(({ type }) => type === 'link')
        .map(({ target }) => target.match(linkRegex))
        .filter(Boolean);

    return (
        <>
            {messageLinks.map(([href, _guildId, channelId, messageId], index) => (
                <>
                    <MessageEmbed
                        channelId={channelId}
                        messageId={messageId}
                        href={href}
                        depth={(depth ?? 0) + 1}
                        compact={compact}
                    />
                    {index !== messageLinks.length - 1 && <br />}
                </>
            ))}
            {children}
        </>
    );
}

export interface MessageErrorProps {
    type: HelpMessageTypes;
    children: ReactNode;
    className?: string;
    href?: string;
}

export function ErrorMessage({ href, children, type }: MessageErrorProps) {
    return (
        <Anchor href={href} className='messageEmbed'>
            <HelpMessage messageType={type}>{children}</HelpMessage>
        </Anchor>
    );
}

export interface MessagePreviewHeaderProps {
    channel: ChannelRecord;
    message: MessageRecord;
    compact?: boolean;
    popouts: Popouts;
    setPopout: PopoutSetter;
}

export function MessagePreviewHeader({ channel, message, compact, popouts, setPopout }: MessagePreviewHeaderProps) {
    const author = useAuthor(message);
    const roleIcon = useRoleIcon({ guildId: channel.guild_id, roleId: author.iconRoleId });
    const repliedMessage = useStateFromStores([ReferencedMessageStore], () =>
        ReferencedMessageStore.getMessageByReference(message.messageReference)
    );

    const onContextMenu = useContextMenuUser(message.author.id, channel.id);
    const onClickUsername = useClickMessageAuthorUsername(message, channel, popouts.usernameProfile, setPopout);
    const onClickAvatar = useClickMessageAuthorAvatar(popouts.avatarProfile, setPopout);
    const onPopoutRequestClose = useCallback(
        () =>
            setPopout({
                usernameProfile: false,
                avatarProfile: false,
                referencedUsernameProfile: false,
            }),
        [setPopout]
    );

    return (
        <MessageHeader
            guildId={channel.guild_id}
            showAvatarPopout={popouts.avatarProfile}
            showUsernamePopout={popouts.usernameProfile}
            subscribeToGroupId={message.id}
            renderPopout={renderUserGuildPopout}
            {...{
                author,
                channel,
                message,
                compact,
                roleIcon,
                repliedMessage,
                onContextMenu,
                onClickUsername,
                onClickAvatar,
                onPopoutRequestClose,
            }}
        />
    );
}

export const MemoizedMessagePreviewHeader = memo(MessagePreviewHeader);

export interface MessagePreviewProps {
    channel: ChannelRecord;
    message: MessageRecord;
    compact?: boolean;
    depth: number;
}

export function MessagePreview({ channel, message, compact, depth }: MessagePreviewProps) {
    const [hovered, setHovered] = useState(false);
    const [interactive] = useSetting('interactive');
    const { popouts, setPopout } = usePopout(message.id, DEFAULT_POPOUTS);
    const messageReferenceState = useStateFromStores([ReferencedMessageStore], () =>
        ReferencedMessageStore.getMessageByReference(message.messageReference)
    );

    function fromWithinContainer({ target, relatedTarget }: MouseEvent) {
        if (!(target instanceof HTMLElement && relatedTarget instanceof HTMLElement)) return false;
        return target.closest('.messageEmbed') === relatedTarget.closest('.messageEmbed');
    }

    function onHover(event: MouseEvent) {
        event.stopPropagation();
        if (fromWithinContainer(event)) return;
        setHovered(event.type === 'mouseover');
    }

    const onContextMenu: MouseEventHandler = useContextMenuMessage(message, channel, setPopout);
    const childrenRepliedMessage = useRepliedMessage(
        {
            channel,
            message,
            compact,
            groupId: message.id,
        },
        setPopout,
        popouts,
        message.messageReference,
        messageReferenceState
    );

    const interactiveProps: Partial<ChannelMessageProps> = interactive
        ? {
            onContextMenu,
            childrenRepliedMessage,
            childrenHeader: USER_MESSAGE_TYPES.has(message.type) && (
                <MemoizedMessagePreviewHeader {...{ channel, message, compact, popouts, setPopout }} />
            ),
        }
        : {
            className: 'disableInteraction',
        };

    return (
        <div
            className='messageEmbed'
            onMouseOver={onHover}
            onMouseOut={onHover}
            onContextMenu={interactive ? onContextMenu : undefined}
        >
            <ChannelMessage
                {...{ channel, message, compact }}
                {...interactiveProps}
                childrenButtons={
                    hovered && (
                        <div
                            className='button-cfOvv- jumpButton'
                            role='button'
                            onClick={() => transitionToGuild(channel.guild_id, message.channel_id, message.id)}
                        >
                            Jump
                        </div>
                    )
                }
                childrenAccessories={<ConnectedMessageAccessories {...{ channel, message, compact, depth }} />}
                renderThreadAccessory
            />
        </div>
    );
}

export interface MessageEmbedProps {
    channelId: snowflake;
    messageId: snowflake;
    depth: number;
    href: string;
    compact?: boolean;
}

export function MessageEmbed({ channelId, messageId, depth, href, compact }: MessageEmbedProps) {
    const [maxDepth] = useSetting('maxDepth');
    const cache = useMessageCache(channelId, messageId);

    if (!cache) {
        return (
            <div className='messageEmbed'>
                <MessagePlaceholder messages={1} compact={compact} />
            </div>
        );
    }

    if (cache.status === 'ERROR') {
        return (
            <ErrorMessage type={cache.errorType} href={href}>
                {cache.errorMessage}
            </ErrorMessage>
        );
    }

    if (depth > maxDepth) {
        return (
            <ErrorMessage type={HelpMessageTypes.WARNING} href={href}>
                Maximum depth exceeded
            </ErrorMessage>
        );
    }

    const channel = ChannelStore.getChannel(channelId);

    if (!channel) {
        return (
            <ErrorMessage type={HelpMessageTypes.WARNING} href={href}>
                {formatErrorMessage(LocaleMessages.REPLY_QUOTE_MESSAGE_NOT_LOADED, 'Channel could not be found')}
            </ErrorMessage>
        );
    }

    return <MessagePreview channel={channel} message={cache.message} depth={depth} />;
}

export function SettingsPanel() {
    const [interactive, setInteractive] = useSetting('interactive');
    const [hideLinks, setHideLinks] = useSetting('hideLinks');
    const [maxDepth, setMaxDepth] = useSetting('maxDepth');

    const [minValue, maxValue] = [1, 10];
    const markers = [...Array(maxValue - minValue + 1).keys()].map((n) => n + minValue);

    return (
        <FormSection>
            <SwitchItem
                value={hideLinks}
                onChange={() => setHideLinks(!hideLinks)}
                note='Hide the link an embedded message was referred from when it is embedded.'
            >
                Hide Message Links
            </SwitchItem>
            <SwitchItem
                value={interactive}
                onChange={() => setInteractive(!interactive)}
                note='Make embedded messages interactive. Allows reactions, context menu and user popouts to be accessed from the embed itself.'
            >
                Interactive
            </SwitchItem>
            <FormTitle>Maximum Depth</FormTitle>
            <FormText type='description' style={{ marginBottom: 20 }}>
                The maximum depth that embedded messages links can be nested within each other
            </FormText>
            <Slider
                onValueChange={setMaxDepth}
                markers={markers}
                minValue={minValue}
                maxValue={maxValue}
                initialValue={maxDepth}
                keyboardStep={1}
                handleSize={10}
                equidistant
                stickToMarkers
            />
        </FormSection>
    );
}
