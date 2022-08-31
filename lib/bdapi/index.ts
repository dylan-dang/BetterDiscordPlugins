import { PatchCallback, Patcher as PatcherType } from '../../typings/bdapi';
import { BindObject, BindedObject } from '../utils';

/**
 * This will be replaced with the plugin name when transpiled
 */
declare const __PLUGIN_NAME__: string;

export const { clearCSS, injectCSS, deleteData, loadData, saveData, getData, setData } = BindObject(
    BdApi,
    __PLUGIN_NAME__,
    ['injectCSS', 'clearCSS', 'loadData', 'getData', 'saveData', 'setData', 'deleteData']
);

//necessary because typescipt parameter inference does not work for generic functions
interface BindedPatcher extends BindedObject<PatcherType> {
    before<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<undefined>
    ): () => void;
    instead<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<T[N]>
    ): () => void;
    after<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<T[N] extends (...args: any) => infer R ? R : never>
    ): () => void;
}

export const Patcher = BindObject(BdApi.Patcher, __PLUGIN_NAME__) as BindedPatcher;
export const {
    Webpack,
    React,
    ReactDOM,
    settings,
    emotes,
    version,
    Plugins,
    Themes,
    linkJS,
    unlinkJS,
    alert,
    showToast,
    showNotice,
    findModule,
    findAllModules,
    findModuleByProps,
    findModuleByPrototypes,
    findModuleByDisplayName,
    getInternalInstance,
    monkeyPatch,
    onRemoved,
    testJSON,
    isSettingEnabled,
    enableSetting,
    disableSetting,
    toggleSetting,
    getBDData,
    setBDData,
    openDialog,
} = BdApi;
