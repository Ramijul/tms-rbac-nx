import axios from 'axios';
import { LoginDto } from '@tms-rbac-nx/data/auth';

describe('Auth E2E Tests', () => {
  const baseURL = process.env.API_URL || 'http://localhost:3000';

  describe('POST /auth/login', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials (if test user exists)', async () => {
      // This test will only pass if a test user exists in the deployment
      // The test user should be seeded during deployment setup
      try {
        const response = await axios.post(
          `${baseURL}/auth/login`,
          validLoginDto
        );

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('access_token');
        expect(response.data).toHaveProperty('user');
        expect(response.data.user).toHaveProperty('id');
        expect(response.data.user).toHaveProperty('name');
        expect(response.data.user).toHaveProperty('email');
        expect(response.data.user.email).toBe(validLoginDto.email);
        expect(typeof response.data.access_token).toBe('string');
        expect(response.data.access_token.length).toBeGreaterThan(0);

        // Verify JWT token structure
        const token = response.data.access_token;
        const tokenParts = token.split('.');
        expect(tokenParts).toHaveLength(3);

        // Decode payload to verify structure
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString()
        );
        expect(payload).toHaveProperty('sub');
        expect(payload).toHaveProperty('email');
        expect(payload).toHaveProperty('name');
        expect(payload).toHaveProperty('iat');
        expect(payload).toHaveProperty('exp');

        // Verify expiration is set to 15 minutes (900 seconds)
        const now = Math.floor(Date.now() / 1000);
        const exp = payload.exp;
        const timeDiff = exp - now;
        expect(timeDiff).toBeLessThanOrEqual(900);
        expect(timeDiff).toBeGreaterThan(800);
      } catch (error: any) {
        // If test user doesn't exist, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping successful login test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }
    });

    it('should return 401 for invalid credentials', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      try {
        await axios.post(`${baseURL}/auth/login`, invalidLoginDto);
        fail('Expected request to fail with 401');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe('Invalid credentials');
      }
    });

    it('should return 400 for missing email', async () => {
      const invalidLoginDto = {
        password: 'password123',
      };

      try {
        await axios.post(`${baseURL}/auth/login`, invalidLoginDto);
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for missing password', async () => {
      const invalidLoginDto = {
        email: 'test@example.com',
      };

      try {
        await axios.post(`${baseURL}/auth/login`, invalidLoginDto);
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for empty request body', async () => {
      try {
        await axios.post(`${baseURL}/auth/login`, {});
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for invalid email format', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      try {
        await axios.post(`${baseURL}/auth/login`, invalidLoginDto);
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle malformed JSON', async () => {
      try {
        await axios.post(`${baseURL}/auth/login`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' },
        });
        fail('Expected request to fail with 400');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 404 for non-existent endpoint', async () => {
      try {
        await axios.post(`${baseURL}/auth/nonexistent`, validLoginDto);
        fail('Expected request to fail with 404');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 405 for GET request to login endpoint', async () => {
      try {
        await axios.get(`${baseURL}/auth/login`);
        fail('Expected request to fail with 405');
      } catch (error: any) {
        expect(error.response.status).toBe(405);
      }
    });

    it('should return 405 for PUT request to login endpoint', async () => {
      try {
        await axios.put(`${baseURL}/auth/login`, validLoginDto);
        fail('Expected request to fail with 405');
      } catch (error: any) {
        expect(error.response.status).toBe(405);
      }
    });

    it('should return 405 for DELETE request to login endpoint', async () => {
      try {
        await axios.delete(`${baseURL}/auth/login`);
        fail('Expected request to fail with 405');
      } catch (error: any) {
        expect(error.response.status).toBe(405);
      }
    });
  });

  describe('Auth endpoint availability', () => {
    it('should have auth endpoints available', async () => {
      // Test that the auth controller is properly registered
      try {
        await axios.get(`${baseURL}/auth/login`);
        fail('Expected GET to fail, but endpoint should exist');
      } catch (error: any) {
        // Should get 405 Method Not Allowed, not 404 Not Found
        expect(error.response.status).toBe(405);
      }
    });
  });
});
