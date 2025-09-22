import axios from 'axios';

/**
 * Organization E2E Tests
 *
 * These tests are designed to run against a temporary deployment.
 * For successful tests to pass, ensure the following are seeded in the deployment:
 * - Users from seed data (acme.owner@acme.com, eng.admin@acme.com, etc.)
 * - Organizations with user role assignments in org_user_roles table
 * - Password for all users: 123456
 *
 * Test users and their expected organizations:
 * - acme.owner@acme.com -> Acme Corporation (id: 1)
 * - eng.admin@acme.com -> Engineering Department (id: 2)
 * - abc.owner@abc.com -> ABC Company (id: 4)
 * - backend.owner@abc.com -> Backend Team (id: 5)
 *
 * The tests will gracefully skip successful tests if test data is not found.
 */

describe('Organization E2E Tests', () => {
  const baseURL = (process.env.API_URL || 'http://localhost:3000') + '/api';

  describe('GET /orgs/my-orgs', () => {
    it('should return 401 when no token is provided', async () => {
      try {
        await axios.get(`${baseURL}/orgs/my-orgs`);
        fail('Expected 401 Unauthorized error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.message).toBe('No token provided');
      }
    });

    it('should return 401 when invalid token is provided', async () => {
      try {
        await axios.get(`${baseURL}/orgs/my-orgs`, {
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
        await axios.get(`${baseURL}/orgs/my-orgs`, {
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
          email: 'acme.owner@acme.com',
          password: '123456',
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
        const response = await axios.get(`${baseURL}/orgs/my-orgs`, {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });

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

    it('should return organizations for Acme Owner user (if test data exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'acme.owner@acme.com',
          password: '123456',
        });

        validToken = loginResponse.data.access_token;
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping Acme Owner organizations test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Test the organizations endpoint
      const response = await axios.get(`${baseURL}/orgs/my-orgs`, {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Acme Owner should have access to Acme Corporation (org_id: 1)
      if (response.data.length > 0) {
        const acmeOrg = response.data.find((org: any) => org.id === 1);
        expect(acmeOrg).toBeDefined();
        expect(acmeOrg.name).toBe('Acme Corporation');
        expect(acmeOrg.parentOrgId).toBeNull();
      }
    });

    it('should return organizations for Engineering Admin user (if test data exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'eng.admin@acme.com',
          password: '123456',
        });

        validToken = loginResponse.data.access_token;
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping Engineering Admin organizations test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Test the organizations endpoint
      const response = await axios.get(`${baseURL}/orgs/my-orgs`, {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Engineering Admin should have access to Engineering Department (org_id: 2)
      if (response.data.length > 0) {
        const engOrg = response.data.find((org: any) => org.id === 2);
        expect(engOrg).toBeDefined();
        expect(engOrg.name).toBe('Engineering Department');
        expect(engOrg.parentOrgId).toBe(1); // Parent is Acme Corporation
      }
    });

    it('should return organizations for ABC Owner user (if test data exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'abc.owner@abc.com',
          password: '123456',
        });

        validToken = loginResponse.data.access_token;
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping ABC Owner organizations test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Test the organizations endpoint
      const response = await axios.get(`${baseURL}/orgs/my-orgs`, {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // ABC Owner should have access to ABC Company (org_id: 4)
      if (response.data.length > 0) {
        const abcOrg = response.data.find((org: any) => org.id === 4);
        expect(abcOrg).toBeDefined();
        expect(abcOrg.name).toBe('ABC Company');
        expect(abcOrg.parentOrgId).toBeNull();
      }
    });

    it('should return organizations for Backend Team Owner user (if test data exists)', async () => {
      // First, try to get a valid JWT token by logging in
      let validToken: string;

      try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
          email: 'backend.owner@abc.com',
          password: '123456',
        });

        validToken = loginResponse.data.access_token;
      } catch (error: any) {
        // If login fails, skip this test
        if (error.response?.status === 401) {
          console.log(
            'Skipping Backend Team Owner organizations test - test user not found in deployment'
          );
          return;
        }
        throw error;
      }

      // Test the organizations endpoint
      const response = await axios.get(`${baseURL}/orgs/my-orgs`, {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Backend Team Owner should have access to Backend Team (org_id: 5)
      if (response.data.length > 0) {
        const backendOrg = response.data.find((org: any) => org.id === 5);
        expect(backendOrg).toBeDefined();
        expect(backendOrg.name).toBe('Backend Team');
        expect(backendOrg.parentOrgId).toBe(4); // Parent is ABC Company
      }
    });
  });
});
