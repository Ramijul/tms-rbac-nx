import { Injectable } from '@nestjs/common';
import { Permission } from './permission.entity';
import { PermissionRepository } from './permission.repository';
import { Role, PermissionAction } from './role.enum';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async findById(id: number): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }

  async findByRole(role: Role): Promise<Permission[]> {
    return this.permissionRepository.findByRole(role);
  }

  async findByFeature(feature: string): Promise<Permission[]> {
    return this.permissionRepository.findByFeature(feature);
  }

  async findByRoleAndFeature(
    role: Role,
    feature: string
  ): Promise<Permission[]> {
    return this.permissionRepository.findByRoleAndFeature(role, feature);
  }

  async findByRoleFeatureAndAction(
    role: Role,
    feature: string,
    action: PermissionAction
  ): Promise<Permission | null> {
    return this.permissionRepository.findByRoleFeatureAndAction(
      role,
      feature,
      action
    );
  }

  async hasPermission(
    role: Role,
    feature: string,
    action: PermissionAction
  ): Promise<boolean> {
    const effectivePermissions = await this.getEffectivePermissions(
      role,
      feature
    );
    return effectivePermissions[action];
  }

  async getEffectivePermissions(
    role: Role,
    feature: string
  ): Promise<{
    create: boolean;
    delete: boolean;
    edit: boolean;
    view: boolean;
  }> {
    const permissions = await this.permissionRepository.findByRoleAndFeature(
      role,
      feature
    );

    // Get direct permissions
    const directPermissions = {
      create: permissions.some((p) => p.action === 'create'),
      delete: permissions.some((p) => p.action === 'delete'),
      edit: permissions.some((p) => p.action === 'edit'),
      view: permissions.some((p) => p.action === 'view'),
    };

    // Apply role hierarchy - higher roles inherit permissions from lower roles
    const hierarchyPermissions = await this.getInheritedPermissions(
      role,
      feature
    );

    return {
      create: directPermissions.create || hierarchyPermissions.create,
      delete: directPermissions.delete || hierarchyPermissions.delete,
      edit: directPermissions.edit || hierarchyPermissions.edit,
      view: directPermissions.view || hierarchyPermissions.view,
    };
  }

  private async getInheritedPermissions(
    role: Role,
    feature: string
  ): Promise<{
    create: boolean;
    delete: boolean;
    edit: boolean;
    view: boolean;
  }> {
    // Define role hierarchy: OWNER > ADMIN > VIEWER
    const roleHierarchy: Role[] = [Role.OWNER, Role.ADMIN, Role.VIEWER];
    const currentRoleIndex = roleHierarchy.indexOf(role);

    // Get permissions from all lower roles in the hierarchy
    const lowerRoles = roleHierarchy.slice(currentRoleIndex + 1);

    let hierarchyPermissions = {
      create: false,
      delete: false,
      edit: false,
      view: false,
    };

    for (const lowerRole of lowerRoles) {
      const lowerRolePermissions =
        await this.permissionRepository.findByRoleAndFeature(
          lowerRole,
          feature
        );

      for (const permission of lowerRolePermissions) {
        hierarchyPermissions[permission.action] = true;
      }
    }

    return hierarchyPermissions;
  }
}
