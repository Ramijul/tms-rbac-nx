import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import {
  JwtAuthGuard,
  AuthenticatedRequest,
} from '@tms-rbac-nx/auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('my-organizations')
  async getMyOrganizations(
    @Req() req: AuthenticatedRequest
  ): Promise<Organization[]> {
    return this.organizationService.findByUserId(req.user.userId);
  }
}
