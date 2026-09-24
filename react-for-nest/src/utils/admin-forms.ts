import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { ICompany, IJob, IUser } from '@/types/backend';

dayjs.extend(customParseFormat);

export interface CompanyOption { label: string; value: string; }
export const companyOption = (company?: { _id?: string; name?: string } | null): CompanyOption | undefined =>
    company?._id ? { value: company._id, label: company.name || company._id } : undefined;

export const userFormValues = (user?: IUser | null) => ({
    name: user?.name ?? '', email: user?.email ?? '', password: undefined,
    address: user?.address ?? '', age: user?.age, gender: user?.gender?.toLowerCase(),
    role: typeof user?.role === 'string' ? user.role : user?.role?._id,
    company: companyOption(user?.company),
});

export function parseJobDate(input: any): dayjs.Dayjs | null {
    if (dayjs.isDayjs(input)) return input.isValid() ? input : null;
    let value = input?.$date ?? input;
    if (value?.$numberLong !== undefined) value = Number(value.$numberLong);
    if (value === undefined || value === null || value === '') return null;
    const parsed = typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)
        ? dayjs(value, 'DD/MM/YYYY', true)
        : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? dayjs(value, 'YYYY-MM-DD', true) : dayjs(value);
    return parsed.isValid() ? parsed : null;
}

export const jobFormValues = (job?: IJob | null) => ({
    name: job?.name ?? '', skills: job?.skills ?? [], company: companyOption(job?.company),
    location: job?.location, salary: job?.salary, quantity: job?.quantity,
    level: job?.level, description: job?.description ?? '',
    startDate: parseJobDate(job?.startDate), endDate: parseJobDate(job?.endDate),
    isActive: job?.isActive ?? true,
});

export const hasRichText = (html?: string) => !!html
    ?.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;|\u00a0/g, ' ').trim();

export function buildJobPayload(values: ReturnType<typeof jobFormValues>, company?: IJob['company'] | ICompany): IJob {
    const start = parseJobDate(values.startDate);
    const end = parseJobDate(values.endDate);
    if (!start || !end) throw new Error('Vui lòng chọn ngày bắt đầu và kết thúc hợp lệ.');
    if (end.isBefore(start, 'day')) throw new Error('Ngày kết thúc không được trước ngày bắt đầu.');
    if (!company?._id || company._id !== values.company?.value || !company.name || !company.logo) {
        throw new Error('Vui lòng chọn công ty có đầy đủ tên và logo.');
    }
    if (!hasRichText(values.description)) throw new Error('Vui lòng nhập miêu tả job.');
    return {
        name: values.name.trim(), skills: values.skills,
        company: { _id: company._id, name: company.name, logo: company.logo },
        location: values.location!, salary: values.salary!, quantity: values.quantity!, level: values.level!,
        description: values.description, startDate: start.toDate(), endDate: end.toDate(),
        isActive: values.isActive,
    };
}

export function companySearchQuery(search: string) {
    if (!search.trim()) return 'current=1&pageSize=100';
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    return `current=1&pageSize=100&name=${encodeURIComponent(`/${escaped}/i`)}`;
}
