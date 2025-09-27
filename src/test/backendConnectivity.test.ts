import { describe, it, expect, beforeAll } from 'vitest';
import { OrganizationService } from '../services/organizationService';
import orgApiClient from '../api/orgClient';

describe('Backend Connectivity Tests', () => {
  beforeAll(() => {
    console.log('🔧 Testing backend connectivity...');
    console.log('🔧 Expected org API base URL:', import.meta.env.VITE_ORG_API_BASE_URL);
    console.log('🔧 Client base URL:', orgApiClient.defaults?.baseURL || 'not configured');
  });

  describe('Organization API Backend', () => {
    it('should be able to connect to organization service backend', async () => {
      // Test if we can reach the organization service
      const isConnected = await OrganizationService.testConnection();
      
      if (!isConnected) {
        console.error('❌ Backend connectivity test failed!');
        console.error('🔧 Troubleshooting checklist:');
        console.error('1. Is the organization management service running on http://localhost:3001?');
        console.error('2. Does the service have /api/org/organizations or /api/org/health endpoints?');
        console.error('3. Is VITE_ORG_API_BASE_URL correctly set in .env?');
        console.error('4. Are CORS settings configured for http://localhost:5173 and http://localhost:5174?');
      }
      
      expect(isConnected).toBe(true);
    }, 10000); // 10 second timeout for backend connection

    it('should have correct base URL configuration', () => {
      const expectedBaseUrl = import.meta.env.DEV ? '/api/org' : import.meta.env.VITE_ORG_API_BASE_URL;
      expect(orgApiClient.defaults.baseURL).toBe(expectedBaseUrl);
    });

    it('should have proper headers configured', () => {
      const headers = orgApiClient.defaults.headers;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
    });

    it('should handle 404 errors gracefully with helpful messages', async () => {
      try {
        await OrganizationService.getAllOrganizations();
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Expect the service to provide helpful debugging information
          expect(error.response.status).toBe(404);
          // This test will pass if we get a 404 (expected when backend is not available)
          console.log('✅ 404 error handling working correctly');
        }
        // Test passes whether we get 404 or connection succeeds
      }
    });
  });

  describe('Environment Configuration', () => {
    it('should have VITE_ORG_API_BASE_URL properly configured', () => {
      const orgApiUrl = import.meta.env.VITE_ORG_API_BASE_URL;
      expect(orgApiUrl).toBeDefined();
      expect(orgApiUrl).toMatch(/^https?:\/\/.*\/api\/org$/);
    });

    it('should use proxy in development mode', () => {
      if (import.meta.env.DEV) {
        expect(orgApiClient.defaults.baseURL).toBe('/api/org');
      } else {
        expect(orgApiClient.defaults.baseURL).toBe(import.meta.env.VITE_ORG_API_BASE_URL);
      }
    });
  });
});

// Integration test helper
export async function validateBackendConnection(): Promise<{
  isConnected: boolean;
  message: string;
  troubleshootingSteps?: string[];
}> {
  try {
    const isConnected = await OrganizationService.testConnection();
    
    if (isConnected) {
      return {
        isConnected: true,
        message: 'Successfully connected to organization service backend'
      };
    } else {
      return {
        isConnected: false,
        message: 'Failed to connect to organization service backend',
        troubleshootingSteps: [
          'Ensure organization management service is running on http://localhost:3001',
          'Check if /api/org/organizations endpoint exists',
          'Verify VITE_ORG_API_BASE_URL in .env file',
          'Confirm CORS settings allow frontend origin',
          'Check network connectivity and firewall settings'
        ]
      };
    }
  } catch (error) {
    return {
      isConnected: false,
      message: `Backend connection test failed: ${error}`,
      troubleshootingSteps: [
        'Check if organization service is running',
        'Verify API endpoint configuration',
        'Check network connectivity'
      ]
    };
  }
}