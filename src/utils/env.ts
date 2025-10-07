/**
 * Environment utility functions for extracting base URLs from environment variables
 */

/**
 * Extracts the base URL from VITE_API_BASE_URL
 * Example: http://localhost:3000/api -> http://localhost:3000
 */
export function getApiBaseUrl(): string {
  const baseUrl = (import.meta.env as any).VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL environment variable is not set');
  }

  // Remove trailing path segments to get base URL
  const url = new URL(baseUrl);
  return `${url.protocol}//${url.host}`;
}

/**
 * Extracts the base URL from VITE_ORG_API_BASE_URL
 * Example: http://localhost:3001/api/org -> http://localhost:3001
 */
export function getOrgApiBaseUrl(): string {
  const baseUrl = (import.meta.env as any).VITE_ORG_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_ORG_API_BASE_URL environment variable is not set');
  }

  // Remove trailing path segments to get base URL
  const url = new URL(baseUrl);
  return `${url.protocol}//${url.host}`;
}

/**
 * Returns the health endpoint URL for AUTH API
 * Example: http://localhost:3000/health
 */
export function getApiHealthUrl(): string {
  return `${getApiBaseUrl()}/health`;
}

/**
 * Returns the health endpoint URL for ORG API
 * Example: http://localhost:3001/health
 */
export function getOrgApiHealthUrl(): string {
  return `${getOrgApiBaseUrl()}/health`;
}