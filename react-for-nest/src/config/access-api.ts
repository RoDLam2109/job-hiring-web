import axios from './axios-customize';
import { IBackendRes, IModelPaginate } from '@/types/backend';

export interface Permission {
    _id: string;
    name: string;
    apiPath: string;
    method: string;
    module: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Role {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: (string | Permission)[];
    createdAt?: string;
    updatedAt?: string;
}

export type AccessRecord = Role | Permission;
export type AccessResource = 'roles' | 'permissions';
export type AccessValues = {
    name: string;
    description?: string;
    isActive?: boolean;
    permissions?: string[];
    apiPath?: string;
    method?: string;
    module?: string;
};

export function unwrap<T>(response: IBackendRes<T>): T {
    if (Number(response.statusCode) >= 400 || response.error || response.data == null) {
        throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message || 'Không thể xử lý yêu cầu.');
    }
    return response.data;
}

export const fetchAccess = async (resource: AccessResource, query: string) =>
    unwrap(await axios.get<IBackendRes<IModelPaginate<AccessRecord>>>(`/api/v1/${resource}?${query}`));

export const fetchAccessById = async (resource: AccessResource, id: string) =>
    unwrap(await axios.get<IBackendRes<AccessRecord>>(`/api/v1/${resource}/${id}`));

export const saveAccess = async (resource: AccessResource, values: AccessValues, id?: string) =>
    unwrap(id
        ? await axios.patch<IBackendRes<unknown>>(`/api/v1/${resource}/${id}`, values)
        : await axios.post<IBackendRes<unknown>>(`/api/v1/${resource}`, values));

export const deleteAccess = async (resource: AccessResource, id: string) =>
    unwrap(await axios.delete<IBackendRes<unknown>>(`/api/v1/${resource}/${id}`));
