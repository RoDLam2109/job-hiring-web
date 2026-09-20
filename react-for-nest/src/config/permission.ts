import type { IAccount } from '@/types/backend';

export const ALL_MODULES = {
  AUTH: 'AUTH',
  COMPANIES: 'COMPANIES',
  FILES: 'FILES',
  JOBS: 'JOBS',
  PERMISSIONS: 'PERMISSIONS',
  RESUMES: 'RESUMES',
  ROLES: 'ROLES',
  USERS: 'USERS',
  SUBSCRIBERS: 'SUBSCRIBERS'
}

type AccessUser = Pick<IAccount['user'], 'role' | 'permissions'>;

export const isAdmin = (user: AccessUser) => {
  const role = typeof user.role === 'string' ? user.role : user.role?.name;
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

export const hasPermission = (user: AccessUser, method: string, apiPath: string) =>
  isAdmin(user) || (user.permissions ?? []).some(permission =>
    permission.method?.toUpperCase() === method.toUpperCase() && permission.apiPath === apiPath,
  );

// Menu visibility and route access use the same API permission requirements.
export const ADMIN_PAGE_PERMISSIONS: Record<string, { method: string; apiPath: string }> = {
  '/admin/company': { method: 'GET', apiPath: '/api/v1/companies' },
  '/admin/user': { method: 'GET', apiPath: '/api/v1/users' },
  '/admin/job': { method: 'GET', apiPath: '/api/v1/jobs' },
  '/admin/resume': { method: 'GET', apiPath: '/api/v1/resumes' },
  '/admin/permission': { method: 'GET', apiPath: '/api/v1/permissions' },
  '/admin/role': { method: 'GET', apiPath: '/api/v1/roles' },
};

export const canAccessAdminPage = (user: AccessUser, pathname: string, search = '') => {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin') return isAdmin(user);
  if (path === '/admin/job/upsert') {
    const editing = new URLSearchParams(search).has('id');
    return hasPermission(user, editing ? 'PATCH' : 'POST', editing ? '/api/v1/jobs/:id' : '/api/v1/jobs');
  }
  const required = ADMIN_PAGE_PERMISSIONS[path];
  return !!required && hasPermission(user, required.method, required.apiPath);
};

export const getAdminLandingPath = (user: AccessUser) =>
  isAdmin(user) ? '/admin' : Object.keys(ADMIN_PAGE_PERMISSIONS).find(path => canAccessAdminPage(user, path));
