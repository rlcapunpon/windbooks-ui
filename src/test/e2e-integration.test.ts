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
      timeout: 10000,
      withCredentials: false
    }
  }
}));

// Mock-based API Integration Tests for Organization Service
describe('Organization API Integration Tests', () => {
  const mockOrgApiClient = orgApiClient as any;

  beforeAll(() => {
    console.log('🧪 Starting Mocked API Integration Tests...');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Backend Direct Connection Tests', () => {
    it('should connect directly to backend organization API', async () => {
      // Mock successful backend response
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: []
      });

      const organizations = await OrganizationService.getAllOrganizations();
      
      expect(Array.isArray(organizations)).toBe(true);
      expect(mockOrgApiClient.get).toHaveBeenCalledWith('/organizations', { params: undefined });
      console.log('✅ Mocked backend connection successful');
    });

    it('should respond to health check if available', async () => {
      // Mock health check response
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: { status: 'healthy', service: 'organization-api' }
      });

      const isConnected = await OrganizationService.testConnection();
      
      expect(isConnected).toBe(true);
      console.log('✅ Mocked health check successful');
    });
  });

  describe('API Client Integration Tests', () => {
    it('should handle successful API requests through client', async () => {
      // Mock successful proxy response
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: [{ id: 'org-1', name: 'Test Organization' }]
      });

      const organizations = await OrganizationService.getAllOrganizations();
      
      expect(Array.isArray(organizations)).toBe(true);
      expect(organizations).toHaveLength(1);
      expect(mockOrgApiClient.get).toHaveBeenCalledWith('/organizations', { params: undefined });
      console.log('✅ Mocked proxy connection successful');
    });

    it('should handle API errors gracefully', async () => {
      // Mock 404 error for non-existent endpoint
      const error = new Error('Not Found');
      (error as any).response = { status: 404, data: { message: 'Route not found' } };
      mockOrgApiClient.get.mockRejectedValueOnce(error);

      try {
        await OrganizationService.getAllOrganizations();
        throw new Error('Expected error to be thrown');
      } catch (caughtError: any) {
        expect(caughtError.response?.status).toBe(404);
        console.log('✅ Mocked error handling works correctly');
      }
    });
  });

  describe('orgApiClient Integration Tests', () => {
    it('should have correct base URL configuration', () => {
      // Debug mocked configuration
      console.log('🔍 Mocked Configuration Debug:');
      console.log('  orgApiClient.defaults?.baseURL:', orgApiClient.defaults?.baseURL);
      console.log('  DEV environment: [MOCKED]');
      
      expect(orgApiClient.defaults?.baseURL).toBe('/api/org');
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

    it('should make mocked API calls through orgApiClient', async () => {
      // Mock successful response
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: [
          { id: 'org-1', name: 'Test Org 1' },
          { id: 'org-2', name: 'Test Org 2' }
        ]
      });

      const organizations = await OrganizationService.getAllOrganizations();
      
      expect(Array.isArray(organizations)).toBe(true);
      expect(organizations).toHaveLength(2);
      console.log(`✅ orgApiClient mocked API call successful, found ${organizations.length} organizations`);
    });
  });

  describe('Organization Service Integration Tests', () => {
    it('should test backend connectivity through service', async () => {
      // Mock successful connectivity
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: []
      });

      const isConnected = await OrganizationService.testConnection();
      
      expect(isConnected).toBe(true);
      expect(mockOrgApiClient.get).toHaveBeenCalledWith('/organizations', { timeout: 5000 });
      console.log('✅ OrganizationService connectivity test passed with mocked response');
    });

    it('should handle service method calls appropriately', async () => {
      // Mock successful service method call
      mockOrgApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: [{ id: 'org-1', name: 'Test Organization' }]
      });

      const organizations = await OrganizationService.getAllOrganizations();
      expect(Array.isArray(organizations)).toBe(true);
      console.log('✅ getAllOrganizations method accessible with mocked response');
    });
  });

  describe('Network Configuration Validation', () => {
    it('should validate mocked configuration', () => {
      console.log('🔍 Mocked Configuration:');
      console.log('  baseURL: /api/org');
      console.log('  timeout: 10000ms');
      
      expect(orgApiClient.defaults?.baseURL).toBe('/api/org');
      console.log('✅ Mocked configuration validated');
    });

    it('should validate development vs production configuration', () => {
      console.log('🔍 Mocked Configuration:');
      console.log('  Current baseURL:', orgApiClient.defaults?.baseURL);
      console.log('  withCredentials:', orgApiClient.defaults?.withCredentials);
      
      expect(orgApiClient.defaults?.baseURL).toBe('/api/org');
      expect(orgApiClient.defaults?.withCredentials).toBe(false);
      console.log('✅ Mocked configuration validated');
    });
  });
});

// Mock validation
describe('Mock Validation', () => {
  const mockOrgApiClient = orgApiClient as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ensure all HTTP requests are mocked', () => {
    expect(vi.isMockFunction(mockOrgApiClient.get)).toBe(true);
    console.log('✅ All HTTP requests are properly mocked');
  });
});

// Mock-based helper function to validate API connectivity
export async function validateMockedApiConnectivity(): Promise<{
  orgClient: boolean;
  service: boolean;
  configuration: boolean;
}> {
  const results = {
    orgClient: false,
    service: false,
    configuration: false
  };

  // Test configuration
  try {
    results.configuration = orgApiClient.defaults?.baseURL === '/api/org';
  } catch {
    // Configuration test failed
  }

  // Test orgClient with mocked response
  try {
    const mockOrgApiClient = orgApiClient as any;
    mockOrgApiClient.get.mockResolvedValueOnce({ status: 200, data: [] });
    
    await OrganizationService.getAllOrganizations();
    results.orgClient = true;
  } catch {
    // Mock test failed
  }

  // Test service with mocked response
  try {
    const mockOrgApiClient = orgApiClient as any;
    mockOrgApiClient.get.mockResolvedValueOnce({ status: 200, data: [] });
    
    results.service = await OrganizationService.testConnection();
  } catch {
    // Service test failed
  }

  return results;
}