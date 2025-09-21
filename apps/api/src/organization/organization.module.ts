import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrgUserRole } from './entities/org-user-role.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrgUserRole])],
  controllers: [],
  providers: [OrganizationRepository, OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
