export class SystemError extends Error {
    // The string error code
    code: string;
    // The system-provided error number
    errno: number;
    // The name of the system call that triggered the error
    syscall: string;
    // The address to which a network connection failed (optional)
    address?: string;
    // The file path destination when reporting a file system error (optional)
    dest?: string;
    // The file path when reporting a file system error (optional)
    path?: string;
    // The network connection port that is not available (optional)
    port?: number;
    // Extra details about the error condition (optional)
    info?: Object;
    constructor() {
        super();
        this.code = ``;
        this.errno = NaN;
        this.syscall = ``;
    }
}

export interface omdbRejected {
    message: string;
    name: string;
    stack: string;
    config: Config;
    code: string;
    status: number;
}

interface Config {
    transitional: Transitional;
    adapter: string[];
    transformRequest: null[];
    transformResponse: null[];
    timeout: number;
    xsrfCookieName: string;
    xsrfHeaderName: string;
    maxContentLength: number;
    maxBodyLength: number;
    env: Env;
    headers: Headers;
    params: Params;
    method: string;
    url: string;
}

interface Params {
    apikey: string;
    s: string;
    r: string;
    y: string;
    type: string;
}

interface Headers {
    Accept: string;
    'User-Agent': string;
    'Accept-Encoding': string;
}

interface Env {
}

interface Transitional {
    silentJSONParsing: boolean;
    forcedJSONParsing: boolean;
    clarifyTimeoutError: boolean;
}

