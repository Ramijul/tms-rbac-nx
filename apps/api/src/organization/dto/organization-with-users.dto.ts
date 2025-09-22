import { Role } from '@tms-rbac-nx/data/role.enum';

export class UserWithRoleDto {
  email: string;
  role: Role;
}

export class OrganizationWithUsersDto {
  id: number;
  name: string;
  parentOrgId: number | null;
  users: UserWithRoleDto[];
}
