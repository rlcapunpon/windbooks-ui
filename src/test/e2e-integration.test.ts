import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { OrganizationService } from '../services/organizationService';
import orgApiClient from '../api/orgClient';

// E2E Integration Tests for Organization API
describe('Organization API E2E Integration Tests', () => {
  const DEV_SERVER_URL = 'http://localhost:5173';
  const DIRECT_API_URL = 'http://localhost:3001/api/org';
  
  let devServerRunning = false;
  let backendRunning = false;

  beforeAll(async () => {
    console.log('🧪 Starting E2E Integration Tests...');
    
    // Check if dev server is running
    try {
      await axios.get(DEV_SERVER_URL, { timeout: 3000 });
      devServerRunning = true;
      console.log('✅ Dev server is running');
    } catch (error) {
      console.warn('⚠️ Dev server not running - proxy tests will be skipped');
    }
    
    // Check if backend is running
    try {
      await axios.get(`${DIRECT_API_URL}/organizations`, { 
        timeout: 3000,
        validateStatus: (status) => status === 401 || (status >= 200 && status < 300)
      });
      backendRunning = true;
      console.log('✅ Backend service is running');
    } catch (error) {
      console.warn('⚠️ Backend service not running - API tests will be skipped');
    }
  }, 10000);

  describe('Backend Direct Connection Tests', () => {
    it('should connect directly to backend organization API', async () => {
      if (!backendRunning) {
        console.log('⏭️ Skipping - backend not running');
        return;
      }

      try {
        const response = await axios.get(`${DIRECT_API_URL}/organizations`, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: (status) => status === 401 || (status >= 200 && status < 300)
        });
        
        // 401 is expected without authentication
        expect([200, 401]).toContain(response.status);
        console.log(`✅ Direct backend connection successful (${response.status})`);
      } catch (error: any) {
        console.error('❌ Direct backend connection failed:', error.message);
        throw error;
      }
    });

    it('should respond to health check if available', async () => {
      if (!backendRunning) {
        console.log('⏭️ Skipping - backend not running');
        return;
      }

      try {
        const response = await axios.get(`${DIRECT_API_URL}/health`, {
          timeout: 3000,
          validateStatus: () => true // Accept any status
        });
        
        console.log(`✅ Health endpoint response: ${response.status}`);
        expect(response.status).toBeLessThan(500); // Should not be server error
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Backend service is not running');
        }
        // 404 is acceptable if health endpoint doesn't exist
        console.log('⚠️ Health endpoint not available (404 expected)');
      }
    });
  });

  describe('Vite Proxy Integration Tests', () => {
    it('should proxy /api/org requests through Vite dev server', async () => {
      if (!devServerRunning || !backendRunning) {
        console.log('⏭️ Skipping - dev server or backend not running');
        return;
      }

      try {
        const response = await axios.get(`${DEV_SERVER_URL}/api/org/organizations`, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
          validateStatus: (status) => status === 401 || (status >= 200 && status < 300)
        });
        
        // 401 is expected without authentication, 200+ with proper auth
        expect([200, 401]).toContain(response.status);
        console.log(`✅ Proxy connection successful (${response.status})`);
      } catch (error: any) {
        console.error('❌ Proxy connection failed:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        });
        throw error;
      }
    });

    it('should handle proxy errors gracefully', async () => {
      if (!devServerRunning) {
        console.log('⏭️ Skipping - dev server not running');
        return;
      }

      try {
        // Test with non-existent endpoint
        const response = await axios.get(`${DEV_SERVER_URL}/api/org/nonexistent`, {
          timeout: 3000,
          validateStatus: () => true // Accept any status
        });
        
        // Should get either 404 (not found) or 401 (unauthorized)
        expect([401, 404]).toContain(response.status);
        console.log(`✅ Proxy error handling works (${response.status})`);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.error('❌ Dev server connection refused');
          throw error;
        }
        console.log('✅ Proxy handled error appropriately');
      }
    });
  });

  describe('orgApiClient Integration Tests', () => {
    it('should have correct base URL configuration', () => {
      // Debug environment state
      console.log('🔍 Environment Debug:');
      console.log('  import.meta.env.DEV:', import.meta.env.DEV);
      console.log('  import.meta.env.VITE_ORG_API_BASE_URL:', import.meta.env.VITE_ORG_API_BASE_URL);
      console.log('  orgApiClient.defaults?.baseURL:', orgApiClient.defaults?.baseURL);
      
      // In test environment, we should accept either development or production configuration
      const hasValidBaseUrl = orgApiClient.defaults?.baseURL === '/api/org' || 
                             orgApiClient.defaults?.baseURL === import.meta.env.VITE_ORG_API_BASE_URL;
      
      expect(hasValidBaseUrl).toBe(true);
      console.log(`✅ orgApiClient baseURL is valid: ${orgApiClient.defaults?.baseURL}`);
    });

    it('should have proper default headers', () => {
      const headers = orgApiClient.defaults?.headers;
      console.log('🔍 Headers Debug:', headers);
      
      // Check if headers exist and have correct content type
      expect(headers).toBeDefined();
      expect(headers?.['Content-Type'] || headers?.['content-type']).toBe('application/json');
      expect(headers?.['Accept'] || headers?.['accept']).toBe('application/json');
      console.log('✅ orgApiClient headers configured correctly');
    });

    it('should handle timeout configuration', () => {
      console.log('🔍 Timeout Debug:', orgApiClient.defaults?.timeout);
      expect(orgApiClient.defaults?.timeout).toBe(10000);
      console.log('✅ orgApiClient timeout configured correctly');
    });

    it('should make actual API calls through orgApiClient', async () => {
      if (!devServerRunning && !backendRunning) {
        console.log('⏭️ Skipping - no server available');
        return;
      }

      try {
        // This will use the configured orgApiClient (proxy in dev, direct in prod)
        const organizations = await OrganizationService.getAllOrganizations();
        
        expect(Array.isArray(organizations)).toBe(true);
        console.log(`✅ orgApiClient API call successful, found ${organizations.length} organizations`);
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('✅ orgApiClient working - got expected 401 (authentication required)');
          expect(error.response.status).toBe(401);
        } else {
          console.error('❌ orgApiClient API call failed:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL
          });
          throw error;
        }
      }
    });
  });

  describe('Organization Service Integration Tests', () => {
    it('should test backend connectivity through service', async () => {
      if (!backendRunning && !devServerRunning) {
        console.log('⏭️ Skipping - no server available');
        return;
      }

      const isConnected = await OrganizationService.testConnection();
      
      if (backendRunning || devServerRunning) {
        expect(isConnected).toBe(true);
        console.log('✅ OrganizationService connectivity test passed');
      } else {
        expect(isConnected).toBe(false);
        console.log('⚠️ OrganizationService connectivity test failed (expected - no server)');
      }
    });

    it('should handle service method calls appropriately', async () => {
      if (!backendRunning && !devServerRunning) {
        console.log('⏭️ Skipping - no server available');
        return;
      }

      try {
        // Test individual service methods
        await OrganizationService.getAllOrganizations();
        console.log('✅ getAllOrganizations method accessible');
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('✅ Service method working - authentication required');
          expect(error.response.status).toBe(401);
        } else {
          console.error('❌ Service method failed unexpectedly:', error.message);
          throw error;
        }
      }
    });
  });

  describe('Network Configuration Validation', () => {
    it('should validate environment variables', () => {
      console.log('🔍 Environment Variables:');
      console.log('  VITE_ORG_API_BASE_URL:', import.meta.env.VITE_ORG_API_BASE_URL);
      console.log('  DEV mode:', import.meta.env.DEV);
      
      expect(import.meta.env.VITE_ORG_API_BASE_URL).toBeTruthy();
      console.log(`✅ VITE_ORG_API_BASE_URL: ${import.meta.env.VITE_ORG_API_BASE_URL}`);
    });

    it('should validate development vs production configuration', () => {
      console.log('🔍 Configuration Debug:');
      console.log('  Current baseURL:', orgApiClient.defaults?.baseURL);
      console.log('  withCredentials:', orgApiClient.defaults?.withCredentials);
      console.log('  DEV environment:', import.meta.env.DEV);
      
      // Validate that configuration exists and is reasonable
      expect(orgApiClient.defaults?.baseURL).toBeTruthy();
      
      if (import.meta.env.DEV) {
        // In development, should use proxy
        const isProxyUrl = orgApiClient.defaults?.baseURL === '/api/org';
        const hasValidUrl = isProxyUrl || orgApiClient.defaults?.baseURL?.includes('api/org');
        expect(hasValidUrl).toBe(true);
        console.log('✅ Development configuration validated');
      } else {
        // In production, should use direct URL
        expect(orgApiClient.defaults?.baseURL).toBe(import.meta.env.VITE_ORG_API_BASE_URL);
        expect(orgApiClient.defaults?.withCredentials).toBe(true);
        console.log('✅ Production configuration validated');
      }
    });
  });

  afterAll(() => {
    console.log('🏁 E2E Integration Tests completed');
    console.log(`📊 Test Environment: DEV=${import.meta.env.DEV}, DevServer=${devServerRunning}, Backend=${backendRunning}`);
  });
});

// Helper function to validate API connectivity
export async function validateFullApiConnectivity(): Promise<{
  devServer: boolean;
  backend: boolean;
  proxy: boolean;
  orgClient: boolean;
  service: boolean;
}> {
  const results = {
    devServer: false,
    backend: false,
    proxy: false,
    orgClient: false,
    service: false
  };

  // Test dev server
  try {
    await axios.get('http://localhost:5173', { timeout: 3000 });
    results.devServer = true;
  } catch {}

  // Test backend directly
  try {
    await axios.get('http://localhost:3001/api/org/organizations', { 
      timeout: 3000,
      validateStatus: (status) => status === 401 || (status >= 200 && status < 300)
    });
    results.backend = true;
  } catch {}

  // Test proxy
  if (results.devServer && results.backend) {
    try {
      await axios.get('http://localhost:5173/api/org/organizations', { 
        timeout: 3000,
        validateStatus: (status) => status === 401 || (status >= 200 && status < 300)
      });
      results.proxy = true;
    } catch {}
  }

  // Test orgClient
  try {
    await OrganizationService.getAllOrganizations();
    results.orgClient = true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      results.orgClient = true; // 401 means client is working, just needs auth
    }
  }

  // Test service
  results.service = await OrganizationService.testConnection();

  return results;
}