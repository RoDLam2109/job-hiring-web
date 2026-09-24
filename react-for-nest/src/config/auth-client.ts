import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface Session {
    readToken: () => string | null;
    writeToken: (token: string) => void;
    expire: () => void;
}
type RetryConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };
const refreshPath = '/api/v1/auth/refresh';
const isAuthEntry = (url?: string) => [refreshPath, '/api/v1/auth/login', '/api/v1/auth/register'].includes(url ?? '');

export function createApiClient(baseURL: string, session: Session) {
    const options = { baseURL, withCredentials: true, timeout: 60000 };
    const client = axios.create(options);
    // This client has no response interceptor: refresh cannot recursively refresh itself.
    const refreshClient = axios.create(options);
    let refreshing: Promise<string | null> | null = null;

    const refresh = (oldToken: string): Promise<string | null> => {
        if (!refreshing) {
            refreshing = (async () => {
                try {
                    // Explicit raw response type: the app's AxiosResponse augmentation
                    // otherwise assumes every Axios client unwraps response.data.
                    const response = await refreshClient.get<unknown, {
                        data?: { data?: { access_token?: string } };
                    }>(refreshPath);
                    const token = response.data?.data?.access_token;
                    // A logout or another login while waiting must win over this response.
                    if (session.readToken() !== oldToken) return session.readToken();
                    if (!token) {
                        session.expire();
                        return null;
                    }
                    session.writeToken(token);
                    return token;
                } catch (error) {
                    const status = (error as AxiosError).response?.status;
                    if (status === 400 || status === 401) {
                        if (session.readToken() === oldToken) session.expire();
                        return session.readToken();
                    }
                    // A server outage or lost connection does not invalidate the login.
                    throw error;
                }
            })().finally(() => { refreshing = null; });
        }
        return refreshing;
    };

    client.interceptors.request.use(config => {
        const token = session.readToken();
        if (token && !isAuthEntry(config.url)) config.headers.set('Authorization', `Bearer ${token}`);
        else config.headers.delete('Authorization');
        return config;
    });

    client.interceptors.response.use(response => response.data, async (error: AxiosError) => {
        const config = error.config as RetryConfig | undefined;
        if (config && error.response?.status === 401 && !isAuthEntry(config.url)) {
            const sentToken = String(config.headers.get('Authorization') ?? '').replace(/^Bearer /, '') || null;
            if (!config._authRetried && sentToken) {
                config._authRetried = true;
                // Another failed request may already have refreshed or cleared the token.
                const currentToken = session.readToken();
                const token = currentToken !== sentToken ? currentToken : await refresh(sentToken);
                if (token || config.method === 'get') {
                    // Public GETs can recover as guests after an invalid session is cleared.
                    return client.request(config);
                }
            } else if (config._authRetried && sentToken && session.readToken() === sentToken) {
                session.expire();
            }
        }
        // Preserve the response-body contract used by existing forms and tables.
        return error.response?.data ?? Promise.reject(error);
    });
    return client;
}
