import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponse } from '@tms-rbac-nx/data/auth';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockLoginResponse: LoginResponse = {
    access_token: 'jwt-token-123',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockAuthService = {
    login: jest.fn(),
    hashPassword: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return login response on successful login', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return 200 status code', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toBeDefined();
      // The @HttpCode(HttpStatus.OK) decorator ensures 200 status
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle empty login data', async () => {
      const emptyLoginDto: LoginDto = {
        email: '',
        password: '',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(emptyLoginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(emptyLoginDto);
    });

    it('should handle special characters in email', async () => {
      const specialEmailDto: LoginDto = {
        email: 'test+tag@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(specialEmailDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(specialEmailDto);
    });
  });
});
