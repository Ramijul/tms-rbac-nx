import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { User } from './auth.entity';
import { LoginDto } from '@tms-rbac-nx/data/auth';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Fix the mock types
(mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
(mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token and user data on successful login', async () => {
      const expectedToken = 'jwt-token-123';
      const expectedPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload, {
        expiresIn: '15m',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials'
      );

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials'
      );

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison errors', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error')
      );

      await expect(service.login(loginDto)).rejects.toThrow('Bcrypt error');

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const saltRounds = 10;

      (mockedBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
    });
  });

  describe('validateUser', () => {
    it('should return user when found by id', async () => {
      mockAuthRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('1');

      expect(result).toEqual(mockUser);
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when user not found by id', async () => {
      mockAuthRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser('999');

      expect(result).toBeNull();
      expect(mockAuthRepository.findById).toHaveBeenCalledWith('999');
    });
  });
});
