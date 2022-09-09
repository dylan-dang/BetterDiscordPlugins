import * as bdapi from '../lib/bdapi'

declare global {
    const BdApi: typeof bdapi;
    interface Window {
        BdApi: typeof bdapi;
    }
}