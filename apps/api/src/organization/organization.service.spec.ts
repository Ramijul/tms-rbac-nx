import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { Organization } from './entities/organization.entity';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockRepository: jest.Mocked<OrganizationRepository>;

  const mockOrganization: Organization = {
    id: 1,
    name: 'Test Organization',
    parentOrgId: null,
    parentOrganization: null,
  };

  const mockChildOrganization: Organization = {
    id: 2,
    name: 'Child Organization',
    parentOrgId: 1,
    parentOrganization: mockOrganization,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findTopLevelOrganizations: jest.fn(),
      findByParentId: jest.fn(),
      findChildren: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    mockRepository = module.get(OrganizationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const expectedOrganizations = [mockOrganization, mockChildOrganization];
      mockRepository.findAll.mockResolvedValue(expectedOrganizations);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedOrganizations);
    });
  });

  describe('findById', () => {
    it('should return organization by id', async () => {
      mockRepository.findById.mockResolvedValue(mockOrganization);

      const result = await service.findById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrganization);
    });

    it('should return null when organization not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findTopLevelOrganizations', () => {
    it('should return top level organizations', async () => {
      const topLevelOrgs = [mockOrganization];
      mockRepository.findTopLevelOrganizations.mockResolvedValue(topLevelOrgs);

      const result = await service.findTopLevelOrganizations();

      expect(mockRepository.findTopLevelOrganizations).toHaveBeenCalled();
      expect(result).toEqual(topLevelOrgs);
    });
  });

  describe('findByParentId', () => {
    it('should return organizations by parent id', async () => {
      const childOrgs = [mockChildOrganization];
      mockRepository.findByParentId.mockResolvedValue(childOrgs);

      const result = await service.findByParentId(1);

      expect(mockRepository.findByParentId).toHaveBeenCalledWith(1);
      expect(result).toEqual(childOrgs);
    });
  });

  describe('findChildren', () => {
    it('should return children of organization', async () => {
      const children = [mockChildOrganization];
      mockRepository.findChildren.mockResolvedValue(children);

      const result = await service.findChildren(1);

      expect(mockRepository.findChildren).toHaveBeenCalledWith(1);
      expect(result).toEqual(children);
    });
  });
});
