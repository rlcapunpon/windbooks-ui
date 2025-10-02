import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canEditOrganizationStatus, canEditOrganizationRegistration, clearOwnershipCache } from './organizationPermissions'
import { OrganizationOwnerService } from '../services/organizationOwnerService'
import { UserService } from '../services/userService'

// Mock the services
vi.mock('../services/organizationOwnerService', () => ({
  OrganizationOwnerService: {
    checkOwnership: vi.fn()
  }
}))

vi.mock('../services/userService', () => ({
  UserService: {
    isSuperAdmin: vi.fn()
  }
}))

describe('organizationPermissions', () => {
  const mockCheckOwnership = vi.mocked(OrganizationOwnerService.checkOwnership)
  const mockIsSuperAdmin = vi.mocked(UserService.isSuperAdmin)

  beforeEach(() => {
    vi.clearAllMocks()
    clearOwnershipCache()
  })

  describe('canEditOrganizationStatus', () => {
    const organizationId = 'test-org-123'

    it('should return true when user is SUPERADMIN', async () => {
      mockIsSuperAdmin.mockReturnValue(true)
      mockCheckOwnership.mockResolvedValue(false)

      const result = await canEditOrganizationStatus(organizationId)

      expect(result).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      // Should not need to check ownership if user is SUPERADMIN
    })

    it('should return true when user is organization owner', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      const result = await canEditOrganizationStatus(organizationId)

      expect(result).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should return false when user is neither SUPERADMIN nor organization owner', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(false)

      const result = await canEditOrganizationStatus(organizationId)

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should return true for SUPERADMIN without checking ownership', async () => {
      mockIsSuperAdmin.mockReturnValue(true)

      const result = await canEditOrganizationStatus(organizationId)

      expect(result).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully and return false', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockRejectedValue(new Error('API Error'))

      const result = await canEditOrganizationStatus(organizationId)

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should handle empty organization ID', async () => {
      mockIsSuperAdmin.mockReturnValue(false)

      const result = await canEditOrganizationStatus('')

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).not.toHaveBeenCalled()
    })

    it('should handle null organization ID', async () => {
      mockIsSuperAdmin.mockReturnValue(false)

      const result = await canEditOrganizationStatus(null as any)

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).not.toHaveBeenCalled()
    })
  })

  describe('ownership caching', () => {
    const organizationId = 'test-org-123'

    beforeEach(() => {
      // Clear cache before each test
      clearOwnershipCache()
    })

    it('should cache ownership check results to prevent redundant API calls', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      // First call
      const result1 = await canEditOrganizationStatus(organizationId)
      // Second call to same organization
      const result2 = await canEditOrganizationRegistration(organizationId)

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      // checkOwnership should only be called once due to caching
      expect(mockCheckOwnership).toHaveBeenCalledTimes(1)
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should handle concurrent calls to the same organization', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      // Make concurrent calls
      const [result1, result2] = await Promise.all([
        canEditOrganizationStatus(organizationId),
        canEditOrganizationRegistration(organizationId)
      ])

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      // checkOwnership should only be called once due to caching
      expect(mockCheckOwnership).toHaveBeenCalledTimes(1)
    })

    it('should clear cache when clearOwnershipCache is called', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      // First call
      await canEditOrganizationStatus(organizationId)
      expect(mockCheckOwnership).toHaveBeenCalledTimes(1)

      // Clear cache
      clearOwnershipCache()

      // Second call should make another API call
      await canEditOrganizationRegistration(organizationId)
      expect(mockCheckOwnership).toHaveBeenCalledTimes(2)
    })

    it('should handle different organizations separately', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      const orgId1 = 'org-1'
      const orgId2 = 'org-2'

      await canEditOrganizationStatus(orgId1)
      await canEditOrganizationStatus(orgId2)

      // Should be called twice for different organizations
      expect(mockCheckOwnership).toHaveBeenCalledTimes(2)
      expect(mockCheckOwnership).toHaveBeenCalledWith(orgId1)
      expect(mockCheckOwnership).toHaveBeenCalledWith(orgId2)
    })
  })

  describe('canEditOrganizationRegistration', () => {
    const organizationId = 'test-org-123'

    it('should return true when user is SUPERADMIN', async () => {
      mockIsSuperAdmin.mockReturnValue(true)
      mockCheckOwnership.mockResolvedValue(false)

      const result = await canEditOrganizationRegistration(organizationId)

      expect(result).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      // Should not need to check ownership if user is SUPERADMIN
    })

    it('should return true when user is organization owner', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(true)

      const result = await canEditOrganizationRegistration(organizationId)

      expect(result).toBe(true)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should return false when user is neither SUPERADMIN nor organization owner', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockResolvedValue(false)

      const result = await canEditOrganizationRegistration(organizationId)

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should handle API errors gracefully and return false', async () => {
      mockIsSuperAdmin.mockReturnValue(false)
      mockCheckOwnership.mockRejectedValue(new Error('API Error'))

      const result = await canEditOrganizationRegistration(organizationId)

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).toHaveBeenCalledWith(organizationId)
    })

    it('should handle empty organization ID', async () => {
      mockIsSuperAdmin.mockReturnValue(false)

      const result = await canEditOrganizationRegistration('')

      expect(result).toBe(false)
      expect(mockIsSuperAdmin).toHaveBeenCalled()
      expect(mockCheckOwnership).not.toHaveBeenCalled()
    })
  })
})