import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canEditOrganizationStatus, canEditOrganizationRegistration } from './organizationPermissions'
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