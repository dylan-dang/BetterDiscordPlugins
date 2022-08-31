import type { Moment, Duration } from 'moment';

type WebpackId = string | number;

interface WebpackRequire {
    (WebpackId): any;
    [key: string]: unknown; //some stuff
}

type WebpackChunk = [
    WebpackId[],
    {
        [key: WebpackId]: (module, exports, require) => void;
    },
    (require: WebpackRequire) => void
];

declare global {
    const webpackChunkdiscord_app: WebpackChunk[];
    interface Window {
        webpackChunkdiscord_app: WebpackChunk[];
    }
}

export type snowflake = `${number}`;
export type timestamp = string;

export interface ThreadMetadata {
    /**
     * whether the thread is archived
     */
    archived: boolean;
    /**
     * duration in minutes to automatically archive the thread after recent activity
     */
    autoArchiveDuration: 60 | 1440 | 4320 | 10080;
    /**
     * timestamp when the thread's archive status was last changed, used for calculating recent activity
     */
    archiveTimestamp: timestamp;
    /**
     * whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it
     */
    locked: boolean;
    /**
     * whether non-moderators can add other non-moderators to a thread; only available on private threads
     */
    invitable?: boolean;
    /**
     * timestamp when the thread was created; only populated for threads created after 2022-01-09
     */
    createTimestamp?: timestamp;
}

export interface ThreadMember {
    /**
     * the id of the thread
     */
    id?: snowflake;
    /**
     * the id of the user
     */
    userId?: snowflake;
    /**
     * the time the current user last joined the thread
     */
    joinTimestamp: timestamp;
    /**
     * any user-thread settings, currently only used for notifications
     */
    flags: number;
}

export const enum ChannelType {
    GUILD_TEXT = 0,
    DM,
    GUILD_VOICE,
    GROUP_DM,
    GUILD_CATEGORY,
    GUILD_NEWS,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD,
    GUILD_PRIVATE_THREAD,
    GUILD_STAGE_VOICE,
    GUILD_DIRECTORY,
    GUILD_FORUM,
}

export interface UserObject {
    /**
     * the user's id
     */
    id: snowflake;

    /**
     * the user's username, not unique across the platform
     */
    username: string;

    /**
     * the user's 4-digit discord-tag
     */
    discriminator: string;

    /**
     * the user's avatar hash
     */
    avatar: string;

    /**
     * whether the user belongs to an OAuth2 application
     */
    bot?: boolean;

    /**
     * whether the user is an Official Discord System user (part of the urgent message system)
     */
    system?: boolean;

    /**
     * whether the user has two factor enabled on their account
     */
    mfa_enabled?: boolean;

    /**
     * the user's banner hash
     */
    banner?: string;

    /**
     * the user's banner color encoded as an integer representation of hexadecimal color code
     */
    accent_color?: number;

    /**
     * the user's chosen language option
     */
    locale?: string;

    /**
     * whether the email on this account has been verified email
     */
    verified?: boolean;

    /**
     * the user's email email
     */
    email?: string;

    /**
     * the flags on a user's account
     */
    flags?: number;

    /**
     * the type of Nitro subscription on a user's account
     */
    premium_type?: number;

    /**
     * the public flags on a user's account
     */
    public_flags?: number;
}

export interface PermissionOverwrite {
    /**
     * role or user id
     */
    id: snowflake;
    /**
     * 0 for role, 1 for member
     */
    type: 0 | 1;
    /**
     * permission bit set
     */
    allow: bigint;
    /**
     * permission bit set
     */
    deny: bigint;
}

export interface ChannelRecord {
    /**
     * the id of the channel
     */
    id: snowflake;
    /**
     * the type of the cahnnel
     */
    type: ChannelType;
    /**
     * the id of the guild (may be missing for some channel objects received over gateway guild dispatches)
     */
    guild_id?: snowflake;
    /**
     * sorting position of the channel
     */
    position: number;
    /**
     * explicit permission overwrites for members and roles
     */
    permissionOverwrites?: {
        [key: snowflake]: PermissionOverwrite;
    };
    /**
     * the name of the channel (1-100 characters)
     */
    name: string;
    /**
     * the channel topic (0-1024 characters)
     */
    topic: string;
    /**
     * whether the channel is nsfw
     */
    nsfw?: boolean;
    /**
     * the id of the last message sent in this channel (or thread for <code>GUILD_FORUM</code> channels) (may not point to an existing or valid message or thread)
     */
    lastMessageId?: snowflake;
    /**
     * the bitrate (in bits) of the voice channel
     */
    bitrate: number;
    /**
     * the user limit of the voice channel
     */
    userLimit?: number;
    /**
     * amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected
     */
    rateLimitPerUser?: number;
    /**
     * the recipients of the DM
     */
    rawRecipients: UserObject[];
    /**
     * the id of the recients of the DM
     */
    recipients: snowflake[];
    /**
     * icon hash of the group DM
     */
    icon?: string;
    /**
     * id of the creator of the group DM or thread
     */
    ownerId?: snowflake;
    /**
     * application id of the group DM creator if it is bot-created
     */
    application_id?: snowflake;
    /**
     * for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created
     */
    parent_id?: snowflake;
    /**
     * when the last pinned message was pinned. This may be null in events such as <code>GUILD_CREATE</code> when a message is not pinned.
     */
    lastPinTimeStamp?: timestamp;
    /**
     * voice region id for the voice channel, automatic when set to null
     */
    rtcRegion?: string;
    /**
     * the camera video quality mode of the voice channel, 1 when not present
     */
    videoQualityMode?: number;
    /**
     * an approximate count of messages in a thread, stops counting at 50
     */
    messageCount?: number;
    /**
     * an approximate count of users in a thread, stops counting at 50
     */
    memberCount?: number;
    /**
     * thread-specific fields not needed by other channels
     */
    threadMetadata?: ThreadMetadata;
    /**
     * thread member object for the current user, if they have joined the thread, only included on certain API endpoints
     */
    member?: ThreadMember;
    /**
     * ids of previewed members
     */
    memberIdsPreview?: snowflake[];
    /**
     * default duration that the client will use for newly created threads, in minutes, to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
     */
    defaultAutoArchiveDuration?: 60 | 1440 | 4320 | 10080;
    /**
     * computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction
     */
    permissions?: string;
    /**
     * channel flags combined as a bitfield
     */
    flags: number;
    appliedTags: any[];
    availableTags: any[];
    memberListId?: snowflake;
    nicks?: {};
    originChannelId?: snowflake;
    parentChannelThreadType?: number;
    template?: any;
    /**
     * @returns <code>LURKER_STAGE_CHANNEL_PERMISSIONS_ALLOWLIST</code> if channel is a public stage channel
     */
    computeLurkerPermissionsAllowList(): { [key: string]: bigint | Set<bigint> };
    /**
     * @returns id of the bot that created the dm
     */
    getApplicationId(): snowflake;
    /**
     * @returns id of the guild
     */
    getGuildId(): snowflake;
    /**
     * @returns id of first recipient
     */
    getRecipientId(): snowflake;
    /**
     * @returns whether channel has flag
     * @param flag flag to be checked
     */
    hasFlag(flag: number): boolean;
    /**
     * @returns whether channel is an active thread
     */
    isActiveThread(): boolean;
    /**
     * @returns whether channel is an archived thread
     */
    isArchivedThread(): boolean;
    /**
     * @returns whether channel is a guild category
     */
    isCategory(): boolean;
    /**
     * @returns whether channel is a DM
     */
    isDM(): boolean;
    /**
     * @returns whether the channel is a guild directory
     */
    isDirectory(): boolean;
    /**
     * @returns whether the channel is a forum channel
     */
    isForumChannel(): boolean;
    /**
     * @returns whether the channel is a forum post
     */
    isForumPost(): boolean;
    /**
     * @returns whether channel is a group dm
     */
    isGroupDM(): boolean;
    /**
     * @returns whether channel is a stage
     * @alias isListenModeCapable
     */
    isGuildStageVoice(): boolean;
    /**
     * @returns whether channel is a voice channel
     */
    isGuildVoice(): boolean;
    /**
     * @returns whether channel is a stage channel
     * @alias isGuildStageVoice
     */
    isListenModeCapable(): boolean;
    /**
     * @returns whether channel is bot created
     */
    isManaged(): boolean;
    /**
     * @returns whether channel is a multi user DM
     */
    isMultiUserDM(): boolean;
    /**
     * @returns whether channel is NFSW
     */
    isNSFW(): boolean;
    /**
     * @returns whether specified user is owner of the channel
     * @param userId id of user to check
     */
    isOwner(userId: snowflake): boolean;
    /**
     * @returns whether channel is a DM or group DM
     */
    isPrivate(): boolean;
    /**
     * @returns whether channel is a DM from an Official Discord System user (part of the urgent message system)
     */
    isSystemDM(): boolean;
    /**
     * @returns whether channel is a thread
     */
    isThread(): boolean;
    /**
     * @returns whether channel is a voice channel or stage
     */
    isVocal();
}

export const enum MessageTypes {
    DEFAULT,
    RECIPIENT_ADD,
    RECIPIENT_REMOVE,
    CALL,
    CHANNEL_NAME_CHANGE,
    CHANNEL_ICON_CHANGE,
    CHANNEL_PINNED_MESSAGE,
    USER_JOIN,
    GUILD_BOOST,
    GUILD_BOOST_TIER_1,
    GUILD_BOOST_TIER_2,
    GUILD_BOOST_TIER_3,
    CHANNEL_FOLLOW_ADD,
    GUILD_DISCOVERY_DISQUALIFIED,
    GUILD_DISCOVERY_REQUALIFIED,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING,
    THREAD_CREATED,
    REPLY,
    CHAT_INPUT_COMMAND,
    THREAD_STARTER_MESSAGE,
    GUILD_INVITE_REMINDER,
    CONTEXT_MENU_COMMAND,
    AUTO_MODERATION_ACTION,
}

export interface AttachmentObject {
    /**
     * attachment id
     */
    id: snowflake;
    /**
     * name of file attached
     */
    filename: string;
    /**
     * description for the file
     */
    description?: string;
    /**
     * the attachment's media type
     */
    content_type?: string;
    /**
     * size of file in bytes
     */
    size: number;
    /**
     * source url of file
     */
    url: string;
    /**
     * a proxied url of file
     */
    proxy_url: string;
    /**
     * height of file (if image)
     */
    height?: string;
    /**
     * width of file (if image)
     */
    width?: string;
    /**
     * whether this attachment is ephemeral
     * Ephemeral attachments will automatically be removed after a set period of time.
     * Ephemeral attachments on messages are guaranteed to be available as long as the message itself exists.
     */
    ephemeral?: boolean;
}

export interface EmbedObject {
    title?: string;
    type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
    description?: string;
    url?: string;
    timestamp?: timestamp;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    thumbnail?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    video?: {
        url?: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    provider?: {
        name?: string;
        url?: string;
    };
    author?: {
        name: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
}

export interface RoleObject {
    id: snowflake;
    name: string;
    /**
     * 	integer representation of hexadecimal color code
     */
    color: number;
    /**
     * if this role is pinned in the user listing
     */
    hoist: boolean;
    /**
     * role icon hash
     */
    icon?: string;
    unicode_emoji?: string;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: {
        bot_id?: snowflake;
        integration_id?: snowflake;
        premium_subscriber?: boolean;
    };
}

export interface ChannelMentionObject {
    id: snowflake;
    guild_id: snowflake;
    type: ChannelType;
    name: string;
}

export interface EmojiObject {
    id: snowflake | null;
    name: string | null;
    roles?: RoleObject[];
    user?: UserObject;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
}

export interface ReactionObject {
    count: number;
    me: boolean;
    emoji: EmojiObject;
}

export type CodedLinkType = 'INVITE' | 'TEMPLATE' | 'BUILD_OVERRIDE' | 'EVENT' | 'CHANNEL_LINK';

export const enum MessageActivityTypes {
    JOIN = 1,
    SPECTATE,
    LISTEN,
    JOIN_REQUEST = 5,
}

export interface MessageRecord {
    id: snowflake;
    type: MessageTypes;
    channel_id: snowflake;
    author: UserObject;
    content: string;
    customRenderedContent?: unknown;
    attachments: AttachmentObject[];
    embeds: EmbedObject[];
    mentions: UserObject[];
    mentionRoles: RoleObject[];
    mentionChannels: ChannelMentionObject[];
    mentioned: boolean;
    pinned: boolean;
    mentionEveryone: boolean;
    tts: boolean;
    codedLinks: {
        type: CodedLinkType;
        code: string;
    }[];
    giftCodes: string[];
    timestamp?: Moment;
    editedTimestamp: Moment;
    state: 'SENDING' | 'SEND_FAILED' | 'SENT';
    nonce: number | string;
    blocked: boolean;
    call?: {
        participants: snowflake[];
        endedTimestamp: Moment;
        duration: Duration;
    };
    bot: boolean;
    webhookId?: snowflake;
    reactions: ReactionObject[];
    applicationId?: snowflake;
    application?: {
        id: snowflake;
        name: string;
        description: string;
        icon?: string;
        primarySkuId?: snowflake;
        coverImage?: string;
        deeplinkUri?: string;
    };
    activity: {
        type: MessageActivityTypes;
        party_id?: string;
    };
    messageReference?: {
        guild_id?: string;
        channel_id?: string;
        message_id?: string;
        fail_if_not_exists?: boolean;
    };
    flags: number;
    isSearchHit: boolean;
    stickers: [];
    stickerItems: [];
    components: ComponentObject[];
    loggingName?: string;
    colorString?: string;
    nick?: string;
    interaction?: {
        id: snowflake;
        type: MessageInteractionTypes;
        name: string;
        user: UserObject;
        member?: GuildMemberObject;
    };
    interactionData?: any;
    interactionError?: any;
    roleSubscriptionData?: any;
    addReaction(emoji: EmojiObject, self: boolean): MessageRecord;
    getChannelId(): string;
    getReaction(emoji: EmojiObject): ReactionObject;
    hasFlag(e): boolean;
    isCommandType(): boolean;
    isEdited(): boolean;
    isFirstMessageInForumPost(e: { isForumPost(): boolean }): boolean;
    isSystemDM(): boolean;
    removeReaction(emoji: EmojiObject, self: boolean): MessageRecord;
    removeReactionsForEmoji(e): MessageRecord;
    toJS(): MessageRecord;
    merge(obj: MessageRecord): MessageRecord;
    set<T extends keyof MessageRecord>(property: T, value: MessageRecord[T]): MessageRecord;
    update:
        | (<T extends keyof MessageRecord>(
              property: T,
              defaultValue: T | any,
              updater?: (oldValue: MessageRecord[T]) => MessageRecord[T]
          ) => MessageRecord)
        | (<T extends keyof MessageRecord>(
              property: T,
              updater?: (oldValue: MessageRecord[T]) => MessageRecord[T]
          ) => MessageRecord);
}

export interface GuildMemberObject {
    /**
     * 	the user this guild member represents
     */
    user: UserObject;
    /**
     * 	this user's guild nickname
     */
    nick?: string;
    /**
     * the member's guild avatar hash
     */
    avatar?: string;
    /**
     * 	array of role object ids
     */
    roles?: snowflake[];
    /**
     * 	when the user joined the guild
     */
    joined_at?: timestamp;
    /**
     * 	when the user started boosting the guild
     */
    premium_since?: timestamp;
    /**
     * 	whether the user is deafened in voice channels
     */
    deaf?: boolean;
    /**
     * whether the user is muted in voice channels
     */
    mute?: boolean;
    /**
     * whether the user has not yet passed the guild's Membership Screening requirements
     */
    pending?: boolean;
    /**
     * total permissions of the member in the channel, including overwrites, returned when in the interaction object
     */
    permissions?: string;
    /**
     * 	when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
     */
    communication_disabled_until?: timestamp;
}

export const enum MessageInteractionTypes {
    PING = 1,
    APPLICATION_COMMAND,
    MESSAGE_COMPONENT,
    APPLICATION_COMMAND_AUTOCOMPLETE,
    MODAL_SUBMIT,
}

export type ComponentObject =
    | ActionRowComponentObject
    | ButtonComponentObject
    | SelectMenuComponentObject
    | TextInputComponentObject;

export interface ActionRowComponentObject {
    type: 1;
    components: Exclude<ComponentObject, ActionRowComponentObject>[];
}

export const enum ButtonComponentStyles {
    Primary = 1,
    Secondary,
    Success,
    Danger,
    Link,
}

export interface ButtonComponentObject {
    type: 2;
    /**
     * 	one of button styles
     */
    style: ButtonComponentStyles;
    /**
     * text that appears on the button, max 80 characters
     */
    label?: string;
    /**
     * `name`, `id`, and `animated`
     */
    emoji?: EmojiObject;
    /**
     * a developer-defined identifier for the button, max 100 characters
     */
    custom_id?: string;
    /**
     * a url for link-style buttons
     */
    url?: string;
    /**
     * whether the button is disabled (default `false`)
     */
    disabled?: boolean;
}

export interface SelectMenuComponentObject {
    type: 3;
    /**
     * a developer-defined identifier for the select menu, max 100 characters
     */
    custom_id: string;
    /**
     * the choices in the select, max 25
     */
    options: {
        /**
         * 	the user-facing name of the option, max 100 characters
         */
        label: string;
        /**
         * 	the dev-defined value of the option, max 100 characters
         */
        value: string;
        /**
         * 	an additional description of the option, max 100 characters
         */
        description?: string;
        /**
         * `id`, `name`, and `animated`
         */
        emoji?: EmojiObject;
        /**
         * 	will render this option as selected by default
         */
        default?: boolean;
    }[];
    /**
     * custom placeholder text if nothing is selected, max 150 characters
     */
    placeholder?: string;
    /**
     * the minimum number of items that must be chosen; default 1, min 0, max 25
     */
    min_values?: number;
    /**
     * the maximum number of items that can be chosen; default 1, max 25
     */
    max_values?: number;
    /**
     * disable the select, default false
     */
    disabled?: boolean;
}

export const enum TextInputComponentStyles {
    Short = 1,
    Paragraph,
}

export interface TextInputComponentObject {
    type: 4;
    /**
     * a developer-defined identifier for the input, max 100 characters
     */
    custom_id: string;
    /**
     * the Text Input Style
     */
    style: TextInputComponentStyles;
    /**
     * the label for this component, max 45 characters
     */
    label: string;
    /**
     * the minimum input length for a text input, min 0, max 4000
     */
    min_length?: number;
    /**
     * the maximum input length for a text input, min 1, max 4000
     */
    max_length?: number;
    /**
     * whether this component is required to be filled, default true
     */
    required?: boolean;
    /**
     * a pre-filled value for this component, max 4000 characters
     */
    value?: string;
    /**
     * custom placeholder text if the input is empty, max 100 characters
     */
    placeholder?: string;
}
