import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrgUserRole } from './entities/org-user-role.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrgUserRole])],
  controllers: [OrganizationController],
  providers: [OrganizationRepository, OrganizationService, JwtService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
