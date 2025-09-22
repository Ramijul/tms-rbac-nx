import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRepository } from './permission.repository';
import { Permission } from './permission.entity';
import { Role, PermissionAction } from '@tms-rbac-nx/data/role.enum';

describe('PermissionRepository', () => {
  let repository: PermissionRepository;
  let mockRepository: jest.Mocked<Repository<Permission>>;

  const mockCreatePermission: Permission = {
    id: 1,
    role: Role.ADMIN,
    feature: 'users',
    action: 'create',
  };

  const mockEditPermission: Permission = {
    id: 2,
    role: Role.ADMIN,
    feature: 'users',
    action: 'edit',
  };

  const mockViewPermission: Permission = {
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

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionRepository,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<PermissionRepository>(PermissionRepository);
    mockRepository = module.get(getRepositoryToken(Permission));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const expectedPermissions = [
        mockCreatePermission,
        mockEditPermission,
        mockViewPermission,
      ];
      mockRepository.find.mockResolvedValue(expectedPermissions);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(expectedPermissions);
    });

    it('should return empty array when no permissions exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return permission by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCreatePermission);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCreatePermission);
    });

    it('should return null when permission not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should return permissions for specific role', async () => {
      const adminPermissions = [mockCreatePermission, mockEditPermission];
      mockRepository.find.mockResolvedValue(adminPermissions);

      const result = await repository.findByRole(Role.ADMIN);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { role: Role.ADMIN },
      });
      expect(result).toEqual(adminPermissions);
    });
  });

  describe('findByFeature', () => {
    it('should return permissions for specific feature', async () => {
      const userPermissions = [
        mockCreatePermission,
        mockEditPermission,
        mockOwnerDeletePermission,
      ];
      mockRepository.find.mockResolvedValue(userPermissions);

      const result = await repository.findByFeature('users');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { feature: 'users' },
      });
      expect(result).toEqual(userPermissions);
    });
  });

  describe('findByRoleAndFeature', () => {
    it('should return permissions for specific role and feature', async () => {
      const adminUserPermissions = [mockCreatePermission, mockEditPermission];
      mockRepository.find.mockResolvedValue(adminUserPermissions);

      const result = await repository.findByRoleAndFeature(Role.ADMIN, 'users');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { role: Role.ADMIN, feature: 'users' },
      });
      expect(result).toEqual(adminUserPermissions);
    });

    it('should return empty array when no permissions found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await repository.findByRoleAndFeature(
        Role.VIEWER,
        'users'
      );

      expect(result).toEqual([]);
    });
  });

  describe('findByRoleFeatureAndAction', () => {
    it('should return permission for specific role, feature and action', async () => {
      mockRepository.findOne.mockResolvedValue(mockCreatePermission);

      const result = await repository.findByRoleFeatureAndAction(
        Role.ADMIN,
        'users',
        'create'
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { role: Role.ADMIN, feature: 'users', action: 'create' },
      });
      expect(result).toEqual(mockCreatePermission);
    });

    it('should return null when permission not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByRoleFeatureAndAction(
        Role.VIEWER,
        'users',
        'create'
      );

      expect(result).toBeNull();
    });
  });

  describe('findRolesWithPermission', () => {
    it('should return roles with specific permission for feature', async () => {
      const permissionsWithCreate = [
        mockCreatePermission,
        mockOwnerDeletePermission,
      ];
      mockRepository.find.mockResolvedValue(permissionsWithCreate);

      const result = await repository.findRolesWithPermission(
        'users',
        'create'
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { feature: 'users', action: 'create' },
      });
      expect(result).toEqual([Role.ADMIN, Role.OWNER]);
    });

    it('should return empty array when no roles have permission', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await repository.findRolesWithPermission(
        'users',
        'delete'
      );

      expect(result).toEqual([]);
    });

    it('should work with different permission actions', async () => {
      const permissionsWithView = [mockViewPermission, mockCreatePermission];
      mockRepository.find.mockResolvedValue(permissionsWithView);

      const result = await repository.findRolesWithPermission('users', 'view');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { feature: 'users', action: 'view' },
      });
      expect(result).toEqual([Role.ADMIN, Role.ADMIN]);
    });
  });
});
