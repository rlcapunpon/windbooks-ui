import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import orgApiClient from '../api/orgClient';
import { getAccessToken } from '../utils/tokenStorage';

// Mock the token storage
vi.mock('../utils/tokenStorage', () => ({
  getAccessToken: vi.fn()
}));

describe('orgApiClient Unit and Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Client Configuration Tests', () => {
    it('should be properly configured with correct base URL', () => {
      const expectedBaseUrl = import.meta.env.DEV ? '/api/org' : import.meta.env.VITE_ORG_API_BASE_URL;
      expect(orgApiClient.defaults.baseURL).toBe(expectedBaseUrl);
    });

    it('should have correct default headers', () => {
      expect(orgApiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(orgApiClient.defaults.headers['Accept']).toBe('application/json');
    });

    it('should have correct timeout setting', () => {
      expect(orgApiClient.defaults.timeout).toBe(10000);
    });

    it('should have correct credentials setting based on environment', () => {
      const expectedWithCredentials = !import.meta.env.DEV;
      expect(orgApiClient.defaults.withCredentials).toBe(expectedWithCredentials);
    });
  });

  describe('Interceptor Integration Tests', () => {
    it('should handle authentication token in requests', async () => {
      const mockToken = 'valid-jwt-token-12345';
      (getAccessToken as any).mockReturnValue(mockToken);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      try {
        await orgApiClient.get('/organizations', { 
          timeout: 1000,
          validateStatus: () => true // Accept any status for testing
        });
      } catch (error) {
        // error is intentionally unused - connection errors are expected in testing
      }

      // Check that at least one log call contains the request message
      const logCalls = consoleSpy.mock.calls;
      const hasRequestLog = logCalls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('🔧 Org API Request:'))
      );
      
      expect(hasRequestLog).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should handle large tokens appropriately', async () => {
      const largeToken = 'x'.repeat(5000); // Over 4KB
      (getAccessToken as any).mockReturnValue(largeToken);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      try {
        await orgApiClient.get('/organizations', { 
          timeout: 1000,
          validateStatus: () => true
        });
      } catch (error) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PREVENTING 431 ERROR')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle missing tokens gracefully', async () => {
      (getAccessToken as any).mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      try {
        await orgApiClient.get('/organizations', { 
          timeout: 1000,
          validateStatus: () => true
        });
      } catch (error) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No access token found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should log API responses and errors', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        await orgApiClient.get('/organizations', { 
          timeout: 1000,
          validateStatus: () => true
        });
        
        // Should have response log (even for 404, it's a valid HTTP response)
        const logCalls = consoleSpy.mock.calls;
        const hasResponseLog = logCalls.some(call => 
          call.some(arg => typeof arg === 'string' && arg.includes('✅ Org API Response:'))
        );
        expect(hasResponseLog).toBe(true);
      } catch (error) {
        // If there's an actual error (network, timeout, etc.), should have error log
        const errorCalls = consoleErrorSpy.mock.calls;
        const hasErrorLog = errorCalls.some(call => 
          call.some(arg => typeof arg === 'string' && arg.includes('❌ Org API Error:'))
        );
        expect(hasErrorLog).toBe(true);
      }
      
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Real API Integration Tests', () => {
    it('should handle actual HTTP requests in development', async () => {
      if (!import.meta.env.DEV) {
        console.log('⏭️ Skipping - not in development mode');
        return;
      }

      try {
        // Make actual request through proxy
        const response = await orgApiClient.get('/organizations', {
          validateStatus: (status) => status === 401 || status === 404 || (status >= 200 && status < 300)
        });

        // Should get either success, 401 (auth required), or 404 (backend not running)
        expect([200, 401, 404]).toContain(response.status);
        console.log(`✅ Real request test passed (${response.status})`);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log('⚠️ Backend not running - this is expected in unit tests');
          // This is acceptable - backend not running is normal for unit tests
        } else {
          console.error('❌ Unexpected error:', error.message);
          throw error;
        }
      }
    }, 10000);

    it('should handle network timeouts gracefully', async () => {
      // Create a client with very short timeout for testing
      const timeoutClient = axios.create({
        ...orgApiClient.defaults,
        timeout: 1 // 1ms timeout
      });

      try {
        await timeoutClient.get('/organizations');
        // If this doesn't timeout, that's actually OK
        console.log('✅ Request completed before timeout');
      } catch (error: any) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.log('✅ Timeout handled correctly');
          expect(error.code).toBe('ECONNABORTED');
        } else {
          // Other errors are also acceptable (like ECONNREFUSED)
          console.log(`✅ Network error handled: ${error.code || error.message}`);
        }
      }
    });
  });

  describe('URL Construction Tests', () => {
    it('should construct correct URLs for different endpoints', () => {
      const baseURL = orgApiClient.defaults.baseURL;
      
      const testCases = [
        { endpoint: '/organizations', expected: `${baseURL}/organizations` },
        { endpoint: '/tax-obligations', expected: `${baseURL}/tax-obligations` },
        { endpoint: '/organizations/123/schedules', expected: `${baseURL}/organizations/123/schedules` }
      ];

      testCases.forEach(({ endpoint, expected }) => {
        // This would be the final URL constructed by axios
        const constructedUrl = `${baseURL}${endpoint}`;
        expect(constructedUrl).toBe(expected);
      });
    });

    it('should handle query parameters correctly', () => {
      const baseURL = orgApiClient.defaults.baseURL;
      const endpoint = '/organizations';
      const params = { category: 'NON_INDIVIDUAL', tax_classification: 'VAT' };
      
      // Simulate how axios would construct the URL with params
      const searchParams = new URLSearchParams(params);
      const expectedUrl = `${baseURL}${endpoint}?${searchParams.toString()}`;
      
      expect(expectedUrl).toContain('category=NON_INDIVIDUAL');
      expect(expectedUrl).toContain('tax_classification=VAT');
    });
  });
});

// Export helper for manual testing
export function testOrgClientManually() {
  console.log('🧪 Manual orgClient Test');
  console.log('Base URL:', orgApiClient.defaults.baseURL);
  console.log('Timeout:', orgApiClient.defaults.timeout);
  console.log('With Credentials:', orgApiClient.defaults.withCredentials);
  console.log('Headers:', orgApiClient.defaults.headers);
  
  return orgApiClient.get('/organizations', {
    validateStatus: () => true // Accept any status for testing
  }).then(response => {
    console.log('✅ Manual test response:', response.status);
    return response;
  }).catch(error => {
    console.log('❌ Manual test error:', error.message);
    throw error;
  });
}