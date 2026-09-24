const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/utils/admin-forms.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = module.paths;
loaded._compile(compiled, filename);
const { userFormValues, jobFormValues, parseJobDate, buildJobPayload, companySearchQuery, hasRichText } = loaded.exports;
let total = 0;
function test(name, run) { run(); total++; console.log(`PASS ${name}`); }

test('existing users preserve fields, normalize populated roles and never prefill password hashes', () => {
    const values = userFormValues({ name: 'Admin', email: 'a@example.test', age: 30, gender: 'MALE', address: 'Hanoi',
        password: 'server-hash', role: { _id: 'role-a', name: 'ADMIN' }, company: { _id: 'company-a', name: 'Company A' } });
    assert.deepEqual(values, { name: 'Admin', email: 'a@example.test', age: 30, gender: 'male', address: 'Hanoi',
        password: undefined, role: 'role-a', company: { value: 'company-a', label: 'Company A' } });
    assert.equal(userFormValues({ role: 'role-b' }).role, 'role-b');
});
test('opening a new or different user does not keep the previous role/company', () => {
    userFormValues({ role: 'previous', company: { _id: 'company-a', name: 'A' } });
    const fresh = userFormValues();
    assert.equal(fresh.name, '');
    assert.equal(fresh.role, undefined);
    assert.equal(fresh.company, undefined);
    assert.equal(userFormValues({ role: null, company: null }).company, undefined);
});

const company = { _id: 'company-a', name: 'Company A', logo: 'https://cdn.test/logo@#$1.png' };
const job = { name: 'Engineer', skills: ['React'], company, location: 'HANOI', salary: 0, quantity: 2,
    level: 'JUNIOR', description: '<p>Build apps</p>', startDate: '2026-10-01', endDate: '2026-10-31', isActive: false };
test('editing a job retains inactive state, zero salary, dates, description and exact company logo', () => {
    const form = jobFormValues(job);
    const payload = buildJobPayload(form, company);
    assert.equal(payload.isActive, false);
    assert.equal(payload.salary, 0);
    assert.equal(payload.description, job.description);
    assert.deepEqual(payload.company, company);
    assert.equal(form.startDate.format('YYYY-MM-DD'), job.startDate);
    assert.equal(form.endDate.format('YYYY-MM-DD'), job.endDate);
    assert.ok(payload.startDate instanceof Date);
    assert.equal(jobFormValues().isActive, true);
    assert.equal(jobFormValues().description, '');
});
test('saving uses the edited rich text rather than a stale independent state', () => {
    const form = jobFormValues(job);
    form.description = '<p>Updated requirements</p>';
    assert.equal(buildJobPayload(form, company).description, form.description);
});
test('company reassignment uses the newly selected record without splitting its logo URL', () => {
    const form = jobFormValues(job);
    const next = { _id: 'company-b', name: 'Company B', logo: 'https://cdn.test/new@#$logo.png' };
    form.company = { value: next._id, label: next.name };
    assert.deepEqual(buildJobPayload(form, next).company, next);
    assert.throws(() => buildJobPayload(form, company));
    form.company = undefined;
    assert.throws(() => buildJobPayload(form, undefined));
});
test('date input accepts supported formats and rejects invalid or reversed ranges', () => {
    assert.equal(parseJobDate('31/12/2026').format('YYYY-MM-DD'), '2026-12-31');
    assert.equal(parseJobDate({ $date: '2026-10-01T00:00:00Z' }).year(), 2026);
    assert.equal(parseJobDate({ $date: { $numberLong: '0' } }).valueOf(), 0);
    assert.equal(parseJobDate('31/02/2026'), null);
    assert.equal(parseJobDate('2026-02-31'), null);
    assert.equal(parseJobDate(''), null);
    assert.throws(() => buildJobPayload({ ...jobFormValues(job), endDate: parseJobDate('2026-09-01') }, company));
});
test('empty Quill markup does not pass description validation', () => {
    for (const value of ['', '<p><br></p>', '<p>&nbsp;</p>', '<p>  </p>']) assert.equal(hasRichText(value), false);
    assert.equal(hasRichText('<p>Developer</p>'), true);
    assert.throws(() => buildJobPayload({ ...jobFormValues(job), description: '<p><br></p>' }, company));
});
test('company search preserves special characters without injecting query parameters or regex', () => {
    const params = new URLSearchParams(companySearchQuery('A&B (VN)+'));
    assert.equal(params.get('name'), '/A&B \\(VN\\)\\+/i');
    assert.equal(params.get('pageSize'), '100');
    assert.equal([...params.keys()].length, 3);
});
console.log(`${total} admin form tests passed.`);
