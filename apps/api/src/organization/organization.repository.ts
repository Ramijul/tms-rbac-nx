import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrgUserRole } from './entities/org-user-role.entity';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>,
    @InjectRepository(OrgUserRole)
    private readonly orgUserRoleRepository: Repository<OrgUserRole>
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.repository.find({
      relations: ['parentOrganization'],
    });
  }

  async findById(id: number): Promise<Organization | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['parentOrganization'],
    });
  }

  async findTopLevelOrganizations(): Promise<Organization[]> {
    return this.repository.find({
      where: { parentOrgId: null },
      relations: ['parentOrganization'],
    });
  }

  async findByParentId(parentOrgId: number): Promise<Organization[]> {
    return this.repository.find({
      where: { parentOrgId },
      relations: ['parentOrganization'],
    });
  }

  async findChildren(id: number): Promise<Organization[]> {
    return this.repository.find({
      where: { parentOrgId: id },
      relations: ['parentOrganization'],
    });
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const userRoles = await this.orgUserRoleRepository.find({
      where: { userId },
      relations: ['organization', 'organization.parentOrganization'],
    });

    return userRoles.map((userRole) => userRole.organization);
  }

  async findAllWithUsers(): Promise<any[]> {
    return this.repository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org_user_roles', 'our', 'our.org_id = org.id')
      .leftJoinAndSelect('users', 'user', 'user.id = our.user_id')
      .select([
        'org.id',
        'org.name',
        'org.parent_org_id',
        'our.role',
        'user.email',
      ])
      .getRawMany();
  }
}
