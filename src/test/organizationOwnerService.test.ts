import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/client')

import { OrganizationOwnerService } from '../services/organizationOwnerService'
import apiClient from '../api/client'

// Mock organization owner data
const mockOrganizationOwner = {
  id: 'owner-123',
  org_id: 'org-123',
  user_id: 'user-456',
  assigned_date: '2024-01-01T00:00:00.000Z',
  last_update: '2024-01-01T00:00:00.000Z'
}

const mockOwnershipCheck = {
  is_owner: true,
  org_id: 'org-123',
  user_id: 'user-456'
}

const mockAssignOwnerData = {
  org_id: 'org-123',
  user_id: 'user-456'
}

describe('OrganizationOwnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('assignOwner', () => {
    it('should assign a user as an owner of an organization', async () => {
      // Arrange
      ;(apiClient.post as any).mockResolvedValueOnce({
        data: mockOrganizationOwner
      })

      // Act
      const result = await OrganizationOwnerService.assignOwner('org-123', 'user-456')

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/organizations/org-123/owners', mockAssignOwnerData)
      expect(result).toEqual(mockOrganizationOwner)
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
      await expect(OrganizationOwnerService.assignOwner('org-123', 'user-456')).rejects.toThrow()
    })
  })

  describe('getOrganizationOwners', () => {
    it('should fetch all owners of an organization', async () => {
      // Arrange
      const mockResponse = [mockOrganizationOwner]
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: { owners: mockResponse }
      })

      // Act
      const result = await OrganizationOwnerService.getOrganizationOwners('org-123')

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/owners')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(apiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationOwnerService.getOrganizationOwners('org-123')).rejects.toThrow('Network error')
    })
  })

  describe('checkOwnership', () => {
    it('should check if user is an owner of an organization', async () => {
      // Arrange
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: mockOwnershipCheck
      })

      // Act
      const result = await OrganizationOwnerService.checkOwnership('org-123')

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/ownership')
      expect(result).toEqual(true)
    })

    it('should return false when user is not an owner', async () => {
      // Arrange
      const notOwnerResponse = {
        is_owner: false,
        org_id: 'org-123',
        user_id: 'user-456'
      }
      ;(apiClient.get as any).mockResolvedValueOnce({
        data: notOwnerResponse
      })

      // Act
      const result = await OrganizationOwnerService.checkOwnership('org-123')

      // Assert
      expect(result).toEqual(false)
    })
  })

  describe('removeOwner', () => {
    it('should remove a user as an owner by org and user ID', async () => {
      // Arrange
      ;(apiClient.delete as any).mockResolvedValueOnce({
        data: { message: 'Owner removed successfully' }
      })

      // Act
      const result = await OrganizationOwnerService.removeOwner('org-123', 'user-456')

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith('/organizations/org-123/owners/user-456')
      expect(result).toEqual({ message: 'Owner removed successfully' })
    })

    it('should handle not found errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Owner not found' }
        }
      }
      ;(apiClient.delete as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationOwnerService.removeOwner('org-123', 'user-999')).rejects.toThrow()
    })
  })

  describe('removeOwnerById', () => {
    it('should remove an owner assignment by assignment ID', async () => {
      // Arrange
      ;(apiClient.delete as any).mockResolvedValueOnce({
        data: { message: 'Owner removed successfully' }
      })

      // Act
      const result = await OrganizationOwnerService.removeOwnerById('owner-123')

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith('/organization-owners/owner-123')
      expect(result).toEqual({ message: 'Owner removed successfully' })
    })
  })
})