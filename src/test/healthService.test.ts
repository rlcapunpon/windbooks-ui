import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/client')

import { HealthService } from '../services/healthService'
import apiClient from '../api/client'

describe('HealthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkHealth', () => {
    it('should call the health endpoint and return health status', async () => {
      // Arrange
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        version: '1.0.0'
      }
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockHealthResponse
      })

      // Act
      const result = await HealthService.checkHealth()

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/health')
      expect(result).toEqual(mockHealthResponse)
    })

    it('should handle API errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(apiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(HealthService.checkHealth()).rejects.toThrow('Network error')
      expect(apiClient.get).toHaveBeenCalledWith('/health')
    })

    it('should handle server errors with proper error messages', async () => {
      // Arrange
      const mockErrorResponse = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      }
      ;(apiClient.get as any).mockRejectedValueOnce(mockErrorResponse)

      // Act & Assert
      await expect(HealthService.checkHealth()).rejects.toThrow()
      expect(apiClient.get).toHaveBeenCalledWith('/health')
    })
  })
})