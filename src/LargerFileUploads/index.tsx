import { Patcher } from 'bdapi';
import { getModule } from 'bdapi/webpack';
import { byProps } from 'bdapi/webpack/filters';
import { snowflake } from 'discord/types';

const MAX_SIZE = 524288000; // 500 MB

declare class CloudUploadClass {
    upload(): Promise<void>;
}

const { CloudUpload }: { CloudUpload: typeof CloudUploadClass } = getModule(byProps('CloudUpload'));

type FileClassification =
    | 'photoshop'
    | 'webcode'
    | 'image'
    | 'video'
    | 'acrobat'
    | 'ae'
    | 'sketch'
    | 'ai'
    | 'archive'
    | 'code'
    | 'document'
    | 'spreadsheet'
    | 'webcode'
    | 'audio'
    | 'unknown';

interface FileHandler {
    anyFileTooLarge(files: Iterable<File>, channelId: snowflake): boolean;
    classifyFile(file: File): FileClassification;
    classifyFileName(name: string, type: string): FileClassification;
    getMaxRequestSize(): number;
    getUploadFileSizeSum(files: Iterable<File>): number;
    makeFile(data: Uint8Array, name: string, type: string): File;
    maxFileSize(channelId: snowflake): `${number}.${number} ${'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'}`;
    sizeString(size: number): string;
    transformNativeFile(file: File | { data: Uint8Array; filename: string }, type?: string): File;
    uploadSumTooLarge(files: Iterable<File>): boolean;
}

const FileHandler: FileHandler = getModule(byProps('anyFileTooLarge'));

export function start() {
    const loggedIn = true;

    Patcher.instead(FileHandler, 'anyFileTooLarge', (_, [files, channelId], anyFileTooLarge) =>
        loggedIn ? Array.from(files).some((file) => file.size > MAX_SIZE) : anyFileTooLarge(files, channelId)
    );
    Patcher.instead(FileHandler, 'uploadSumTooLarge', (_, [files], uploadSumTooLarge) =>
        loggedIn ? false : uploadSumTooLarge(files)
    );
    Patcher.before(CloudUpload.prototype, 'upload', (self: typeof CloudUpload.prototype) => {
        console.log(self);
    });
}

export function stop() {
    Patcher.unpatchAll();
}
