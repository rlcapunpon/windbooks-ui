import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client
vi.mock('../api/orgClient')

import { OrganizationService } from '../services/organizationService'
import orgApiClient from '../api/orgClient'

// Mock organization data
const mockOrganization = {
  id: 'org-123',
  name: 'ABC Corporation',
  tin: '001234567890',
  category: 'NON_INDIVIDUAL',
  subcategory: 'CORPORATION',
  tax_classification: 'VAT',
  registration_date: '2024-01-01T00:00:00.000Z',
  address: 'Makati City, Philippines',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  deleted_at: null,
  status: {
    id: 'status-123',
    organization_id: 'org-123',
    status: 'PENDING',
    last_update: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
}

const mockCreateOrganizationData = {
  category: 'NON_INDIVIDUAL' as const,
  tax_classification: 'VAT' as const,
  registration_date: '2024-01-01',
  first_name: 'John',
  last_name: 'Doe',
  line_of_business: '6201',
  address_line: '123 Main Street',
  region: 'NCR',
  city: 'Makati',
  zip_code: '1223',
  tin: '001234567890',
  rdo_code: '001',
  contact_number: '+639123456789',
  email_address: 'john.doe@example.com',
  start_date: '2024-01-01',
  registered_name: 'XYZ Corporation Ltd',
  trade_name: 'XYZ Trading',
  subcategory: 'CORPORATION' as const,
  middle_name: 'Michael',
  fy_start: '2025-01-01',
  fy_end: '2025-12-31',
  accounting_method: 'ACCRUAL' as const
}

describe('OrganizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllOrganizations', () => {
    it('should fetch all organizations without filters', async () => {
      // Arrange
      const mockResponse = [mockOrganization]
      ;(orgApiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })

      // Act
      const result = await OrganizationService.getAllOrganizations()

      // Assert
      expect(orgApiClient.get).toHaveBeenCalledWith('/organizations', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch organizations with category filter', async () => {
      // Arrange
      const mockResponse = [mockOrganization]
      ;(orgApiClient.get as any).mockResolvedValueOnce({
        data: mockResponse
      })

      // Act
      const result = await OrganizationService.getAllOrganizations({ category: 'NON_INDIVIDUAL' })

      // Assert
      expect(orgApiClient.get).toHaveBeenCalledWith('/organizations', {
        params: { category: 'NON_INDIVIDUAL' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('Network error')
      ;(orgApiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationService.getAllOrganizations()).rejects.toThrow('Network error')
    })
  })

  describe('createOrganization', () => {
    it('should create a new organization', async () => {
      // Arrange
      ;(orgApiClient.post as any).mockResolvedValueOnce({
        data: mockOrganization
      })

      // Act
      const result = await OrganizationService.createOrganization(mockCreateOrganizationData)

      // Assert
      expect(orgApiClient.post).toHaveBeenCalledWith('/organizations', mockCreateOrganizationData)
      expect(result).toEqual(mockOrganization)
    })

    it('should send correct request structure for INDIVIDUAL organization', async () => {
      // Arrange
      const individualData = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        registration_date: '2024-01-01',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'Michael',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: '2024-01-01',
        subcategory: 'SELF_EMPLOYED' as const
      }
      ;(orgApiClient.post as any).mockResolvedValueOnce({
        data: mockOrganization
      })

      // Act
      await OrganizationService.createOrganization(individualData)

      // Assert
      expect(orgApiClient.post).toHaveBeenCalledWith('/organizations', expect.objectContaining({
        category: 'INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        registration_date: '2024-01-01',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'Michael',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: '2024-01-01',
        subcategory: 'SELF_EMPLOYED'
      }))
      expect(orgApiClient.post).toHaveBeenCalledWith('/organizations', expect.not.objectContaining({
        registered_name: expect.any(String),
        trade_name: expect.any(String)
      }))
    })

    it('should send correct request structure for NON_INDIVIDUAL organization', async () => {
      // Arrange
      const nonIndividualData = {
        category: 'NON_INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        registration_date: '2024-01-01',
        registered_name: 'ABC Corporation',
        trade_name: 'ABC Trading',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: '2024-01-01',
        subcategory: 'CORPORATION' as const
      }
      ;(orgApiClient.post as any).mockResolvedValueOnce({
        data: mockOrganization
      })

      // Act
      await OrganizationService.createOrganization(nonIndividualData)

      // Assert
      expect(orgApiClient.post).toHaveBeenCalledWith('/organizations', expect.objectContaining({
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        registration_date: '2024-01-01',
        registered_name: 'ABC Corporation',
        trade_name: 'ABC Trading',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: '2024-01-01',
        subcategory: 'CORPORATION'
      }))
      expect(orgApiClient.post).toHaveBeenCalledWith('/organizations', expect.not.objectContaining({
        first_name: expect.any(String),
        last_name: expect.any(String),
        middle_name: expect.any(String)
      }))
    })

    it('should handle validation errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Validation failed' }
        }
      }
      ;(orgApiClient.post as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationService.createOrganization(mockCreateOrganizationData)).rejects.toThrow()
    })
  })

  describe('getOrganizationById', () => {
    it('should fetch organization by ID', async () => {
      // Arrange
      ;(orgApiClient.get as any).mockResolvedValueOnce({
        data: mockOrganization
      })

      // Act
      const result = await OrganizationService.getOrganizationById('org-123')

      // Assert
      expect(orgApiClient.get).toHaveBeenCalledWith('/organizations/org-123')
      expect(result).toEqual(mockOrganization)
    })

    it('should handle not found errors', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Organization not found' }
        }
      }
      ;(orgApiClient.get as any).mockRejectedValueOnce(mockError)

      // Act & Assert
      await expect(OrganizationService.getOrganizationById('org-999')).rejects.toThrow()
    })
  })

  describe('updateOrganization', () => {
    it('should update organization details', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', address: 'New Address' }
      const updatedOrganization = { ...mockOrganization, ...updateData }
      ;(orgApiClient.put as any).mockResolvedValueOnce({
        data: updatedOrganization
      })

      // Act
      const result = await OrganizationService.updateOrganization('org-123', updateData)

      // Assert
      expect(orgApiClient.put).toHaveBeenCalledWith('/organizations/org-123', updateData)
      expect(result).toEqual(updatedOrganization)
    })
  })

  describe('updateOrganizationStatus', () => {
    it('should update organization status', async () => {
      // Arrange
      const statusData = {
        status: 'ACTIVE' as const,
        reason: 'EXPIRED' as const,
        description: 'Organization license has expired'
      }
      const updatedStatus = {
        id: 'status-123',
        organization_id: 'org-123',
        ...statusData,
        last_update: '2024-01-01T00:00:00.000Z'
      }
      ;(orgApiClient.put as any).mockResolvedValueOnce({
        data: updatedStatus
      })

      // Act
      const result = await OrganizationService.updateOrganizationStatus('org-123', statusData)

      // Assert
      expect(orgApiClient.put).toHaveBeenCalledWith('/organizations/org-123/status', statusData)
      expect(result).toEqual(updatedStatus)
    })
  })

  describe('getOrganizationStatus', () => {
    it('should fetch organization status', async () => {
      // Arrange
      const mockStatus = mockOrganization.status
      ;(orgApiClient.get as any).mockResolvedValueOnce({
        data: mockStatus
      })

      // Act
      const result = await OrganizationService.getOrganizationStatus('org-123')

      // Assert
      expect(orgApiClient.get).toHaveBeenCalledWith('/organizations/org-123/status')
      expect(result).toEqual(mockStatus)
    })
  })

  describe('updateOrganizationOperation', () => {
    it('should update organization operation details', async () => {
      // Arrange
      const operationData = {
        fy_start: '2025-01-01',
        fy_end: '2025-12-31',
        vat_reg_effectivity: '2025-01-01',
        registration_effectivity: '2025-01-01',
        payroll_cut_off: ['15', '30'],
        payment_cut_off: ['10', '25'],
        quarter_closing: ['03-31', '06-30', '09-30', '12-31'],
        has_foreign: false,
        has_employees: true,
        is_ewt: false,
        is_fwt: false,
        is_bir_withholding_agent: false,
        accounting_method: 'ACCRUAL' as const
      }
      ;(orgApiClient.put as any).mockResolvedValueOnce({
        data: operationData
      })

      // Act
      const result = await OrganizationService.updateOrganizationOperation('org-123', operationData)

      // Assert
      expect(orgApiClient.put).toHaveBeenCalledWith('/organizations/org-123/operation', operationData)
      expect(result).toEqual(operationData)
    })
  })

  describe('getOrganizationOperation', () => {
    it('should fetch organization operation details', async () => {
      // Arrange
      const mockOperation = {
        fy_start: '2025-01-01',
        fy_end: '2025-12-31',
        accounting_method: 'ACCRUAL'
      }
      ;(orgApiClient.get as any).mockResolvedValueOnce({
        data: mockOperation
      })

      // Act
      const result = await OrganizationService.getOrganizationOperation('org-123')

      // Assert
      expect(orgApiClient.get).toHaveBeenCalledWith('/organizations/org-123/operation')
      expect(result).toEqual(mockOperation)
    })
  })

  describe('updateOrganizationRegistration', () => {
    it('should update organization registration details', async () => {
      // Arrange
      const registrationData = {
        first_name: 'John',
        middle_name: 'Michael',
        last_name: 'Doe',
        trade_name: 'ABC Trading',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin: '001234567890',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        tax_type: 'VAT',
        start_date: '2024-01-01',
        reg_date: '2024-01-01'
      }
      ;(orgApiClient.put as any).mockResolvedValueOnce({
        data: registrationData
      })

      // Act
      const result = await OrganizationService.updateOrganizationRegistration('org-123', registrationData)

      // Assert
      expect(orgApiClient.put).toHaveBeenCalledWith('/organizations/org-123/registration', registrationData)
      expect(result).toEqual(registrationData)
    })
  })
})