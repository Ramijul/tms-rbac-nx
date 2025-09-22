import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { OrganizationWithUsersDto } from './dto/organization-with-users.dto';
import {
  JwtAuthGuard,
  AuthenticatedRequest,
} from '@tms-rbac-nx/auth/jwt-auth.guard';

@Controller('orgs')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-orgs')
  async getMyOrganizations(
    @Req() req: AuthenticatedRequest
  ): Promise<Organization[]> {
    return this.organizationService.findByUserId(req.user.userId);
  }

  @Get('all-with-users')
  async getAllOrganizationsWithUsers(): Promise<OrganizationWithUsersDto[]> {
    return this.organizationService.findAllWithUsers();
  }
}
