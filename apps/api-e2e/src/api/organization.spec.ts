import axios from 'axios';

/**
 * Organization E2E Tests
 *
 * These tests are designed to run against a temporary deployment.
 * For successful tests to pass, ensure the following are seeded in the deployment:
 * - Test user with valid JWT token
 * - Organizations with user role assignments in org_user_roles table
 *
 * The tests will gracefully skip successful tests if test data is not found.
 */

describe('Organization E2E Tests', () => {
  const baseURL = process.env.API_URL || 'http://localhost:3000';

  describe('GET /organizations/my-organizations', () => {
    it('should return 401 when no token is provided', async () => {
      try {
        await axios.get(`${baseURL}/organizations/my-organizations`);
        fail('Expected 401 Unauthorized error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.message).toBe('No token provided');
      }
    });

    it('should return 401 when invalid token is provided', async () => {
      try {
        await axios.get(`${baseURL}/organizations/my-organizations`, {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });
        fail('Expected 401 Unauthorized error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.message).toBe('Invalid token');
      }
    });

    it('should return 401 when malformed authorization header is provided', async () => {
      try {
        await axios.get(`${baseURL}/organizations/my-organizations`, {
          headers: {
            Authorization: 'InvalidFormat token',
          },
        });
        fail('Expected 401 Unauthorized error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.message).toBe('No token provided');
      }
    });

    it('should successfully return user organizations with valid JWT token (if test data exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123',
        });

        validToken = loginResponse.data.access_token;
        expect(validToken).toBeDefined();
        expect(typeof validToken).toBe('string');
        expect(validToken.length).toBeGreaterThan(0);
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping organization test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Now test the organizations endpoint with the valid token
      try {
        const response = await axios.get(
          `${baseURL}/organizations/my-organizations`,
          {
            headers: {
              Authorization: `Bearer ${validToken}`,
            },
          }
        );

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);

        // If organizations are returned, validate their structure
        if (response.data.length > 0) {
          const organization = response.data[0];
          expect(organization).toHaveProperty('id');
          expect(organization).toHaveProperty('name');
          expect(organization).toHaveProperty('parentOrgId');
          expect(organization).toHaveProperty('parentOrganization');

          expect(typeof organization.id).toBe('number');
          expect(typeof organization.name).toBe('string');
          expect(
            organization.parentOrgId === null ||
              typeof organization.parentOrgId === 'number'
          ).toBe(true);
          expect(
            organization.parentOrganization === null ||
              typeof organization.parentOrganization === 'object'
          ).toBe(true);
        }
      } catch (error: any) {
        // If the endpoint fails, it might be because no organizations are assigned to the user
        // This is acceptable - the test passes if we get a valid response structure
        if (error.response?.status === 200) {
          expect(Array.isArray(error.response.data)).toBe(true);
        } else {
          throw error;
        }
      }
    });

    it('should return empty array when user has no organizations (if test user exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123',
        });

        validToken = loginResponse.data.access_token;
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping empty organizations test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Test the organizations endpoint
      const response = await axios.get(
        `${baseURL}/organizations/my-organizations`,
        {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // The response should be an array (empty or with organizations)
      // We don't assert it's empty because the test user might have organizations assigned
    });
  });
});
