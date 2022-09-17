import { IncomingMessage, RequestOptions } from 'http';
import { pipeline, Readable, ReadableOptions, Transform, Writable } from 'stream';
import { deleteData, loadData, saveData } from 'bdapi';
import https from 'https';

interface Response extends Omit<IncomingMessage, keyof Readable | 'setTimeout'> {
    response: IncomingMessage;
    body: string;
    json: any;
}

interface GuildedUser {
    id: string;
    name: string;
    email: string;
    profilePictureSm?: string;
    profilePicture?: string;
    profilePictureLg?: string;
    profilePictureBlur?: string;
    profileBannerBlur?: string;
}

interface GuildedError {
    code: string;
    message: string;
}

type GuildedLoginResponse = { user: GuildedUser } | GuildedError;

function apiEndpoint(path: string) {
    return new URL(path, 'https://guilded.gg/api/');
}

function mediaEnpoint(path: string) {
    return new URL(path, 'https://media/guilded.gg/media');
}

function request(url: string | URL, { payload, headers, ...options }: RequestOptions & { payload?: any }) {
    return new Promise<Response>((resolve, reject) => {
        let body = '';
        const request = https.request(
            url,
            { headers: { ...headers, Cookie: loadData('cookies') }, ...options },
            (response) => {
                response.setEncoding('utf-8');
                response.on('error', reject);
                response.on('data', (chunk) => (body += chunk.toString()));
                response.on('end', () => {
                    const cookies = response.headers['set-cookie']
                        ?.map((cookie) => cookie?.match(/([^=]+)=([^\;]+);?/)?.[0])
                        .join(' ');
                    if (cookies) saveData('cookies', cookies);
                    resolve({ ...response, response, body, json: JSON.parse(body) });
                });
            }
        );
        request.on('error', reject);
        if (payload) request.write(payload);
        request.end();
    });
}

function post(url: string | URL, payload?: any, options: Omit<RequestOptions, 'method'> = {}) {
    return request(url, { headers: { 'Content-Type': 'application/json' }, ...options, method: 'POST', payload });
}

function get(url: string | URL, options: Omit<RequestOptions, 'method'> = {}) {
    return request(url, { ...options, method: 'GET' });
}

export async function getMe(): Promise<GuildedLoginResponse> {
    const { json } = await get(apiEndpoint('me'));
    return json;
}

export async function login(email: string, password: string): Promise<GuildedLoginResponse> {
    const { json } = await post(apiEndpoint('login'), { email, password, getMe: true });
    return json;
}

export async function logout() {
    await post(apiEndpoint('logout'));
    deleteData('cookies');
}

export async function signup(email: string, password: string, name: string): Promise<GuildedLoginResponse> {
    const { json, statusCode } = await post(apiEndpoint('users?type=email'), {
        fullName: name,
        name,
        email,
        password,
    });
    return statusCode === 200 ? json : await login(email, password);
}

interface Callbacks {
    onProgress?(progress: number): void;
    onResponse?(url: string): void;
    onError?(error: NodeJS.ErrnoException | null): void;
}

export function uploadFile(
    isMedia: boolean,
    file: File,
    { onProgress = () => {}, onResponse = () => {}, onError = () => {} }: Callbacks = {}
) {
    const endpoint = mediaEnpoint(isMedia ? 'upload' : 'file_upload');
    const boundary = '---------------------------GamersRiseUp';

    const stream = nodeStreamFrom(file.stream() as unknown as ReadableStream);
    let bytesUploaded = 0;
    let body = '';
    const request = https.request(
        endpoint,
        {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; name="file"; boundary=${boundary}`,
                'Content-Length': file.size,
                Accept: 'application/json',
                Cookie: loadData('cookies'),
            },
        },
        (response) => {
            response.setEncoding('utf-8');
            response.on('error', onError);
            response.on('data', (chunk) => (body += chunk.toString()));
            response.on('end', () => {
                const cookies = response.headers['set-cookie']
                    ?.map((cookie) => cookie?.match(/([^=]+)=([^\;]+);?/)?.[0])
                    .join(' ');
                if (cookies) saveData('cookies', cookies);
                onResponse(JSON.parse(body).url);
            });
        }
    );

    request.write(boundary);
    request.write('\n');
    request.write(`Content-Disposition: form-data; name="file"; filename="${file.name}";\n`);
    request.write(`Content-Type: ${file.type}\n\n`);

    pipeline(
        stream,
        new Transform({
            transform(chunk, encoding, callback) {
                bytesUploaded += chunk.length;
                this.push(chunk);
                onProgress(bytesUploaded / file.size);
                callback();
            },
            flush(callback) {
                this.write(`\n\n${boundary}--`);
                callback();
            },
        }),
        request,
        onError
    );
}

function nodeStreamFrom(readableStream: ReadableStream, { read, destroy, ...options }: ReadableOptions = {}) {
    const reader = readableStream.getReader();
    let closed = false;

    const readable = new Readable({
        ...options,
        read(size) {
            read?.call(this, size);
            reader.read().then((chunk) => {
                readable.push(chunk.done ? null : chunk.value);
            }, readable.destroy);
        },
        destroy(error, callback) {
            destroy?.call(this, error, callback);
            const done = () => callback(error);
            if (!closed) {
                reader.cancel(error).then(done, done);
                return;
            }
            done();
        },
    });

    reader.closed.then(
        () => {
            closed = true;
            if (!readable.readableEnded) readable.push(null);
        },
        (error) => {
            closed = true;
            readable.destroy(error);
        }
    );

    return readable;
}
