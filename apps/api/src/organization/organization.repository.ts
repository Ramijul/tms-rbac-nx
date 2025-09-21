import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>
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
}
