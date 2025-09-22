export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type PermissionAction = 'create' | 'delete' | 'edit' | 'view';
