import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/client')

import { ScheduleService } from '../services/scheduleService'
import apiClient from '../api/client'

// Mock schedule data
const mockSchedule = {
  org_obligation_id: 'org-obl-123',
  period: '2024-01',
  due_date: '2024-01-20T00:00:00.000Z',
  status: 'DUE',
  filed_at: null
}

const mockScheduleWithObligation = {
  ...mockSchedule,
  obligation: {
    id: 'tax-123',
    code: 'VAT_MONTHLY_001',
    name: 'Monthly VAT Filing',
    frequency: 'MONTHLY'
  }
}

describe('ScheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrganizationSchedules', () => {
    it('should fetch compliance schedules for an organization', async () => {
      // Arrange
      const mockResponse = [mockScheduleWithObligation]
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })

      // Act
      const result = await ScheduleService.getOrganizationSchedules('org-123')

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/schedules', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch schedules with date range filters', async () => {
      // Arrange
      const mockResponse = [mockScheduleWithObligation]
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })
      const filters = {
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      }

      // Act
      const result = await ScheduleService.getOrganizationSchedules('org-123', filters)

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/schedules', {
        params: filters
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(apiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(ScheduleService.getOrganizationSchedules('org-123')).rejects.toThrow('Network error')
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
      await expect(ScheduleService.getOrganizationSchedules('org-123')).rejects.toThrow()
    })
  })
})