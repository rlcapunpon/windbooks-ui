import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import OrganizationPage from './Organization'
import { OrganizationService } from '../../services/organizationService'
import { canEditOrganizationStatus } from '../../utils/organizationPermissions'

// Mock the services
vi.mock('../../services/organizationService', () => ({
  OrganizationService: {
    getOrganizationById: vi.fn(),
    getOrganizationStatus: vi.fn(),
    getOrganizationOperation: vi.fn(),
    getOrganizationRegistration: vi.fn(),
    updateOrganizationOperation: vi.fn()
  }
}))

vi.mock('../../services/userService', () => ({
  UserService: {
    isSuperAdmin: vi.fn(),
    hasUserData: vi.fn(),
    fetchAndStoreUserData: vi.fn()
  }
}))

vi.mock('../../utils/organizationPermissions', () => ({
  canEditOrganizationStatus: vi.fn()
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'test-org-123' }),
    useNavigate: () => vi.fn()
  }
})

describe('Organization Details Operations Integration', () => {
  const mockOrganization = {
    id: 'test-org-123',
    name: 'Test Organization',
    category: 'INDIVIDUAL' as const,
    subcategory: 'SOLE_PROPRIETOR' as const,
    tax_classification: 'VAT' as const,
    registration_date: '2024-01-01T00:00:00.000Z',
    address: '123 Test St, Test City',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null
  }

  const mockOrganizationStatus = {
    id: 'status-123',
    organization_id: 'test-org-123',
    status: 'ACTIVE' as const,
    reason: 'APPROVED' as const,
    description: 'Organization is active',
    last_update: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  const mockOrganizationOperation = {
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
    accounting_method: 'ACCRUAL'
  }

  const mockOrganizationRegistration = {
    organization_id: 'test-org-123',
    first_name: 'John',
    middle_name: undefined,
    last_name: 'Doe',
    trade_name: undefined,
    line_of_business: '6201',
    address_line: '123 Test St',
    region: 'NCR',
    city: 'Test City',
    zip_code: '1234',
    tin: '123456789012',
    rdo_code: '001',
    contact_number: '+639123456789',
    email_address: 'john.doe@example.com',
    tax_type: 'VAT' as const,
    start_date: '2024-01-01',
    reg_date: '2024-01-01',
    update_date: '2024-01-01T00:00:00.000Z',
    update_by: 'user-123',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  const mockCanEditOrganizationStatus = vi.mocked(canEditOrganizationStatus)

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(OrganizationService.getOrganizationById).mockResolvedValue(mockOrganization)
    vi.mocked(OrganizationService.getOrganizationStatus).mockResolvedValue(mockOrganizationStatus)
    vi.mocked(OrganizationService.getOrganizationOperation).mockResolvedValue(mockOrganizationOperation)
    vi.mocked(OrganizationService.getOrganizationRegistration).mockResolvedValue(mockOrganizationRegistration)
    vi.mocked(OrganizationService.updateOrganizationOperation).mockResolvedValue({})
    
    // Mock UserService methods
    const { UserService } = await import('../../services/userService')
    vi.mocked(UserService.hasUserData).mockReturnValue(true)
    vi.mocked(UserService.fetchAndStoreUserData).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      isActive: true,
      isSuperAdmin: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      details: {
        firstName: 'Test',
        lastName: 'User',
        nickName: 'testuser',
        contactNumber: '+1234567890',
        reportTo: {
          id: 'manager-123',
          email: 'manager@example.com',
          firstName: 'Manager',
          lastName: 'User',
          nickName: 'manager'
        }
      },
      resources: []
    })
    vi.mocked(UserService.isSuperAdmin).mockReturnValue(true)
    
    mockCanEditOrganizationStatus.mockResolvedValue(true)
  })

  describe('Operations Tab Display', () => {
    it('should display Operations tab with proper title', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      expect(screen.getByText('Operation Details')).toBeInTheDocument()
    })

    it('should display all operation details correctly', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Check that all operation details are displayed
      expect(screen.getByText('Dec 2025')).toBeInTheDocument() // fy_end formatted
      expect(screen.getByText('ACCRUAL')).toBeInTheDocument() // accounting_method
      expect(screen.getByText('15th and 30th')).toBeInTheDocument() // payroll_cut_off
      expect(screen.getByText('10th and 25th')).toBeInTheDocument() // payment_cut_off
      expect(screen.getByText('03-31, 06-30, 09-30, 12-31')).toBeInTheDocument() // quarter_closing
      expect(screen.getByText('Yes')).toBeInTheDocument() // has_employees
      
      // Check for specific "No" values by looking at table structure
      const table = screen.getByRole('table')
      const rows = table.querySelectorAll('tr')
      const ewtRow = Array.from(rows).find(row => row.textContent?.includes('Expanded Withholding Tax (EWT)'))
      expect(ewtRow?.textContent).toContain('No')
      
      const fwtRow = Array.from(rows).find(row => row.textContent?.includes('Final Withholding Tax (FWT)'))
      expect(fwtRow?.textContent).toContain('No')
      
      const withholdingRow = Array.from(rows).find(row => row.textContent?.includes('Withholding Agent'))
      expect(withholdingRow?.textContent).toContain('No')
    })

    it('should show edit button for operations when user has permission', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear (permission check is async)
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit Operation Details')
        expect(editButton).toBeInTheDocument()
      })
    })

    it('should hide edit button for operations when user lacks permission', async () => {
      mockCanEditOrganizationStatus.mockResolvedValue(false)

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      const editButton = screen.queryByLabelText('Edit Operation Details')
      expect(editButton).not.toBeInTheDocument()
    })
  })

  describe('Operations Modal Integration', () => {
    it('should open operations modal when edit button is clicked', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Check that modal is open
      expect(screen.getByText('Update Operation Details')).toBeInTheDocument()
    })

    it('should initialize modal with current operation data', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Check that modal is initialized with current data
      expect(screen.getByLabelText(/fiscal year start/i)).toHaveValue('2025-01-01')
      expect(screen.getByLabelText(/fiscal year end/i)).toHaveValue('2025-12-31')
      expect(screen.getByLabelText(/^VAT Registration Effectivity$/i)).toHaveValue('2025-01-01')
      expect(screen.getByLabelText(/^Registration Effectivity$/i)).toHaveValue('2025-01-01')
      expect(screen.getByLabelText(/payroll cut-off.*comma-separated/i)).toHaveValue('15,30')
      expect(screen.getByLabelText(/payment cut-off.*comma-separated/i)).toHaveValue('10,25')
      expect(screen.getByLabelText(/quarter closing.*comma-separated/i)).toHaveValue('03-31,06-30,09-30,12-31')
      expect(screen.getByLabelText(/accounting method/i)).toHaveValue('ACCRUAL')
      expect(screen.getByLabelText(/has employees/i)).toBeChecked()
      expect(screen.getByLabelText(/has foreign transactions/i)).not.toBeChecked()
    })

    it('should close modal when cancel is clicked', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Update Operation Details')).not.toBeInTheDocument()
      })
    })

    it('should update operation data when modal is saved', async () => {
      const mockUpdateOperation = vi.mocked(OrganizationService.updateOrganizationOperation)

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Modify some data
      const fyStartInput = screen.getByLabelText(/fiscal year start/i)
      fireEvent.change(fyStartInput, { target: { value: '2025-02-01' } })

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // Check that API was called with updated data
      await waitFor(() => {
        expect(mockUpdateOperation).toHaveBeenCalledWith('test-org-123', expect.objectContaining({
          fy_start: '2025-02-01',
          fy_end: '2025-12-31',
          accounting_method: 'ACCRUAL'
        }))
      })
    })

    it('should refresh operation data after successful save', async () => {
      const updatedOperation = { ...mockOrganizationOperation, fy_start: '2025-02-01' }
      vi.mocked(OrganizationService.updateOrganizationOperation).mockResolvedValue(updatedOperation)

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Modify fiscal year start
      const fyStartInput = screen.getByLabelText(/fiscal year start/i)
      fireEvent.change(fyStartInput, { target: { value: '2025-02-01' } })

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText('Update Operation Details')).not.toBeInTheDocument()
      })

      // Verify that the operation data was updated in the UI
      expect(screen.getByText('Feb 2025')).toBeInTheDocument() // Updated fy_start formatted
    })

    it('should handle API errors during save', async () => {
      const mockUpdateOperation = vi.mocked(OrganizationService.updateOrganizationOperation)
      mockUpdateOperation.mockRejectedValue(new Error('API Error'))

      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // Modal should remain open on error
      await waitFor(() => {
        expect(screen.getByText('Update Operation Details')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to update organization operation:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should show loading state during save', async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(OrganizationService.updateOrganizationOperation).mockReturnValue(pendingPromise)

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // Check loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })

      // Resolve the promise to complete the test
      resolvePromise!({})
    })
  })

  describe('Permission Integration', () => {
    it('should check permissions when edit button is clicked', async () => {
      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Wait for edit button to appear and click it
      const editButton = await screen.findByLabelText('Edit Operation Details')
      fireEvent.click(editButton)

      // Verify permission check was called
      expect(mockCanEditOrganizationStatus).toHaveBeenCalledWith('test-org-123')
    })

    it('should not open modal if user lacks permission', async () => {
      mockCanEditOrganizationStatus.mockResolvedValue(false)

      render(
        <BrowserRouter>
          <OrganizationPage />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Organization Details')).toBeInTheDocument()
      })

      // Click on Operations tab
      const operationsTab = screen.getByRole('button', { name: /operations/i })
      fireEvent.click(operationsTab)

      // Edit button should not be present
      const editButton = screen.queryByLabelText('Edit Operation Details')
      expect(editButton).not.toBeInTheDocument()
    })
  })
})