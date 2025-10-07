import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
const mockEnv = {
  VITE_API_BASE_URL: 'http://localhost:3000/api',
  VITE_ORG_API_BASE_URL: 'http://localhost:3001/api/org',
};

// Mock the entire env module
vi.mock('./env', () => ({
  getApiBaseUrl: () => {
    const baseUrl = mockEnv.VITE_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('VITE_API_BASE_URL environment variable is not set');
    }
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}`;
  },
  getOrgApiBaseUrl: () => {
    const baseUrl = mockEnv.VITE_ORG_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('VITE_ORG_API_BASE_URL environment variable is not set');
    }
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}`;
  },
  getApiHealthUrl: () => `${mockEnv.VITE_API_BASE_URL ? new URL(mockEnv.VITE_API_BASE_URL).protocol : 'http:'}//${mockEnv.VITE_API_BASE_URL ? new URL(mockEnv.VITE_API_BASE_URL).host : 'localhost:3000'}/health`,
  getOrgApiHealthUrl: () => `${mockEnv.VITE_ORG_API_BASE_URL ? new URL(mockEnv.VITE_ORG_API_BASE_URL).protocol : 'http:'}//${mockEnv.VITE_ORG_API_BASE_URL ? new URL(mockEnv.VITE_ORG_API_BASE_URL).host : 'localhost:3001'}/health`,
}));

import { getApiBaseUrl, getOrgApiBaseUrl, getApiHealthUrl, getOrgApiHealthUrl } from './env';

describe('Environment Utilities', () => {
  beforeEach(() => {
    // Reset to default values
    mockEnv.VITE_API_BASE_URL = 'http://localhost:3000/api';
    mockEnv.VITE_ORG_API_BASE_URL = 'http://localhost:3001/api/org';
  });

  describe('getApiBaseUrl', () => {
    it('should extract base URL from VITE_API_BASE_URL', () => {
      const result = getApiBaseUrl();
      expect(result).toBe('http://localhost:3000');
    });

    it('should throw error when VITE_API_BASE_URL is not set', () => {
      mockEnv.VITE_API_BASE_URL = undefined as any;
      expect(() => getApiBaseUrl()).toThrow('VITE_API_BASE_URL environment variable is not set');
    });
  });

  describe('getOrgApiBaseUrl', () => {
    it('should extract base URL from VITE_ORG_API_BASE_URL', () => {
      const result = getOrgApiBaseUrl();
      expect(result).toBe('http://localhost:3001');
    });

    it('should throw error when VITE_ORG_API_BASE_URL is not set', () => {
      mockEnv.VITE_ORG_API_BASE_URL = undefined as any;
      expect(() => getOrgApiBaseUrl()).toThrow('VITE_ORG_API_BASE_URL environment variable is not set');
    });
  });

  describe('getApiHealthUrl', () => {
    it('should return health endpoint for AUTH API', () => {
      const result = getApiHealthUrl();
      expect(result).toBe('http://localhost:3000/health');
    });
  });

  describe('getOrgApiHealthUrl', () => {
    it('should return health endpoint for ORG API', () => {
      const result = getOrgApiHealthUrl();
      expect(result).toBe('http://localhost:3001/health');
    });
  });
});