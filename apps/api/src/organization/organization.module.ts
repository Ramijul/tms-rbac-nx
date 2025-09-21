import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [],
  providers: [OrganizationRepository, OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
