const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const axios = require('axios');

// Run the actual TypeScript client with Axios' in-memory HTTP adapter, no server needed.
const filename = path.resolve(__dirname, '../src/config/auth-client.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = module.paths;
loaded._compile(compiled, filename);
const { createApiClient } = loaded.exports;
const refreshPath = '/api/v1/auth/refresh';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const response = (config, status, data) => {
    const result = { config, status, data, statusText: String(status), headers: {} };
    if (status >= 400) throw new axios.AxiosError('HTTP error', 'ERR_BAD_RESPONSE', config, null, result);
    return result;
};
const tests = [];
const test = (name, run) => tests.push({ name, run });
function setup(adapter, initialToken = 'old') {
    let token = initialToken;
    let expired = 0;
    const originalAdapter = axios.defaults.adapter;
    axios.defaults.adapter = adapter;
    const client = createApiClient('https://backend.test', {
        readToken: () => token,
        writeToken: value => { token = value; },
        expire: () => { token = null; expired++; },
    });
    axios.defaults.adapter = originalAdapter;
    return { client, token: () => token, expired: () => expired, changeToken: value => { token = value; } };
}

test('concurrent and late 401 responses share one refresh and retry with the new token', async () => {
    let refreshes = 0;
    const state = setup(async config => {
        if (config.url === refreshPath) {
            refreshes++;
            assert.equal(config.headers.get('Authorization'), undefined);
            await pause(10);
            return response(config, 200, { data: { access_token: 'new' } });
        }
        if (config.headers.get('Authorization') === 'Bearer old') {
            if (config.url === '/late') await pause(30);
            return response(config, 401, { statusCode: 401 });
        }
        assert.equal(config.headers.get('Authorization'), 'Bearer new');
        return response(config, 200, { data: 'ok' });
    });
    const results = await Promise.all(['/one', '/two', '/late'].map(url => state.client.get(url)));
    assert.deepEqual(results, [{ data: 'ok' }, { data: 'ok' }, { data: 'ok' }]);
    assert.equal(refreshes, 1);
    assert.equal(state.token(), 'new');
});

for (const status of [400, 401]) {
    test(`refresh ${status} clears the session once and public GETs recover without a token`, async () => {
        let refreshes = 0;
        const state = setup(async config => {
            if (config.url === refreshPath) {
                refreshes++;
                await pause(5);
                return response(config, status, { message: 'Expired refresh token' });
            }
            if (config.headers.get('Authorization')) return response(config, 401, { statusCode: 401 });
            return response(config, 200, { data: ['public jobs'] });
        });
        const results = await Promise.all([state.client.get('/jobs'), state.client.get('/jobs')]);
        assert.deepEqual(results[0], { data: ['public jobs'] });
        assert.equal(state.token(), null);
        assert.equal(state.expired(), 1);
        assert.equal(refreshes, 1);
        await state.client.get('/jobs');
        assert.equal(refreshes, 1);
    });
}

test('a protected endpoint stops after one retry when the new access token is rejected', async () => {
    let refreshes = 0;
    let requests = 0;
    const state = setup(async config => {
        if (config.url === refreshPath) {
            refreshes++;
            return response(config, 200, { data: { access_token: 'new' } });
        }
        requests++;
        return response(config, 401, { statusCode: 401 });
    });
    assert.deepEqual(await state.client.get('/account'), { statusCode: 401 });
    assert.equal(refreshes, 1);
    assert.equal(requests, 2);
    assert.equal(state.token(), null);
});

for (const failure of ['network', 'server']) {
    test(`${failure} failure during refresh does not delete a potentially valid session`, async () => {
        const state = setup(async config => {
            if (config.url === refreshPath) {
                if (failure === 'network') throw new axios.AxiosError('Offline', 'ERR_NETWORK', config);
                return response(config, 503, { message: 'Unavailable' });
            }
            return response(config, 401, {});
        });
        await assert.rejects(state.client.get('/account'));
        assert.equal(state.token(), 'old');
        assert.equal(state.expired(), 0);
    });
}

test('login failures never trigger refresh or attach a stale access token', async () => {
    const state = setup(async config => {
        assert.equal(config.url, '/api/v1/auth/login');
        assert.equal(config.headers.get('Authorization'), undefined);
        return response(config, 401, { message: 'Invalid password' });
    });
    assert.deepEqual(await state.client.post('/api/v1/auth/login', {}), { message: 'Invalid password' });
    assert.equal(state.token(), 'old');
});

test('guest 401 responses do not start a refresh loop', async () => {
    let calls = 0;
    const state = setup(async config => {
        calls++;
        assert.notEqual(config.url, refreshPath);
        return response(config, 401, { statusCode: 401 });
    }, null);
    await state.client.get('/account');
    assert.equal(calls, 1);
});

test('logout during refresh cannot restore the old session', async () => {
    let state;
    state = setup(async config => {
        if (config.url === refreshPath) {
            state.changeToken(null);
            return response(config, 200, { data: { access_token: 'new' } });
        }
        if (config.headers.get('Authorization')) return response(config, 401, {});
        return response(config, 200, { data: 'guest' });
    });
    assert.deepEqual(await state.client.get('/jobs'), { data: 'guest' });
    assert.equal(state.token(), null);
});

test('refresh failure from a previous login does not clear a newer login', async () => {
    let state;
    state = setup(async config => {
        if (config.url === refreshPath) {
            state.changeToken('other-login');
            return response(config, 401, {});
        }
        if (config.headers.get('Authorization') === 'Bearer old') return response(config, 401, {});
        assert.equal(config.headers.get('Authorization'), 'Bearer other-login');
        return response(config, 200, { data: 'ok' });
    });
    await state.client.get('/account');
    assert.equal(state.token(), 'other-login');
    assert.equal(state.expired(), 0);
});

(async () => {
    for (const { name, run } of tests) {
        let timer;
        try {
            await Promise.race([run(), new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`Timed out: ${name}`)), 3000);
            })]);
            console.log(`PASS ${name}`);
        } finally { clearTimeout(timer); }
    }
    console.log(`${tests.length} auth client tests passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
