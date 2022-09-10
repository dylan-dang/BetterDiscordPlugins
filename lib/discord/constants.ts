import { getModule } from 'bdapi/webpack';
import { byProps } from 'bdapi/webpack/filters';
import { Popouts } from './utils';

export { HelpMessageTypes, HelpMessageFontSizes } from './components';
export const Constants = getModule(byProps('Endpoints'));
export const { Endpoints, EmbedTypes, USER_MESSAGE_TYPES } = Constants;
export const { DEFAULT_POPOUTS }: { DEFAULT_POPOUTS: Popouts } = getModule(byProps('DEFAULT_POPOUTS'));
export const { Messages: LocaleMessages } = getModule(
    (m) => m.default?.Messages?.REPLY_QUOTE_MESSAGE_NOT_LOADED
).default;
export const linkRegex =
    /^^https?:\/\/(?:[\w-\.]+\.)?discord(?:app)?\.com(?:\:\d+)?\/channels\/(\d+|@me)\/(\d+)\/(\d+)(?:\/.*)?$/i;
