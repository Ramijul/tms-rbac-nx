import { Injectable } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { OrganizationRepository } from './organization.repository';
import {
  OrganizationWithUsersDto,
  UserWithRoleDto,
} from './dto/organization-with-users.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }

  async findById(id: number): Promise<Organization | null> {
    return this.organizationRepository.findById(id);
  }

  async findTopLevelOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.findTopLevelOrganizations();
  }

  async findByParentId(parentOrgId: number): Promise<Organization[]> {
    return this.organizationRepository.findByParentId(parentOrgId);
  }

  async findChildren(id: number): Promise<Organization[]> {
    return this.organizationRepository.findChildren(id);
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    return this.organizationRepository.findByUserId(userId);
  }

  async findAllWithUsers(): Promise<OrganizationWithUsersDto[]> {
    const rawData = await this.organizationRepository.findAllWithUsers();

    // Group the raw data by organization
    const orgMap = new Map<number, OrganizationWithUsersDto>();

    rawData.forEach((row) => {
      const orgId = row.org_id;

      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          id: orgId,
          name: row.org_name,
          parentOrgId: row.parent_org_id,
          users: [],
        });
      }

      // Add user if email exists (not null)
      if (row.user_email) {
        const org = orgMap.get(orgId)!;
        org.users.push({
          email: row.user_email,
          role: row.our_role,
        });
      }
    });

    return Array.from(orgMap.values());
  }
}
