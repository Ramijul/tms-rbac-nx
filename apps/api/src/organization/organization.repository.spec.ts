import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationRepository } from './organization.repository';
import { Organization } from './organization.entity';

describe('OrganizationRepository', () => {
  let repository: OrganizationRepository;
  let mockRepository: jest.Mocked<Repository<Organization>>;

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
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationRepository,
        {
          provide: getRepositoryToken(Organization),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<OrganizationRepository>(OrganizationRepository);
    mockRepository = module.get(getRepositoryToken(Organization));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all organizations with parent relationships', async () => {
      const expectedOrganizations = [mockOrganization, mockChildOrganization];
      mockRepository.find.mockResolvedValue(expectedOrganizations);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['parentOrganization'],
      });
      expect(result).toEqual(expectedOrganizations);
    });

    it('should return empty array when no organizations exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return organization by id with parent relationship', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrganization);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['parentOrganization'],
      });
      expect(result).toEqual(mockOrganization);
    });

    it('should return null when organization not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findTopLevelOrganizations', () => {
    it('should return organizations with null parentOrgId', async () => {
      const topLevelOrgs = [mockOrganization];
      mockRepository.find.mockResolvedValue(topLevelOrgs);

      const result = await repository.findTopLevelOrganizations();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parentOrgId: null },
        relations: ['parentOrganization'],
      });
      expect(result).toEqual(topLevelOrgs);
    });
  });

  describe('findByParentId', () => {
    it('should return organizations with specific parentOrgId', async () => {
      const childOrgs = [mockChildOrganization];
      mockRepository.find.mockResolvedValue(childOrgs);

      const result = await repository.findByParentId(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parentOrgId: 1 },
        relations: ['parentOrganization'],
      });
      expect(result).toEqual(childOrgs);
    });
  });

  describe('findChildren', () => {
    it('should return children of specific organization', async () => {
      const children = [mockChildOrganization];
      mockRepository.find.mockResolvedValue(children);

      const result = await repository.findChildren(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parentOrgId: 1 },
        relations: ['parentOrganization'],
      });
      expect(result).toEqual(children);
    });
  });
});
