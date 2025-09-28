import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Organization from './Organization'
import { OrganizationService } from '../../services/organizationService'
import type { Organization as OrganizationType, OrganizationStatus, OrganizationRegistration } from '../../services/organizationService'

// Mock the organization service
vi.mock('../../services/organizationService', () => ({
  OrganizationService: {
    getOrganizationById: vi.fn(),
    getOrganizationStatus: vi.fn(),
    getOrganizationOperation: vi.fn(),
    getOrganizationRegistration: vi.fn()
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'org-1' })
  }
})

const mockOrganization: OrganizationType = {
  id: 'org-1',
  name: 'Test Organization',
  tin: '001234567890',
  category: 'NON_INDIVIDUAL' as const,
  tax_classification: 'VAT' as const,
  registration_date: '2024-01-01T00:00:00.000Z',
  address: 'Test Address',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  deleted_at: null,
  status: {
    id: 'status-1',
    organization_id: 'org-1',
    status: 'ACTIVE',
    last_update: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
}

const mockOrganizationStatus: OrganizationStatus = {
  id: 'status-1',
  organization_id: 'org-1',
  status: 'ACTIVE',
  reason: 'EXPIRED',
  description: 'Organization is active and compliant',
  last_update: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockOrganizationOperation = {
  id: 'operation-1',
  organization_id: 'org-1',
  fy_start: '2024-01-01T00:00:00.000Z',
  fy_end: '2024-12-31T00:00:00.000Z',
  vat_reg_effectivity: '2024-01-01T00:00:00.000Z',
  registration_effectivity: '2024-01-01T00:00:00.000Z',
  payroll_cut_off: ['15', '30'],
  payment_cut_off: ['10', '25'],
  quarter_closing: ['03-31', '06-30', '09-30', '12-31'],
  has_foreign: false,
  has_employees: true,
  is_ewt: false,
  is_fwt: false,
  is_bir_withholding_agent: false,
  accounting_method: 'ACCRUAL',
  last_update: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockOrganizationRegistration: OrganizationRegistration = {
  organization_id: 'org-1',
  first_name: 'John',
  middle_name: 'Michael',
  last_name: 'Doe',
  trade_name: 'Test Trading Corp',
  line_of_business: '6201',
  address_line: '123 Main Street',
  region: 'NCR',
  city: 'Makati',
  zip_code: '1223',
  tin: '001234567890',
  rdo_code: '001',
  contact_number: '+639123456789',
  email_address: 'john.doe@test.com',
  tax_type: 'VAT',
  start_date: '2024-01-01T00:00:00.000Z',
  reg_date: '2024-01-01T00:00:00.000Z',
  update_date: '2024-01-01T00:00:00.000Z',
  update_by: 'user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('Organization Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      ;(OrganizationService.getOrganizationById as any).mockImplementation(() => new Promise(() => {}))

      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      expect(screen.getByText('Loading organization...')).toBeInTheDocument()
    })
  })

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      ;(OrganizationService.getOrganizationById as any).mockResolvedValue(mockOrganization)
    })

    it('should load and display organization details', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Test Organization' })).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { level: 2, name: 'Organization Details' })).toBeInTheDocument()
      expect(screen.getByText('001234567890')).toBeInTheDocument()
      expect(screen.getByText('NON_INDIVIDUAL')).toBeInTheDocument()
      expect(screen.getByText('VAT')).toBeInTheDocument()
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Business Status')).toBeInTheDocument()
      expect(screen.getByText('Operation Details')).toBeInTheDocument()
      expect(screen.getByText('Registration Information')).toBeInTheDocument()
    })

    it('should display menu items', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Test Organization' })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /organization details/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /contacts/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tax obligations/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    })

    it('should switch between menu sections', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Contacts menu
      await userEvent.click(screen.getByText('Contacts'))
      expect(screen.getByText('Contact management functionality coming soon.')).toBeInTheDocument()

      // Click on Tax Obligations menu
      await userEvent.click(screen.getByText('Tax Obligations'))
      expect(screen.getByText('Tax obligations functionality coming soon.')).toBeInTheDocument()

      // Click on History menu
      await userEvent.click(screen.getByText('History'))
      expect(screen.getByText('Organization history functionality coming soon.')).toBeInTheDocument()

      // Click on Settings menu
      await userEvent.click(screen.getByText('Settings'))
      expect(screen.getByText('Organization settings functionality coming soon.')).toBeInTheDocument()

      // Go back to Organization Details
      await userEvent.click(screen.getByText('Organization Details'))
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    it('should navigate back to organizations dashboard', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Test Organization' })).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: /back to organizations/i })
      await userEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/organizations/dashboard')
    })
  })

  describe('Error Handling', () => {
    it('should display error message when organization loading fails', async () => {
      ;(OrganizationService.getOrganizationById as any).mockRejectedValue(new Error('API Error'))

      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Error Loading Organization')).toBeInTheDocument()
      })

      expect(screen.getByText('Failed to load organization details')).toBeInTheDocument()
    })

    it('should navigate back when error back button is clicked', async () => {
      ;(OrganizationService.getOrganizationById as any).mockRejectedValue(new Error('API Error'))

      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Error Loading Organization')).toBeInTheDocument()
      })

      const backButtons = screen.getAllByText('Back to Organizations')
      const errorBackButton = backButtons[1] // The error page back button
      await userEvent.click(errorBackButton)

      expect(mockNavigate).toHaveBeenCalledWith('/organizations/dashboard')
    })
  })

  describe('Organization Not Found', () => {
    it('should display not found message when organization is null', async () => {
      ;(OrganizationService.getOrganizationById as any).mockResolvedValue(null)

      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization not found')).toBeInTheDocument()
      })
    })
  })

  describe('Comprehensive Data Loading', () => {
    beforeEach(() => {
      ;(OrganizationService.getOrganizationById as any).mockResolvedValue(mockOrganization)
      ;(OrganizationService.getOrganizationStatus as any).mockResolvedValue(mockOrganizationStatus)
      ;(OrganizationService.getOrganizationOperation as any).mockResolvedValue(mockOrganizationOperation)
      ;(OrganizationService.getOrganizationRegistration as any).mockResolvedValue(mockOrganizationRegistration)
    })

    it('should call all 4 endpoints to load comprehensive organization data', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(OrganizationService.getOrganizationById).toHaveBeenCalledWith('org-1')
        expect(OrganizationService.getOrganizationStatus).toHaveBeenCalledWith('org-1')
        expect(OrganizationService.getOrganizationOperation).toHaveBeenCalledWith('org-1')
        expect(OrganizationService.getOrganizationRegistration).toHaveBeenCalledWith('org-1')
      })
    })

    it('should display comprehensive organization details including operation and registration info', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Test Organization' })).toBeInTheDocument()
      })

      // Basic organization info
      expect(screen.getByText('001234567890')).toBeInTheDocument()
      expect(screen.getByText('NON_INDIVIDUAL')).toBeInTheDocument()
      expect(screen.getByText('VAT')).toBeInTheDocument()

      // Status information
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
      expect(screen.getByText('Organization is active and compliant')).toBeInTheDocument()

      // Operation details
      expect(screen.getByText('ACCRUAL')).toBeInTheDocument()
      expect(screen.getByText('15, 30')).toBeInTheDocument() // payroll cut-off
      expect(screen.getByText('10, 25')).toBeInTheDocument() // payment cut-off

      // Registration details
      expect(screen.getByText('John Michael Doe')).toBeInTheDocument()
      expect(screen.getByText('Test Trading Corp')).toBeInTheDocument()
      expect(screen.getByText('6201')).toBeInTheDocument() // line of business
      expect(screen.getByText('123 Main Street, Makati, NCR 1223')).toBeInTheDocument()
      expect(screen.getByText('+639123456789')).toBeInTheDocument()
      expect(screen.getByText('john.doe@test.com')).toBeInTheDocument()
    })

    it('should display data in categorized sections', async () => {
      render(
        <BrowserRouter>
          <Organization />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Test Organization' })).toBeInTheDocument()
      })

      // Check for section headers
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Business Status')).toBeInTheDocument()
      expect(screen.getByText('Operation Details')).toBeInTheDocument()
      expect(screen.getByText('Registration Information')).toBeInTheDocument()
    })
  })
})