import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/client')

import { OrganizationObligationService } from '../services/organizationObligationService'
import apiClient from '../api/client'

// Mock organization obligation data
const mockOrganizationObligation = {
  id: 'org-obl-123',
  organization_id: 'org-123',
  obligation_id: 'tax-123',
  start_date: '2024-01-01',
  end_date: null,
  status: 'ACTIVE',
  notes: 'Assigned during initial setup',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockAssignObligationData = {
  obligation_id: 'tax-123',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  notes: 'Assigned during initial setup'
}

const mockUpdateStatusData = {
  status: 'ACTIVE' as const
}

describe('OrganizationObligationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrganizationObligations', () => {
    it('should fetch obligations for a specific organization', async () => {
      // Arrange
      const mockResponse = [mockOrganizationObligation]
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })

      // Act
      const result = await OrganizationObligationService.getOrganizationObligations('org-123')

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/obligations')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(apiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationObligationService.getOrganizationObligations('org-123')).rejects.toThrow('Network error')
    })
  })

  describe('assignObligation', () => {
    it('should assign a tax obligation to an organization', async () => {
      // Arrange
      ;(apiClient.post as any).mockResolvedValueOnce({
        data: mockOrganizationObligation
      })

      // Act
      const result = await OrganizationObligationService.assignObligation('org-123', mockAssignObligationData)

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/organizations/org-123/obligations', mockAssignObligationData)
      expect(result).toEqual(mockOrganizationObligation)
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
      await expect(OrganizationObligationService.assignObligation('org-123', mockAssignObligationData)).rejects.toThrow()
    })
  })

  describe('updateObligationStatus', () => {
    it('should update obligation status', async () => {
      // Arrange
      const updatedObligation = { ...mockOrganizationObligation, status: 'ACTIVE' }
      ;(apiClient.put as any).mockResolvedValueOnce({
        data: updatedObligation
      })

      // Act
      const result = await OrganizationObligationService.updateObligationStatus('org-obl-123', mockUpdateStatusData)

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith('/organization-obligations/org-obl-123', mockUpdateStatusData)
      expect(result).toEqual(updatedObligation)
    })

    it('should handle not found errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Obligation not found' }
        }
      }
      ;(apiClient.put as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationObligationService.updateObligationStatus('org-obl-999', mockUpdateStatusData)).rejects.toThrow()
    })
  })
})