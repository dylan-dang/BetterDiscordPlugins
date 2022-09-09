import type { IncomingMessage, RequestOptions } from 'http';
import type { Readable } from 'stream';
import { deleteData, saveData } from 'bdapi';
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

function request(url: string | URL, { payload, ...options }: RequestOptions & { payload?: any }) {
    return new Promise<Response>((resolve, reject) => {
        let body = '';
        const request = https.request(url, options, (response) => {
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
        });
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

export async function uploadMedia() {
    return await post(mediaEnpoint('upload'));
}
