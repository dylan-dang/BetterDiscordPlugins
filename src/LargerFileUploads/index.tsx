import { Patcher } from 'bdapi';
import { getModule } from 'bdapi/webpack';
import { byProps } from 'bdapi/webpack/filters';
import { snowflake } from 'discord/types';
import type EventEmitter from 'events';
import https from 'https';
import { uploadFile } from './guilded';

const MAX_SIZE = 524288000; // 500 MB

enum CloudUploadStatus {
    NOT_STARTED = 'NOT_STARTED',
    STARTED = 'STARTED',
    UPLOADING = 'UPLOADING',
    ERROR = 'ERROR',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

declare class CloudUploadClass extends EventEmitter {
    channelId: snowflake;
    classification: string;
    description: string | null;
    filename: string;
    id: string;
    isImage: boolean;
    isVideo: boolean;
    item: {file: File, platform: number};
    loaded: number;
    reactNativeFileIndex: number;
    responseUrl: string;
    showLargeMessageDialog: boolean;
    size: number;
    spoiler: boolean;
    status: CloudUploadStatus;
    uploadedFilename: string;
    _abortController: AbortController;
    _aborted: boolean;
    error: any;

    isPatched?: boolean;

    static fromJson(): CloudUploadClass;
    retryOpts(): {
        timeout: number,
        backoff: number,
        retries: number,
    };
    uploadFileToCloud(): Promise<any>;
    upload(): Promise<void>;
    reactNativeCompressAndExtractData(): Promise<void>;
    handleError(error: any): void;
    handleComplete(e: any): void;
    cancel(): void;
    resetState(): void;
    delete(): Promise<void>;
    setResponseUrl(url: string): void;
    setStatus(status: CloudUploadStatus): void;
    setFilename(filename: string): void;
    setUploadedFilename(filename: string): void;
}

const { CloudUpload }: { CloudUpload: typeof CloudUploadClass, CloudUploadStatus: typeof CloudUploadStatus } = getModule(byProps('CloudUpload'));

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

interface UploadFilesOptions {
    channelId: snowflake;
    uploads: CloudUploadClass[];
    draftType: number;
    parsedMessage: {
        content: string;
        invalidEmojis: any[];
        tts: boolean;
        validNonShortcutEmojis: any[];
    };
    options: {
        stickerIds: snowflake[];
    }
}

const FileUploader: { uploadFiles(options: UploadFilesOptions): void } = getModule(m => m.default.uploadFiles);

export function start() {
    const loggedIn = true;

    Patcher.instead(FileHandler, 'anyFileTooLarge', (_, [files, channelId], anyFileTooLarge) =>
        loggedIn ? Array.from(files).some((file) => file.size > MAX_SIZE) : anyFileTooLarge(files, channelId)
    );
    Patcher.instead(FileHandler, 'uploadSumTooLarge', (_, [files], uploadSumTooLarge) =>
        loggedIn ? false : uploadSumTooLarge(files)
    );
    Patcher.instead(CloudUpload.prototype, 'upload', async (self: typeof CloudUpload.prototype) => {
        uploadFile(self.isImage || self.isVideo, self.item.file);
        self.setResponseUrl("https://discord-attachments-uploads-prd.storage.googleapis.com/c2cee40b-fb43-40b2-955c-e83af2b6676b/PXL_20210224_003501840.jpeg?upload_id=ADPycdtwUwf4ztoY-6pIzL03lByXqvSLvPJOBhGRflsnixVMf24Gu9yA-CqfrgVcaXL26ueNi7qkUfWo4Aq1m845zRx3noMPJ2kd");
        self.setUploadedFilename("c2cee40b-fb43-40b2-955c-e83af2b6676b/PXL_20210224_003501840.jpeg");
        self.handleComplete({
            body: null,
            headers: {},
            ok: true,
            status: 200,
            text: ""
        })
    });

    Patcher.before(FileUploader, 'uploadFiles', (self, [opts]) => {
        console.log(opts);
    })
}

export function stop() {
    Patcher.unpatchAll();
}
