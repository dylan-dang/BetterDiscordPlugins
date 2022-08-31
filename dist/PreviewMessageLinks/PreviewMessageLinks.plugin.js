/**
 * @name PreviewMessageLinks
 * @version 1.0.2
 * @author dylan-dang
 * @description Adds a embedded message preview for message links in chat
 * @authorId 316707214075101200
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true,
});

var EventEmitter = require('events');

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e
        ? e
        : {
              default: e,
          };
}

var EventEmitter__default = /*#__PURE__*/ _interopDefaultLegacy(EventEmitter);

function BindObject(object, firstArgument, pick) {
    const pickSet = pick && new Set(pick);
    const entries = pickSet ? Object.entries(object).filter(([key]) => pickSet.has(key)) : Object.entries(object);
    return Object.fromEntries(
        entries.map(([key, value]) => [key, typeof value === 'function' ? value.bind(null, firstArgument) : value])
    );
}

const { clearCSS, injectCSS, loadData, saveData } = BindObject(BdApi, 'PreviewMessageLinks', [
    'injectCSS',
    'clearCSS',
    'loadData',
    'saveData',
]);
const Patcher = BindObject(BdApi.Patcher, 'PreviewMessageLinks');
const { Webpack, React } = BdApi;
const { getModule, waitForModule, Filters } = Webpack;
const { byProps, byDisplayName } = Filters;
const MessagePlaceholder = getModule(byProps('HEIGHT_COZY_MESSAGE_START')).default;
const MessageContent = getModule((m) => m.default?.type?.displayName === 'MessageContent').default;
const ChannelMessage = getModule((m) => m.default?.type?.displayName === 'ChannelMessage').default;
const Anchor = getModule(byDisplayName('Anchor'));
const Slider = getModule(byDisplayName('Slider'));
const FormSection = getModule(byDisplayName('FormSection'));
const FormTitle = getModule(byDisplayName('FormTitle'));
const FormText = getModule(byDisplayName('FormText'));
const SwitchItem = getModule(byDisplayName('SwitchItem'));
const HelpMessage = getModule(byProps('HelpMessageTypes')).default;
const MessageHeader = getModule(byDisplayName('MessageHeader'));
const { default: ConnectedMessageAccessories, MessageAccessories } = getModule(byProps('MessageAccessories'));
const MessageContextMenuModuleAbortController = new AbortController();
const SystemMessageContextMenuModuleAbortController = new AbortController();
const MessageContextMenuModulePromise = waitForModule((m) => m.default.displayName === 'MessageContextMenu', {
    signal: MessageContextMenuModuleAbortController.signal,
});
const SystemMessageContextMenuModulePromise = waitForModule(
    (m) => m.default.displayName === 'SystemMessageContextMenu',
    {
        signal: SystemMessageContextMenuModuleAbortController.signal,
    }
);
const Constants = getModule(byProps('Endpoints'));
const { Endpoints, EmbedTypes, USER_MESSAGE_TYPES } = Constants;
const { DEFAULT_POPOUTS } = getModule(byProps('DEFAULT_POPOUTS'));
const { Messages: LocaleMessages } = getModule((m) => m.default?.Messages?.REPLY_QUOTE_MESSAGE_NOT_LOADED).default;
const linkRegex =
    /^^https?:\/\/(?:[\w-\.]+\.)?discord(?:app)?\.com(?:\:\d+)?\/channels\/(\d+|@me)\/(\d+)\/(\d+)(?:\/.*)?$/i;
const cache = new Map();
const emitter = new EventEmitter__default['default']();

function hash(channelId, messageId) {
    return `${channelId}, ${messageId}`;
}

function has(channelId, messageId) {
    return cache.has(hash(channelId, messageId));
}

function get(channelId, messageId) {
    return cache.get(hash(channelId, messageId));
}

function set(channelId, messageId, message) {
    emitter.emit(hash(channelId, messageId), message);
    cache.set(hash(channelId, messageId), message);
    return message;
}

function addListener(channelId, messageId, listener) {
    emitter.addListener(hash(channelId, messageId), listener);
}

function removeListener(channelId, messageId, listener) {
    emitter.removeListener(hash(channelId, messageId), listener);
}

const { Children, memo, useCallback, useEffect, useState } = React;
const ChannelStore = getModule(byProps('getChannel', 'getDMFromUserId'));
const MessageStore = getModule(byProps('getMessages'));
const UserStore = getModule(byProps('getSessionId'));
const ReferencedMessageStore = getModule(byProps('getMessageByReference'));
const Dispatcher = ChannelStore._dispatcher;
const MessageParser = getModule(byProps('renderMessageMarkupToAST'));
const { renderMessageMarkupToAST } = MessageParser;
const { transitionToGuild } = getModule(byProps('transitionTo', 'replaceWith', 'getHistory'));
const { jumpToMessage } = getModule(byProps('jumpToMessage'));
const { useStateFromStores } = getModule(byProps('useStateFromStores'));
const { useRoleIcon } = getModule(byProps('useRoleIcon'));
const { default: useAuthor } = getModule(byProps('getMessageAuthor'));
const usePopout = getModule(byProps('isSelected')).default;
const RequestModule = getModule(byProps('getAPIBaseURL'));
const { createMessageRecord, updateMessageRecord } = getModule(byProps('createMessageRecord'));
const { useClickMessageAuthorAvatar, useClickMessageAuthorUsername, useContextMenuMessage, useContextMenuUser } =
    getModule(byProps('useContextMenuUser'));
const renderUserGuildPopout = getModule(byDisplayName('renderUserGuildPopout'));
const useRepliedMessage = getModule((m) => m.default?.toString?.().includes('referencedAvatarProfile')).default;
const settingsEmitter = new EventEmitter__default['default']();
const defaultSettings = {
    hideLinks: true,
    interactive: true,
    maxDepth: 3,
};

function useSetting(key) {
    const [setting, setSetting] = useState(loadData(key) ?? defaultSettings[key]);
    useEffect(() => {
        settingsEmitter.addListener(key, setSetting);
        return () => void settingsEmitter.removeListener(key, setSetting);
    }, []);

    function saveSetting(value) {
        saveData(key, value);
        settingsEmitter.emit(key, value);
    }

    return [setting, saveSetting];
}

function formatErrorMessage(name, message) {
    return `${name.endsWith('.') ? name.slice(0, -1) : name}: ${message}`;
}

async function fetchMessage(channelId, messageId) {
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
            errorType: 2,
            /* HelpMessageTypes.ERROR */
            errorMessage: `${response.name}: ${response.message}`,
        };
    if (!response.ok)
        return {
            status: 'ERROR',
            errorType: 0,
            /* HelpMessageTypes.WARNING */
            errorMessage: formatErrorMessage(MESSAGE_NOT_LOADED, response.body?.message ?? `Status ${response.status}`),
        };
    const message = response.body?.[0];
    if (!message || message.id !== messageId)
        return {
            status: 'ERROR',
            errorType: 2,
            /* HelpMessageTypes.ERROR */
            errorMessage: MESSAGE_DELETED,
        };
    if (!ChannelStore.hasChannel(message.channel_id))
        return {
            status: 'ERROR',
            errorType: 0,
            /* HelpMessageTypes.WARNING */
            errorMessage: formatErrorMessage(MESSAGE_NOT_LOADED, 'Channel not in store'),
        };
    return {
        status: 'SUCCESS',
        message: createMessageRecord(message),
    };
}

function useMessageCache(channelId, messageId) {
    useEffect(() => {
        addListener(channelId, messageId, setCache);
        return () => removeListener(channelId, messageId, setCache);
    }, []);
    const [cache, setCache] = useState(() => {
        const cache = get(channelId, messageId);
        if (cache) return cache;
        const message = MessageStore?.getMessage(channelId, messageId);
        if (message)
            return set(channelId, messageId, {
                status: 'SUCCESS',
                message,
            });
        fetchMessage(channelId, messageId).then((message) => set(channelId, messageId, message));
    });
    return cache;
}

function PatchedMessageContent({ MessageContent, ...props }) {
    const [hideLinks] = useSetting('hideLinks');
    if (!hideLinks || Children.count(props.content) === 0) return MessageContent(props);
    const content = Children.toArray(props.content).filter((part) => !part?.props?.href?.match(linkRegex));
    const { 0: firstPart, [content.length - 1]: lastPart } = content;
    if (typeof firstPart === 'string') content.splice(0, 1, firstPart.trimStart());
    if (typeof lastPart === 'string') content.splice(-1, 1, lastPart.trimEnd());
    return MessageContent({ ...props, content });
}

function PatchedMessageAccessories({ children, message, depth, compact }) {
    const messageLinks = renderMessageMarkupToAST(message)
        .content.filter(({ type }) => type === EmbedTypes.LINK)
        .map(({ target }) => target.match(linkRegex))
        .filter(Boolean);
    return BdApi.React.createElement(
        BdApi.React.Fragment,
        null,
        messageLinks.map(([href, _guildId, channelId, messageId], index) =>
            BdApi.React.createElement(
                BdApi.React.Fragment,
                null,
                BdApi.React.createElement(MessageEmbed, {
                    channelId: channelId,
                    messageId: messageId,
                    href: href,
                    depth: (depth ?? 0) + 1,
                    compact: compact,
                }),
                index !== messageLinks.length - 1 && BdApi.React.createElement('br', null)
            )
        ),
        children
    );
}

function ErrorMessage({ href, children, type }) {
    return BdApi.React.createElement(
        Anchor,
        {
            href: href,
            className: 'messageEmbed',
        },
        BdApi.React.createElement(
            HelpMessage,
            {
                messageType: type,
            },
            children
        )
    );
}

function MessagePreviewHeader({ channel, message, compact, popouts, setPopout }) {
    const author = useAuthor(message);
    const roleIcon = useRoleIcon({
        guildId: channel.guild_id,
        roleId: author.iconRoleId,
    });
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
    return BdApi.React.createElement(MessageHeader, {
        guildId: channel.guild_id,
        showAvatarPopout: popouts.avatarProfile,
        showUsernamePopout: popouts.usernameProfile,
        subscribeToGroupId: message.id,
        renderPopout: renderUserGuildPopout,
        ...{
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
        },
    });
}

const MemoizedMessagePreviewHeader = memo(MessagePreviewHeader);

function MessagePreview({ channel, message, compact, depth }) {
    const [hovered, setHovered] = useState(false);
    const [interactive] = useSetting('interactive');
    const { popouts, setPopout } = usePopout(message.id, DEFAULT_POPOUTS);
    const messageReferenceState = useStateFromStores([ReferencedMessageStore], () =>
        ReferencedMessageStore.getMessageByReference(message.messageReference)
    );

    function fromWithinContainer({ target, relatedTarget }) {
        if (!(target instanceof HTMLElement && relatedTarget instanceof HTMLElement)) return false;
        return target.closest('.messageEmbed') === relatedTarget.closest('.messageEmbed');
    }

    function onHover(event) {
        event.stopPropagation();
        if (fromWithinContainer(event)) return;
        setHovered(event.type === 'mouseover');
    }

    const onContextMenu = useContextMenuMessage(message, channel, setPopout);
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
    const interactiveProps = interactive
        ? {
              onContextMenu,
              childrenRepliedMessage,
              childrenHeader:
                  USER_MESSAGE_TYPES.has(message.type) &&
                  BdApi.React.createElement(MemoizedMessagePreviewHeader, {
                      ...{
                          channel,
                          message,
                          compact,
                          popouts,
                          setPopout,
                      },
                  }),
          }
        : {
              className: 'disableInteraction',
          };
    return BdApi.React.createElement(
        'div',
        {
            className: 'messageEmbed',
            onMouseOver: onHover,
            onMouseOut: onHover,
            onContextMenu: interactive ? onContextMenu : undefined,
        },
        BdApi.React.createElement(ChannelMessage, {
            ...{
                channel,
                message,
                compact,
            },
            ...interactiveProps,
            childrenButtons:
                hovered &&
                BdApi.React.createElement(
                    'div',
                    {
                        className: 'button-cfOvv- jumpButton',
                        role: 'button',
                        onClick: () => transitionToGuild(channel.guild_id, message.channel_id, message.id),
                    },
                    'Jump'
                ),
            childrenAccessories: BdApi.React.createElement(ConnectedMessageAccessories, {
                ...{
                    channel,
                    message,
                    compact,
                    depth,
                },
            }),
            renderThreadAccessory: true,
        })
    );
}

function MessageEmbed({ channelId, messageId, depth, href, compact }) {
    const [maxDepth] = useSetting('maxDepth');
    const cache = useMessageCache(channelId, messageId);

    if (!cache) {
        return BdApi.React.createElement(
            'div',
            {
                className: 'messageEmbed',
            },
            BdApi.React.createElement(MessagePlaceholder, {
                messages: 1,
                compact: compact,
            })
        );
    }

    if (cache.status === 'ERROR') {
        return BdApi.React.createElement(
            ErrorMessage,
            {
                type: cache.errorType,
                href: href,
            },
            cache.errorMessage
        );
    }

    if (depth > maxDepth) {
        return BdApi.React.createElement(
            ErrorMessage,
            {
                type: 0,
                /* HelpMessageTypes.WARNING */
                href: href,
            },
            'Maximum depth exceeded'
        );
    }

    const channel = ChannelStore.getChannel(channelId);

    if (!channel) {
        return BdApi.React.createElement(
            ErrorMessage,
            {
                type: 0,
                /* HelpMessageTypes.WARNING */
                href: href,
            },
            formatErrorMessage(LocaleMessages.REPLY_QUOTE_MESSAGE_NOT_LOADED, 'Channel could not be found')
        );
    }

    return BdApi.React.createElement(MessagePreview, {
        channel: channel,
        message: cache.message,
        depth: depth,
    });
}

function SettingsPanel() {
    const [interactive, setInteractive] = useSetting('interactive');
    const [hideLinks, setHideLinks] = useSetting('hideLinks');
    const [maxDepth, setMaxDepth] = useSetting('maxDepth');
    const [minValue, maxValue] = [1, 10];
    const markers = [...Array(maxValue - minValue + 1).keys()].map((n) => n + minValue);
    return BdApi.React.createElement(
        FormSection,
        null,
        BdApi.React.createElement(
            SwitchItem,
            {
                value: hideLinks,
                onChange: () => setHideLinks(!hideLinks),
                note: 'Hide the link an embedded message was referred from when it is embedded.',
            },
            'Hide Message Links'
        ),
        BdApi.React.createElement(
            SwitchItem,
            {
                value: interactive,
                onChange: () => setInteractive(!interactive),
                note: 'Make embedded messages interactive. Allows reactions, context menu and user popouts to be accessed from the embed itself.',
            },
            'Interactive'
        ),
        BdApi.React.createElement(FormTitle, null, 'Maximum Depth'),
        BdApi.React.createElement(
            FormText,
            {
                type: 'description',
                style: {
                    marginBottom: 20,
                },
            },
            'The maximum depth that embedded messages links can be nested within each other'
        ),
        BdApi.React.createElement(Slider, {
            onValueChange: setMaxDepth,
            markers: markers,
            minValue: minValue,
            maxValue: maxValue,
            initialValue: maxDepth,
            keyboardStep: 1,
            handleSize: 10,
            equidistant: true,
            stickToMarkers: true,
        })
    );
}

const MESSAGE_CREATE = ({ message }) => {
    if (!has(message.channel_id, message.id)) return;
    set(message.channel_id, message.id, {
        status: 'SUCCESS',
        message: createMessageRecord(message),
    });
};

const MESSAGE_UPDATE = ({ message }) => {
    const cachedMessage = get(message.channel_id, message.id);
    if (cachedMessage?.status !== 'SUCCESS') return;
    set(message.channel_id, message.id, {
        status: 'SUCCESS',
        message: updateMessageRecord(cachedMessage.message, message),
    });
};

const MESSAGE_DELETE = ({ channelId, id }) => {
    if (!has(channelId, id)) return;
    set(channelId, id, {
        status: 'ERROR',
        errorType: 2,
        /* HelpMessageTypes.ERROR */
        errorMessage: LocaleMessages.REPLY_QUOTE_MESSAGE_DELETED,
    });
};

const MESSAGE_REACTION_ADD = ({ channelId, messageId, userId, emoji, optimistic }) => {
    const self = userId === UserStore.getId();
    if (!optimistic && self) return;
    if (!optimistic && userId === UserStore.getId()) return;
    const cachedMessage = get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;
    set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.addReaction(emoji, self),
    });
};

const MESSAGE_REACTION_REMOVE = ({ channelId, messageId, userId, emoji, optimistic }) => {
    const self = userId === UserStore.getId();
    if (!optimistic && self) return;
    const cachedMessage = get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;
    set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.removeReaction(emoji, self),
    });
};

const MESSAGE_REACTION_REMOVE_ALL = ({ channelId, messageId }) => {
    const cachedMessage = get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;
    set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.set('reactions', []),
    });
};

const MESSAGE_REACTION_REMOVE_EMOJI = ({ channelId, messageId, emoji }) => {
    const cachedMessage = get(channelId, messageId);
    if (cachedMessage?.status !== 'SUCCESS') return;
    set(channelId, messageId, {
        status: 'SUCCESS',
        message: cachedMessage.message.removeReactionsForEmoji(emoji),
    });
};

var subscriptions = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    MESSAGE_CREATE: MESSAGE_CREATE,
    MESSAGE_UPDATE: MESSAGE_UPDATE,
    MESSAGE_DELETE: MESSAGE_DELETE,
    MESSAGE_REACTION_ADD: MESSAGE_REACTION_ADD,
    MESSAGE_REACTION_REMOVE: MESSAGE_REACTION_REMOVE,
    MESSAGE_REACTION_REMOVE_ALL: MESSAGE_REACTION_REMOVE_ALL,
    MESSAGE_REACTION_REMOVE_EMOJI: MESSAGE_REACTION_REMOVE_EMOJI,
});
var css_248z =
    '.messageEmbed {\n  background: var(--background-secondary);\n  color: var(--text-normal);\n  display: inline-block;\n  pointer-events: auto;\n  position: relative;\n  border-radius: 4px;\n  max-width: 100%;\n  margin: 2px 0;\n}\n.messageEmbed > * {\n  --background-secondary: rgba(0, 0, 0, 0.1);\n  --background-secondary-alt: rgba(0, 0, 0, 0.1);\n  padding-right: 48px;\n  background: none;\n  border: none;\n}\n.messageEmbed .wrapper-15CKyy {\n  background: none;\n}\n\n.jumpButton {\n  pointer-events: auto;\n  background: rgba(0, 0, 0, 0.2);\n  position: absolute;\n  right: 4px;\n  top: 4px;\n}\n\n.compact-2Nkcau.hasThread-3h-KJV > .messageEmbed:before {\n  background-color: var(--background-accent);\n  position: absolute;\n  content: "";\n  top: -2px;\n  bottom: -2px;\n  left: -2.5rem;\n  width: 2px;\n}\n\n.disableInteraction {\n  pointer-events: none;\n}';
const JumpingActionIds = new Set(['edit', 'reply', 'mark-unread']);

function traverseMenuItems({ props }, callback) {
    if (props.action) return callback(props);

    for (const child of props.children ?? []) {
        if (!child?.props) continue;
        traverseMenuItems(child, callback);
    }
}

function patchContextMenu(_, [{ target, message, channel }], contextMenu) {
    if (!target.closest('.messageEmbed')) return contextMenu;
    traverseMenuItems(contextMenu, (props) => {
        const { action, id } = props;
        if (!JumpingActionIds.has(id)) return;

        props.action = (...args) => {
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

function start() {
    Object.entries(subscriptions).forEach(([rpcEvent, callback]) => Dispatcher.subscribe(rpcEvent, callback));
    Patcher.instead(MessageContent, 'type', (_, [props], MessageContent) =>
        BdApi.React.createElement(PatchedMessageContent, {
            MessageContent: MessageContent,
            ...props,
        })
    );
    Patcher.after(MessageAccessories.prototype, 'render', ({ props }, _, otherAccessories) =>
        BdApi.React.createElement(PatchedMessageAccessories, { ...props }, otherAccessories)
    );
    Patcher.after(MessageStore, 'getMessage', (_, [channelId, messageId], returnValue) => {
        const cachedMessage = get(channelId, messageId);
        if (cachedMessage?.status !== 'SUCCESS') return;
        return cachedMessage.message;
    });
    injectCSS(css_248z);

    const patchContextMenuModule = (ContextMenuModule) => Patcher.after(ContextMenuModule, 'default', patchContextMenu);

    MessageContextMenuModulePromise.then(patchContextMenuModule);
    SystemMessageContextMenuModulePromise.then(patchContextMenuModule);
}

function stop() {
    MessageContextMenuModuleAbortController.abort();
    SystemMessageContextMenuModuleAbortController.abort();
    Object.entries(subscriptions).forEach(([rpcEvent, callback]) => Dispatcher.unsubscribe(rpcEvent, callback));
    Patcher.unpatchAll();
    clearCSS();
}

function getSettingsPanel() {
    return BdApi.React.createElement(SettingsPanel, null);
}

exports.getSettingsPanel = getSettingsPanel;
exports.start = start;
exports.stop = stop;

module.exports = () => exports;
