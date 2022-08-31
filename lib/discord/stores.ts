import type { DepGraph } from 'dependency-graph';
import type { ChannelRecord, MessageRecord, snowflake } from './types';
import { getModule } from 'bdapi/Webpack';
import { byProps } from 'bdapi/Webpack/Filters';

export interface ActionHandlerObject {
    name: string;
    actionHandler(): unknown;
    storeDidChange(): unknown;
}

export interface Action {
    type: string;
    [key: string]: any;
}

export interface DependencyGraph<T> extends DepGraph<T> {
    circular: boolean;
    incomingEdges: { [key: string]: string[] };
    nodes: { [key: string]: T };
    outgoingEdges: { [key: string]: string[] };
}

export interface Dispatcher {
    _isInitialized: boolean;
    _currentDispatchActionType: string;
    _dependencyGraph: DependencyGraph<ActionHandlerObject>;
    _interceptor(e: unknown): unknown;
    _lastID: number;
    _orderedActionHandlers: {
        [key: string]: ActionHandlerObject;
    };
    _orderedCallbackTokens: string[];
    _processingWaitQueue: boolean;
    _subscriptions: {
        [key: string]: Set<(action: any) => void>;
    };
    _waitQueue: ((...args: any) => any)[];
    addDependencies(fromNode: string, toNodes: string[]): void;
    dirtyDispatch(action: Action): void;
    dispatch(action: Action): void;
    isDispatching(): boolean;
    maybeDispatch(action: Action): void;
    register(actionType: string, actionHandler: (...args: any) => any, storeDidChange: (...args: any) => any): string;
    setInterceptor(interceptor: (...args: any) => any): void;
    subscribe(actionType: string, callback: (action: any) => void): void;
    unsubscribe(actionType: string, callback: (action: any) => void): void;
    wait<T>(e: (...args: any) => T): T | void;
    _computeOrderedActionHandlers(actionHandlerName: string): ActionHandlerObject[];
    _computeOrderedCallbackTokens(): string[];
    _dispatch(action: Action): void;
    _invalidateCaches(): void;
    _processWaitQueue(): void;
}

export interface Store {
    _isInitialized: boolean;
    _changeCallbacks: Set<(...args: any) => void>;
    _dispatchToken: `ID_${number}`;
    _dispatcher: Dispatcher;
    addChangeListener(changeListener: (...args: any) => void): void;
    addConditionalChangeListener(condition: (...args: any) => boolean, changeListener: (...args: any) => void): void;
    emitChange(): void;
    getDispatchToken(): string;
    getName(): string;
    hasChangeCallbacks(): boolean;
    initialize(): void;
    initializeIfNeeded(): void;
    mustEmitChanges(callback: (...args: any) => boolean): void;
    removeChangeListener(changeListener: (...args: any) => void): void;
    syncWith(stores: Store[], callback: (...args: any) => any, delay: number): void;
    waitFor(...stores: Store[]): void;
    __getLocalVars(): any;
}

export interface ChannelStore extends Store {
    getAllThreadsForParent(channelId: snowflake): ChannelRecord[];
    getBasicChannel(channelId: snowflake): ChannelRecord;
    getCachedChannelJsonForGuild(channelId: snowflake): any;
    getChannel(channelId: snowflake): ChannelRecord;
    getDMFromUserId(channelId: snowflake): ChannelRecord;
    getDMUserIds(): snowflake[];
    getGuildChannelsVersion(guildId: snowflake): number;
    getInitialOverlayState(): { [key: snowflake]: ChannelRecord };
    getMutableBasicGuildChannelsForGuild(guildId: snowflake): { [key: snowflake]: ChannelRecord };
    getMutableGuildChannelsForGuild(guildId: snowflake): { [key: snowflake]: ChannelRecord };
    getMutablePrivateChannels(): { [key: snowflake]: ChannelRecord };
    getPrivateChannelsVersion(): number;
    getSortedPrivateChannels(): ChannelRecord[];
    hasChannel(channelId: snowflake): boolean;
    hasRestoredGuild(id: snowflake): boolean;
    initialize(): void;
    loadAllGuildAndPrivateChannelsFromDisk(): { [key: snowflake]: ChannelRecord };
}

export interface MessageCache {
    _isCacheBefore: boolean;
    _map: {
        [key: snowflake]: MessageRecord;
    };
    _messages: MessageRecord[];
    _wasAtEdge: boolean;
    length: number;
    cache(messages: MessageRecord[], wasAtEdge: boolean): void;
    clear(): void;
    clone(): MessageCache;
    extract(amount: number): MessageRecord[];
    extractAll(): MessageRecord[];
    forEach(callbackfn: (message: MessageRecord, index: number, array: MessageRecord[]) => void, thisArg?: any): void;
    get(messageId: snowflake): MessageRecord;
    has(messageId: snowflake): boolean;
    remove(messageId: snowflake): void;
    removeMany(messageIds: snowflake[]): void;
    replace(messageId: snowflake, messageRecord: MessageRecord): void;
    update(messageId: snowflake, updatefn: (message: MessageRecord) => MessageRecord): void;
}

export type JumpType = 'ANIMATED' | 'INSTANT';

export interface MessageStore extends Store {
    getLastEditableMessage(channelId: snowflake): MessageRecord;
    getMessage(channelId: snowflake, messageId: snowflake): MessageRecord | undefined;
    getMessages(channelId: snowflake): {
        cached: boolean;
        channelId: snowflake;
        error: boolean;
        hasMoreAfter: boolean;
        hasMoreBefore: boolean;
        jumpFalse: boolean;
        jumpReturnTargetId: snowflake | null;
        jumpSequenceId: number;
        jumpTargetId: snowflake | null;
        jumpTargetOffset: number;
        jumpType: JumpType;
        jumped: boolean;
        jumpedToPresent: boolean;
        loadingMore: boolean;
        ready: boolean;
        revealedMessageId: snowflake | null;
        _after: MessageCache;
        _array: MessageRecord[];
        _before: MessageCache;
        _map: {
            [key: snowflake]: MessageRecord;
        };
        length: number;
    };
    getRawMessages(channelId: snowflake): {
        [key: snowflake]: MessageRecord;
    };
    hasCurrentUserSentMessage(channelId: snowflake): boolean;
    hasPresent(channelId: snowflake): boolean;
    initialize(): void;
    isLoadingMessages(channelId: snowflake): boolean;
    jumpedMessageId(channelId: snowflake): snowflake;
    whenReady(channelId: snowflake, callback: () => void): void;
}

export type LoginStatus =
    | 'ACCOUNT_DISABLED'
    | 'ACCOUNT_SCHEDULED_FOR_DELETION'
    | 'FORGOT_PASSWORD'
    | 'LOGGING_IN'
    | 'LOGGING_IN_MFA'
    | 'LOGGING_IN_MFA_SMS'
    | 'LOGIN_AGE_GATE'
    | 'MFA_SMS_STEP'
    | 'MFA_STEP'
    | 'NONE'
    | 'PASSWORD_RECOVERY_VERIFY_PHONE'
    | 'PHONE_IP_AUTHORIZATION';

export type RegisterStatus = 'NONE' | 'REGISTERING' | 'REGISTER_AGE_GATE' | 'REGISTER_WITH_ERROR';

export interface UserStore extends Store {
    allowLogoutRedirect(): boolean;
    didVerifyFail(): boolean;
    didVerifySucceed(): boolean;
    getAnalyticsToken(): string;
    getCredentials(): unknown;
    getCurrentRegistrationOptions(): unknown;
    getEmail(): string;
    getErrors(): unknown;
    getFingerprint(): unknown;
    getId(): snowflake;
    getLogin(): unknown;
    getLoginStatus(): LoginStatus;
    getMFASMS(): boolean;
    getMFATicket(): string;
    getMaskedPhone(): string;
    getRegisterStatus(): RegisterStatus;
    getSessionId(): string;
    getToken(): string;
    getVerifyErrors(): unknown;
    getVerifyingUserId(): unknown;
    initialize(): void;
    isAuthenticated(): boolean;
}

export type MessageReferenceState = { state: number };

export interface ReferencedMessageStore extends Store {
    getMessage(e: unknown, t: unknown): unknown;
    getMessageByReference(reference: MessageRecord['messageReference']): MessageReferenceState;
    getReplyIdsForChannel(e: unknown): unknown;
    initialize(): void;
}

export const ChannelStore: ChannelStore = getModule(byProps('getChannel', 'getDMFromUserId'));
export const MessageStore: MessageStore = getModule(byProps('getMessages'));
export const UserStore: UserStore = getModule(byProps('getSessionId'));
export const ReferencedMessageStore: ReferencedMessageStore = getModule(byProps('getMessageByReference'));
export const Dispatcher = ChannelStore._dispatcher;
