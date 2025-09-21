import { Injectable } from '@nestjs/common';
import { Organization } from './organization.entity';
import { OrganizationRepository } from './organization.repository';

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
}
