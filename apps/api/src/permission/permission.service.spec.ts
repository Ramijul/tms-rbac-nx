import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './permission.repository';
import { Permission } from './permission.entity';
import { Role, PermissionAction } from './role.enum';

describe('PermissionService', () => {
  let service: PermissionService;
  let mockRepository: jest.Mocked<PermissionRepository>;

  const mockAdminCreatePermission: Permission = {
    id: 1,
    role: Role.ADMIN,
    feature: 'users',
    action: 'create',
  };

  const mockAdminEditPermission: Permission = {
    id: 2,
    role: Role.ADMIN,
    feature: 'users',
    action: 'edit',
  };

  const mockAdminViewPermission: Permission = {
    id: 3,
    role: Role.ADMIN,
    feature: 'users',
    action: 'view',
  };

  const mockOwnerDeletePermission: Permission = {
    id: 4,
    role: Role.OWNER,
    feature: 'users',
    action: 'delete',
  };

  const mockViewerViewPermission: Permission = {
    id: 5,
    role: Role.VIEWER,
    feature: 'users',
    action: 'view',
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByRole: jest.fn(),
      findByFeature: jest.fn(),
      findByRoleAndFeature: jest.fn(),
      findByRoleFeatureAndAction: jest.fn(),
      findRolesWithPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: PermissionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    mockRepository = module.get(PermissionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const expectedPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
        mockOwnerDeletePermission,
      ];
      mockRepository.findAll.mockResolvedValue(expectedPermissions);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedPermissions);
    });
  });

  describe('findById', () => {
    it('should return permission by id', async () => {
      mockRepository.findById.mockResolvedValue(mockAdminCreatePermission);

      const result = await service.findById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAdminCreatePermission);
    });

    it('should return null when permission not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should return permissions for specific role', async () => {
      const adminPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
      ];
      mockRepository.findByRole.mockResolvedValue(adminPermissions);

      const result = await service.findByRole(Role.ADMIN);

      expect(mockRepository.findByRole).toHaveBeenCalledWith(Role.ADMIN);
      expect(result).toEqual(adminPermissions);
    });
  });

  describe('findByFeature', () => {
    it('should return permissions for specific feature', async () => {
      const userPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
        mockOwnerDeletePermission,
      ];
      mockRepository.findByFeature.mockResolvedValue(userPermissions);

      const result = await service.findByFeature('users');

      expect(mockRepository.findByFeature).toHaveBeenCalledWith('users');
      expect(result).toEqual(userPermissions);
    });
  });

  describe('findByRoleAndFeature', () => {
    it('should return permissions for specific role and feature', async () => {
      const adminUserPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
      ];
      mockRepository.findByRoleAndFeature.mockResolvedValue(
        adminUserPermissions
      );

      const result = await service.findByRoleAndFeature(Role.ADMIN, 'users');

      expect(mockRepository.findByRoleAndFeature).toHaveBeenCalledWith(
        Role.ADMIN,
        'users'
      );
      expect(result).toEqual(adminUserPermissions);
    });
  });

  describe('findByRoleFeatureAndAction', () => {
    it('should return permission for specific role, feature and action', async () => {
      mockRepository.findByRoleFeatureAndAction.mockResolvedValue(
        mockAdminCreatePermission
      );

      const result = await service.findByRoleFeatureAndAction(
        Role.ADMIN,
        'users',
        'create'
      );

      expect(mockRepository.findByRoleFeatureAndAction).toHaveBeenCalledWith(
        Role.ADMIN,
        'users',
        'create'
      );
      expect(result).toEqual(mockAdminCreatePermission);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has direct permission', async () => {
      const adminUserPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
      ];
      mockRepository.findByRoleAndFeature.mockResolvedValue(
        adminUserPermissions
      );

      const result = await service.hasPermission(Role.ADMIN, 'users', 'create');

      expect(result).toBe(true);
    });

    it('should return false when role has no permission', async () => {
      mockRepository.findByRoleAndFeature.mockResolvedValue([]);

      const result = await service.hasPermission(
        Role.VIEWER,
        'users',
        'create'
      );

      expect(result).toBe(false);
    });

    it('should return false when role has permission but not for the specific action', async () => {
      const permissionsWithoutCreate = [
        mockAdminEditPermission,
        mockAdminViewPermission,
      ];
      mockRepository.findByRoleAndFeature.mockResolvedValue(
        permissionsWithoutCreate
      );

      const result = await service.hasPermission(Role.ADMIN, 'users', 'create');

      expect(result).toBe(false);
    });

    it('should use getEffectivePermissions to check permissions', async () => {
      const mockEffectivePermissions = {
        create: true,
        delete: false,
        edit: true,
        view: true,
      };

      jest
        .spyOn(service, 'getEffectivePermissions')
        .mockResolvedValue(mockEffectivePermissions);

      const result = await service.hasPermission(Role.ADMIN, 'users', 'create');

      expect(service.getEffectivePermissions).toHaveBeenCalledWith(
        Role.ADMIN,
        'users'
      );
      expect(result).toBe(true);
    });

    it('should return false when effective permission is false', async () => {
      const mockEffectivePermissions = {
        create: false,
        delete: false,
        edit: false,
        view: false,
      };

      jest
        .spyOn(service, 'getEffectivePermissions')
        .mockResolvedValue(mockEffectivePermissions);

      const result = await service.hasPermission(Role.ADMIN, 'users', 'create');

      expect(result).toBe(false);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return direct permissions when no hierarchy exists', async () => {
      const adminUserPermissions = [
        mockAdminCreatePermission,
        mockAdminEditPermission,
        mockAdminViewPermission,
      ];
      mockRepository.findByRoleAndFeature.mockResolvedValue(
        adminUserPermissions
      );
      jest.spyOn(service as any, 'getInheritedPermissions').mockResolvedValue({
        create: false,
        delete: false,
        edit: false,
        view: false,
      });

      const result = await service.getEffectivePermissions(Role.ADMIN, 'users');

      expect(result).toEqual({
        create: true,
        delete: false,
        edit: true,
        view: true,
      });
    });

    it('should combine direct and hierarchy permissions', async () => {
      const directPermissions = [
        mockAdminEditPermission,
        mockAdminViewPermission,
      ];
      mockRepository.findByRoleAndFeature.mockResolvedValue(directPermissions);
      jest.spyOn(service as any, 'getInheritedPermissions').mockResolvedValue({
        create: true,
        delete: false,
        edit: false,
        view: true,
      });

      const result = await service.getEffectivePermissions(Role.ADMIN, 'users');

      expect(result).toEqual({
        create: true, // from hierarchy
        delete: false, // from direct
        edit: true, // from direct
        view: true, // from both
      });
    });

    it('should return all false when no permission exists', async () => {
      mockRepository.findByRoleAndFeature.mockResolvedValue([]);
      jest.spyOn(service as any, 'getInheritedPermissions').mockResolvedValue({
        create: false,
        delete: false,
        edit: false,
        view: false,
      });

      const result = await service.getEffectivePermissions(
        Role.VIEWER,
        'nonexistent'
      );

      expect(result).toEqual({
        create: false,
        delete: false,
        edit: false,
        view: false,
      });
    });
  });

  describe('getInheritedPermissions (private method)', () => {
    it('should return permissions from lower roles in hierarchy', async () => {
      // Mock repository calls for hierarchy check
      // For ADMIN role, lower roles are [VIEWER]
      mockRepository.findByRoleAndFeature.mockResolvedValueOnce([
        mockViewerViewPermission,
      ]); // VIEWER has permission

      const result = await (service as any).getInheritedPermissions(
        Role.ADMIN,
        'users'
      );

      expect(result).toEqual({
        create: false,
        delete: false,
        edit: false,
        view: true,
      });
    });

    it('should return all false when no lower roles have permissions', async () => {
      mockRepository.findByRoleAndFeature.mockResolvedValue([]);

      const result = await (service as any).getInheritedPermissions(
        Role.OWNER,
        'users'
      );

      expect(result).toEqual({
        create: false,
        delete: false,
        edit: false,
        view: false,
      });
    });
  });
});
