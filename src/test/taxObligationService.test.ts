import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/client')

import { TaxObligationService } from '../services/taxObligationService'
import apiClient from '../api/client'

// Mock tax obligation data
const mockTaxObligation = {
  id: 'tax-123',
  code: 'VAT_MONTHLY_001',
  name: 'Monthly VAT Filing',
  frequency: 'MONTHLY',
  due_rule: {
    day: 20
  },
  status: 'ACTIVE',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockCreateTaxObligationData = {
  code: 'INCOME_TAX_001',
  name: 'Annual Income Tax',
  frequency: 'ANNUAL' as const,
  due_rule: {
    month: 4,
    day: 15
  },
  status: 'ACTIVE'
}

describe('TaxObligationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllTaxObligations', () => {
    it('should fetch all tax obligations', async () => {
      // Arrange
      const mockResponse = [mockTaxObligation]
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })

      // Act
      const result = await TaxObligationService.getAllTaxObligations()

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/tax-obligations')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(apiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(TaxObligationService.getAllTaxObligations()).rejects.toThrow('Network error')
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
      await expect(TaxObligationService.getAllTaxObligations()).rejects.toThrow()
    })
  })

  describe('createTaxObligation', () => {
    it('should create a new tax obligation', async () => {
      // Arrange
      ;(apiClient.post as any).mockResolvedValueOnce({
        data: mockTaxObligation
      })

      // Act
      const result = await TaxObligationService.createTaxObligation(mockCreateTaxObligationData)

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/tax-obligations', mockCreateTaxObligationData)
      expect(result).toEqual(mockTaxObligation)
    })

    it('should handle validation errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Validation failed' }
        }
      }
      ;(apiClient.post as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(TaxObligationService.createTaxObligation(mockCreateTaxObligationData)).rejects.toThrow()
    })
  })
})