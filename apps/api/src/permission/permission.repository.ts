import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { Role, PermissionAction } from './role.enum';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Permission | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByRole(role: Role): Promise<Permission[]> {
    return this.repository.find({
      where: { role },
    });
  }

  async findByFeature(feature: string): Promise<Permission[]> {
    return this.repository.find({
      where: { feature },
    });
  }

  async findByRoleAndFeature(
    role: Role,
    feature: string
  ): Promise<Permission[]> {
    return this.repository.find({
      where: { role, feature },
    });
  }

  async findByRoleFeatureAndAction(
    role: Role,
    feature: string,
    action: PermissionAction
  ): Promise<Permission | null> {
    return this.repository.findOne({
      where: { role, feature, action },
    });
  }

  async findRolesWithPermission(
    feature: string,
    action: PermissionAction
  ): Promise<Role[]> {
    const permissions = await this.repository.find({
      where: { feature, action },
    });
    return permissions.map((p) => p.role);
  }
}
