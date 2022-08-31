import type {
    AriaAttributes,
    ComponentClass,
    CSSProperties,
    FunctionComponent,
    MemoExoticComponent,
    MouseEventHandler,
    ReactNode,
    RefObject,
} from 'react';
import type { AttachmentObject, ChannelRecord, MessageRecord, snowflake } from './types';
import { getModule, waitForModule } from 'bdapi/Webpack';
import { byDisplayName, byProps } from 'bdapi/Webpack/Filters';
import { Author, Popouts, PopoutRenderer } from './utils';
import { MessageReferenceState } from './stores';

export interface MessagePlaceholderProps {
    messages?: number;
    compact?: boolean;
    groupSpacing?: number;
    attachmentSpacts?: {
        width: number;
        height: number;
    };
}

export interface MessageComponentProps {
    id?: snowflake;
    className?: string;
    message?: MessageRecord;
    channel?: ChannelRecord;
    compact?: boolean;
    flashKey?: boolean;
    groupId?: string;
    isHighlight?: boolean;
    isLastItem?: boolean;
    [key: string]: any;
}

export interface MessageContentProps {
    message: MessageRecord;
    className?: string;
    children?: ReactNode;
    content?: ReactNode[];
    onUpdate?(): void;
    contentRef?: RefObject<HTMLDivElement>;
}

export interface ChannelMessageProps {
    message: MessageRecord;
    compact?: boolean;
    className?: string;
    onContextMenu?: MouseEventHandler;
    onClick?(): void;
    disableInteraction?: boolean;
    renderMediaEmbeds?: boolean;
    isGroupStart?: boolean;
    animateAvatar?: boolean;
    subscribeToComponentDispatch?: boolean;
    renderThreadAccessory?: boolean;
    childrenButtons?: ReactNode;
    childrenAccessories?: ReactNode;
    childrenHeader?: ReactNode;
    childrenRepliedMessage?: ReactNode;
    [key: string]: any;
}

export interface AnchorProps {
    href?: string;
    onClick?(): void;
    className?: string;
    children?: ReactNode;
    rel?: string;
    target?: string;
    useDefaultUnderlineStyles?: boolean;
    title?: string;
    style?: CSSProperties;
    focusProps?: any;
    [key: string]: any;
}

export const enum MarkerPositions {
    ABOVE,
    BELOW,
}

export interface SliderProps
    extends Pick<AriaAttributes, 'aria-hidden' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'> {
    className?: string;
    children?: ReactNode;
    initialValue?: number;
    minValue?: number;
    maxValue?: number;
    keyboardStep?: number;
    handleSize?: number;
    disabled?: boolean;
    stickToMarkers?: boolean;
    fillStyles?: CSSProperties;
    barStyles?: CSSProperties;
    mini?: boolean;
    hideBubble?: boolean;
    defaultValue?: number;
    equidistant?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onValueChange?(value: number): void;
    onValueRender?(value: number): void;
    onMarkerRender?(value: number): void;
    renderMarker?(value: number): void;
    getAriaValueText?(value: number): void;
    asValueChanges?(value: number): void;
    barClassName?: string;
    grabberClassName?: string;
    grabberStyles?: string;
    markerPosition?: MarkerPositions;
    markers?: number[];
}

export type HeaderTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export interface FormSectionProps {
    children?: ReactNode;
    className?: string;
    titleClassName?: string;
    title?: string;
    icon?: ReactNode;
    disabled?: boolean;
    tag?: HeaderTag;
    titleId?: string;
}

export interface FormTitleProps {
    tag?: HeaderTag;
    children?: ReactNode;
    className?: string;
    faded?: boolean;
    disabled?: boolean;
    required?: boolean;
    error?: ReactNode;
}

export interface FormTextProps {
    type?:
        | 'default'
        | 'placeholder'
        | 'description'
        | 'labelBold'
        | 'labelSelected'
        | 'labelDescriptor'
        | 'error'
        | 'success';
    className?: string;
    disabled?: boolean;
    selectable?: boolean;
    children?: ReactNode;
    style?: CSSProperties;
    [key: string]: any;
}

export interface SwitchItemProps {
    className?: string;
    style?: CSSProperties;
    note?: ReactNode;
    value?: boolean;
    disabled?: boolean;
    hideBorder?: boolean;
    tooltipNote?: string;
    helpdeskArticleId?: string;
    children?: ReactNode;
    onChange?(): void;
}

export interface MessageContextMenuProps {
    channel: ChannelRecord;
    message: MessageRecord;
    target: HTMLElement;
    attachment?: AttachmentObject;
    onSelect?(): void;
    onHeightUpdate?(): void;
    children: ReactNode[];
}

export const enum HelpMessageTypes {
    WARNING,
    INFO,
    ERROR,
    POSITIVE,
}

export const enum HelpMessageFontSizes {
    FONT_SIZE_14,
    FONT_SIZE_16,
}

export interface HelpMessageProps {
    children?: ReactNode;
    messageType?: HelpMessageTypes;
    className?: string;
    textClassName?: string;
    fontSize?: HelpMessageFontSizes;
}

export interface MessageAccessoriesProps {
    channel?: ChannelRecord;
    message?: MessageRecord;
    className?: string;
    isCurrentUser?: boolean;
    compact?: boolean;
    renderThreadAccessory?: boolean;
    isInteracting?: boolean;
    renderComponentAccessory?: boolean;
    renderEmbeds?: boolean;
    gifAutoPlay?: boolean;
    canDeleteAttachents?: boolean;
    inlineAttachmentMedia?: boolean;
    onAttachmentContextMenu?(event: MouseEvent, attachment: any): void;
    disableReactionCreates?: boolean;
    disableReactionReads?: boolean;
    isLurking?: boolean;
    isPendingMember?: boolean;
    forceAddReactions?: boolean;
    [key: string]: any;
}

export interface MessageAccessoriesComponent extends ComponentClass<MessageAccessoriesProps> {
    prototype: {
        constructor(): MessageAccessoriesComponent;
        render(): ReactNode;
        renderActivityInvite(message: MessageRecord): ReactNode;
        renderAttachments(message: MessageRecord): ReactNode;
        renderCodedLinks(message: MessageRecord): ReactNode;
        renderComponentAccessories(message: MessageRecord): ReactNode;
        renderEmbeds(message: MessageRecord): ReactNode;
        renderEphemeralAccessories(message: MessageRecord): ReactNode;
        renderGiftCodes(message: MessageRecord): ReactNode;
        renderPublishBump(message: MessageRecord): ReactNode;
        renderReactions(message: MessageRecord): ReactNode;
        renderRemoveAttachmentConfirmModal(message: MessageRecord): ReactNode;
        renderStickersAccessories(message: MessageRecord): ReactNode;
        renderSuppressConfirmModal(message: MessageRecord): ReactNode;
        renderThreadAccessories(message: MessageRecord): ReactNode;
        renderThreadRoleMentionWarning(message: MessageRecord): ReactNode;
        shouldComponentUpdate(nextProps: MessageAccessoriesProps, nextState: any): boolean;
        shouldRenderInvite(code: string): boolean;
        _createAttachmentOnClickOverrides(attacments: AttachmentObject[]): ((event: MouseEvent) => void)[];
        _messageAttachmentToEmbedMedia(attachment: AttachmentObject): {
            height: number;
            width: number;
            proxyURL: string;
            url: string;
        };
    };
}

export type ClickablePropsWithTag<T extends keyof JSX.IntrinsicElements> = { tag: T } & JSX.IntrinsicElements[T];
export type ClickableProps = JSX.IntrinsicElements['div'] | ClickablePropsWithTag<keyof JSX.IntrinsicElements>;
export const Clickable: ComponentClass<ClickableProps> = getModule(byDisplayName('Clickable'));

export const MessagePlaceholder: FunctionComponent<MessagePlaceholderProps> = getModule(
    byProps('HEIGHT_COZY_MESSAGE_START')
).default;
export const MessageComponent: MemoExoticComponent<FunctionComponent<MessageComponentProps>> = getModule(
    byProps('getElementFromMessageId')
).default;
export const MessageContent: MemoExoticComponent<FunctionComponent<MessageContentProps>> = getModule(
    (m) => m.default?.type?.displayName === 'MessageContent'
).default;
export const ChannelMessage: MemoExoticComponent<FunctionComponent<ChannelMessageProps>> = getModule(
    (m) => m.default?.type?.displayName === 'ChannelMessage'
).default;
export const Anchor: FunctionComponent<AnchorProps> = getModule(byDisplayName('Anchor'));
export const Slider: ComponentClass<SliderProps> = getModule(byDisplayName('Slider'));
export const FormSection: FunctionComponent<FormSectionProps> = getModule(byDisplayName('FormSection'));
export const FormTitle = getModule(byDisplayName('FormTitle'));
export const FormText: FunctionComponent<FormTextProps> = getModule(byDisplayName('FormText'));
export const SwitchItem: FunctionComponent<SwitchItemProps> = getModule(byDisplayName('SwitchItem'));
export const HelpMessage: FunctionComponent<HelpMessageProps> = getModule(byProps('HelpMessageTypes')).default;

interface MessageHeaderProps {
    author: Author;
    channel: ChannelRecord;
    compact?: boolean;
    guildId?: snowflake;
    message: MessageRecord;
    onClickAvatar?(): void;
    onClickUsername?(): void;
    onContextMenu?(): void;
    onPopoutRequestClose?(): void;
    repliedMessage: MessageReferenceState;
    roleIcon?: unknown;
    showAvatarPopout?: boolean;
    showTimestampOnHover?: boolean;
    showUsernamePopout?: boolean;
    subscribeToGroupId: snowflake;
    renderPopout: PopoutRenderer;
}

export const MessageHeader: FunctionComponent<MessageHeaderProps> = getModule(byDisplayName('MessageHeader'));

interface ChildrenHeaderProps {
    messageProps: MessageComponentProps;
    setPopout: (popout: Partial<Popouts>) => void;
    messagePopouts: Popouts;
    replyReference?: MessageRecord['messageReference'];
    author: Author;
    repliedMessage: unknown;
    roleIcon: unknown;
}

export const ChildrenHeader: FunctionComponent<ChildrenHeaderProps> = getModule((m) =>
    m.default.toString().includes('messagePopouts')
);

export const {
    default: ConnectedMessageAccessories,
    MessageAccessories,
}: {
    default: FunctionComponent<MessageAccessoriesProps>;
    MessageAccessories: MessageAccessoriesComponent;
} = getModule(byProps('MessageAccessories'));

export const MessageContextMenuModulePromise: Promise<{ default: FunctionComponent<MessageContextMenuProps> }> =
    waitForModule((m) => m.default.displayName === 'MessageContextMenu');
export const SystemMessageContextMenuModulePromise: Promise<{ default: FunctionComponent<MessageContextMenuProps> }> =
    waitForModule((m) => m.default.displayName === 'SystemMessageContextMenu');
