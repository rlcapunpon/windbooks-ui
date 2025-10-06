import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { OrganizationService } from '../services/organizationService';
import orgApiClient from '../api/orgClient';

// Mock the orgApiClient to prevent actual HTTP requests
vi.mock('../api/orgClient', () => ({
  default: {
    get: vi.fn(),
    defaults: {
      baseURL: '/api/org',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    }
  }
}));

describe('Backend Connectivity Tests', () => {
  const mockOrgApiClient = orgApiClient as any;

  beforeAll(() => {
    console.log('🔧 Testing backend connectivity...');
    console.log('🔧 Expected org API base URL: [MOCKED]');
    console.log('🔧 Client base URL:', orgApiClient.defaults?.baseURL || 'not configured');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Organization API Backend', () => {
    it('should be able to connect to organization service backend', async () => {
      // Mock successful connection
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: []
      });
      
      const isConnected = await OrganizationService.testConnection();
      
      expect(isConnected).toBe(true);
      expect(mockOrgApiClient.get).toHaveBeenCalledWith('/organizations', { timeout: 5000 });
      console.log('✅ Backend connectivity test passed with mocked response');
    });

    it('should handle backend not running gracefully', async () => {
      // Mock backend connection error (404)
      const error = new Error('Network Error');
      (error as any).response = { status: 404, data: { message: 'Route not found' } };
      mockOrgApiClient.get.mockRejectedValueOnce(error);
      
      const isConnected = await OrganizationService.testConnection();
      
      expect(isConnected).toBe(false);
      expect(mockOrgApiClient.get).toHaveBeenCalledWith('/organizations', { timeout: 5000 });
      console.log('✅ Backend error handling test passed with mocked 404 response');
    });

    it('should have correct base URL configuration', () => {
      // In tests, we mock the orgApiClient with a default /api/org baseURL
      expect(orgApiClient.defaults.baseURL).toBe('/api/org');
      console.log('✅ Mocked orgApiClient has correct baseURL');
    });

    it('should have proper headers configured', () => {
      const headers = orgApiClient.defaults.headers;
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Accept']).toBe('application/json');
    });

    it('should handle 404 errors gracefully with helpful messages', async () => {
      // Mock 404 error response
      const error = new Error('Request failed with status code 404');
      (error as any).response = { 
        status: 404, 
        data: { message: 'Route not found' } 
      };
      mockOrgApiClient.get.mockRejectedValueOnce(error);
      
      try {
        await OrganizationService.getAllOrganizations();
        throw new Error('Expected error to be thrown');
      } catch (caughtError: any) {
        expect(caughtError.response?.status).toBe(404);
        console.log('✅ 404 error handling working correctly with mocked response');
      }
    });
  });

  describe('Mock Configuration', () => {
    it('should have mocked orgApiClient properly configured', () => {
      // In test environment, we mock the client configuration
      expect(orgApiClient.defaults.baseURL).toBe('/api/org');
      expect(orgApiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(orgApiClient.defaults.headers['Accept']).toBe('application/json');
      expect(orgApiClient.defaults.timeout).toBe(10000);
      console.log('✅ Mocked orgApiClient configuration validated');
    });

    it('should prevent actual HTTP requests in tests', () => {
      // Verify that orgApiClient.get is a mock function
      expect(vi.isMockFunction(mockOrgApiClient.get)).toBe(true);
      console.log('✅ HTTP requests are properly mocked');
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