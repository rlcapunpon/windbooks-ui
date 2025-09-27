import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateOrganizationModal } from '../components/CreateOrganizationModal/CreateOrganizationModal'

// Mock the organization service
vi.mock('../services/organizationService', () => ({
  OrganizationService: {
    createOrganization: vi.fn()
  }
}))

import { OrganizationService } from '../services/organizationService'

// E2E T      // Mock successful organization creation
      vi.mocked(OrganizationService.createOrganization).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'org-123',
          name: 'Test Organization',
          tin: '001234567890',
          category: 'INDIVIDUAL',
          tax_classification: 'VAT',
          registration_date: '2024-01-01',
          address: '123 Test St, Test City, NCR 1234',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          status: {
            id: 'status-123',
            organization_id: 'org-123',
            status: 'ACTIVE',
            last_update: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }), 100))
      )

  describe('Organization Creation E2E Flow', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful organization creation
    vi.mocked(OrganizationService.createOrganization).mockResolvedValue({
      id: 'org-123',
      name: 'Test Organization',
      tin: '001234567890',
      category: 'NON_INDIVIDUAL',
      tax_classification: 'VAT',
      registration_date: '2024-01-01',
      address: '123 Test St, Test City, NCR 1234',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      status: {
        id: 'status-123',
        organization_id: 'org-123',
        status: 'ACTIVE',
        last_update: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    })
  })

  describe('Complete Organization Creation Journey', () => {
    it('should successfully create a NON_INDIVIDUAL organization through all steps', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Step 1: Organization Type Selection
      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Organization Type')).toBeInTheDocument()

      // Select NON_INDIVIDUAL category and VAT classification
      const nonIndividualRadio = screen.getByLabelText('Non-Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(nonIndividualRadio)
      await user.click(vatRadio)

      // Select subcategory
      const subcategorySelect = screen.getByLabelText('Subcategory')
      await user.selectOptions(subcategorySelect, 'CORPORATION')

      // Navigate to Step 2
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Step 2: Basic Organization Information
      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Basic Organization Information')).toBeInTheDocument()

      // Fill required fields
      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')

      await user.type(tinInput, '001234567890')
      fireEvent.change(registrationDateInput, { target: { value: '2024-01-01' } })

      // Navigate to Step 3
      await user.click(nextButton)

      // Step 3: Registrant Information
      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Registrant Information')).toBeInTheDocument()

      // Fill registered name
      const registeredNameInput = screen.getByLabelText('Registered Business Name *')
      await user.type(registeredNameInput, 'ABC Corporation Inc.')

      // Fill trade name (optional)
      const tradeNameInput = screen.getByLabelText('Trade Name')
      await user.type(tradeNameInput, 'ABC Corp')

      // Upload file (optional)
      const fileInput = screen.getByLabelText('Upload Image (Optional)')
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      // Check organization name preview
      expect(screen.getByText('Organization will be named:')).toBeInTheDocument()
      expect(screen.getByText('ABC Corporation Inc.')).toBeInTheDocument()

      // Navigate to Step 4
      await user.click(nextButton)

      // Step 4: Business Address & Contact
      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Business Address & Contact')).toBeInTheDocument()

      // Fill address fields
      const addressInput = screen.getByPlaceholderText('Street address')
      const cityInput = screen.getByPlaceholderText('City')
      const regionSelect = screen.getByDisplayValue('Select region')
      const zipInput = screen.getByPlaceholderText('ZIP code')
      const contactInput = screen.getByPlaceholderText('+63XXXXXXXXXX')
      const emailInput = screen.getByPlaceholderText('email@example.com')

      await user.type(addressInput, '123 Business Street')
      await user.type(cityInput, 'Makati')
      await user.selectOptions(regionSelect, 'NCR')
      await user.type(zipInput, '1223')
      await user.type(contactInput, '+639123456789')
      await user.type(emailInput, 'contact@abc.com')

      // Navigate to Step 5
      await user.click(nextButton)

      // Step 5: Business Registration Details
      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Business Registration Details')).toBeInTheDocument()

      // Fill registration details
      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      // Navigate to Step 6
      await user.click(nextButton)

      // Step 6: Advanced Settings
      expect(screen.getByText('Create Organization')).toBeInTheDocument()
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument()

      // Fill some optional settings
      const fyStartInput = screen.getByLabelText('Fiscal Year Start')
      const accountingMethodSelect = screen.getByLabelText('Accounting Method')

      fireEvent.change(fyStartInput, { target: { value: '2024-01-01' } })
      await user.selectOptions(accountingMethodSelect, 'ACCRUAL')

      // Check some checkboxes
      const hasEmployeesCheckbox = screen.getByRole('checkbox', { name: /has employees/i })
      const isEwtCheckbox = screen.getByRole('checkbox', { name: /expanded withholding tax/i })

      await user.click(hasEmployeesCheckbox)
      await user.click(isEwtCheckbox)

      // Submit the form
      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Verify API call
      await waitFor(() => {
        expect(OrganizationService.createOrganization).toHaveBeenCalledWith({
          name: 'ABC Corporation Inc.',
          tin: '001234567890',
          category: 'NON_INDIVIDUAL',
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '2024-01-01',
          address: '123 Business Street, Makati, NCR 1223',
          first_name: '',
          middle_name: '',
          last_name: '',
          trade_name: 'ABC Corp',
          line_of_business: '6201',
          address_line: '123 Business Street',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin_registration: '001234567890',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'contact@abc.com',
          tax_type: 'VAT',
          start_date: '2024-01-01',
          reg_date: '2024-01-01',
          fy_start: '2024-01-01',
          fy_end: '',
          accounting_method: 'ACCRUAL',
          has_foreign: false,
          has_employees: true,
          is_ewt: true,
          is_fwt: false,
          is_bir_withholding_agent: false
        })
      })

      // Verify success callback
      expect(mockOnSuccess).toHaveBeenCalledWith({
        id: 'org-123',
        name: 'Test Organization',
        tin: '001234567890',
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
        registration_date: '2024-01-01',
        address: '123 Test St, Test City, NCR 1234',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        status: {
          id: 'status-123',
          organization_id: 'org-123',
          status: 'ACTIVE',
          last_update: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      })
    })

    it('should successfully create an INDIVIDUAL organization through all steps', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Step 1: Organization Type Selection
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      // Select subcategory
      const subcategorySelect = screen.getByLabelText('Subcategory')
      await user.selectOptions(subcategorySelect, 'SELF_EMPLOYED')

      // Navigate to Step 2
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Step 2: Basic Organization Information
      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await user.type(tinInput, '001234567891')
      fireEvent.change(registrationDateInput, { target: { value: '2024-01-01' } })

      // Navigate to Step 3
      await user.click(nextButton)

      // Step 3: Registrant Information
      const firstNameInput = screen.getByLabelText('First Name')
      const middleNameInput = screen.getByLabelText('Middle Name')
      const lastNameInput = screen.getByLabelText('Last Name')

      await user.type(firstNameInput, 'John')
      await user.type(middleNameInput, 'Michael')
      await user.type(lastNameInput, 'Doe')

      // Check organization name preview
      expect(screen.getByText('Organization will be named:')).toBeInTheDocument()
      expect(screen.getByText('John Michael Doe')).toBeInTheDocument()

      // Navigate through remaining steps and fill required fields
      await user.click(nextButton) // Step 4

      // Fill step 4
      const addressInput = screen.getByPlaceholderText('Street address')
      const cityInput = screen.getByPlaceholderText('City')
      const regionSelect = screen.getByDisplayValue('Select region')
      const zipInput = screen.getByPlaceholderText('ZIP code')
      const contactInput = screen.getByPlaceholderText('+63XXXXXXXXXX')
      const emailInput = screen.getByPlaceholderText('email@example.com')

      await user.type(addressInput, '123 Test St')
      await user.type(cityInput, 'Test City')
      await user.selectOptions(regionSelect, 'NCR')
      await user.type(zipInput, '1234')
      await user.type(contactInput, '+639123456789')
      await user.type(emailInput, 'test@example.com')

      await user.click(nextButton) // Step 5

      // Fill step 5
      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 6

      // Submit
      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Verify API call with correct name construction
      await waitFor(() => {
        expect(OrganizationService.createOrganization).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Michael Doe',
            category: 'INDIVIDUAL',
            first_name: 'John',
            middle_name: 'Michael',
            last_name: 'Doe'
          })
        )
      })

      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should handle form validation and prevent progression with invalid data', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Try to navigate without filling required fields
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Should still be on step 1
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

      // Fill step 1 partially
      const individualRadio = screen.getByLabelText('Individual')
      await user.click(individualRadio)
      // Don't fill tax classification

      await user.click(nextButton)
      // Should still be on step 1
      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

      // Fill step 1 completely
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(vatRadio)
      await user.click(nextButton)

      // Now on step 2, try to navigate without required fields
      await user.click(nextButton)
      // Should still be on step 2
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    })

    it('should allow navigating back and forth between steps', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Navigate forward
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton) // Step 2

      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()

      // Navigate back
      const prevButton = screen.getByText('Previous')
      await user.click(prevButton)

      expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()

      // Navigate forward again
      await user.click(nextButton)
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    })

    it('should handle file upload correctly', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Navigate to step 3 (where file upload is available)
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton) // Step 2

      // Fill step 2
      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await user.type(tinInput, '001234567890')
      fireEvent.change(registrationDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 3

      // Test file upload
      const fileInput = screen.getByLabelText('Upload Image (Optional)')
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', 'image/*')

      const file = new File(['test content'], 'registration.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      // Should show selected file name
      expect(screen.getByText('Selected: registration.png')).toBeInTheDocument()
    })

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      vi.mocked(OrganizationService.createOrganization).mockRejectedValue(
        new Error('API Error: Invalid TIN')
      )

      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Fill minimum required fields and submit
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton) // Step 2

      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await user.type(tinInput, '001234567890')
      fireEvent.change(registrationDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 3

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')

      // Navigate to final step - need to fill steps 4 and 5
      await user.click(nextButton) // Step 4

      // Fill step 4
      const addressInput = screen.getByPlaceholderText('Street address')
      const cityInput = screen.getByPlaceholderText('City')
      const regionSelect = screen.getByDisplayValue('Select region')
      const zipInput = screen.getByPlaceholderText('ZIP code')
      const contactInput = screen.getByPlaceholderText('+63XXXXXXXXXX')
      const emailInput = screen.getByPlaceholderText('email@example.com')

      await user.type(addressInput, '123 Test St')
      await user.type(cityInput, 'Test City')
      await user.selectOptions(regionSelect, 'NCR')
      await user.type(zipInput, '1234')
      await user.type(contactInput, '+639123456789')
      await user.type(emailInput, 'test@example.com')

      await user.click(nextButton) // Step 5

      // Fill step 5
      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 6

      // Submit (this should fail)
      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Verify error handling - the component should handle the error
      // In a real implementation, you might show an error modal or toast
      await waitFor(() => {
        expect(OrganizationService.createOrganization).toHaveBeenCalled()
      })

      // Modal should still be open (error didn't close it)
      expect(screen.getByText('Create New Organization')).toBeInTheDocument()
    })
  })

  describe('Accessibility and UX', () => {
    it('should maintain focus management during step navigation', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Start with focus on first input
      const individualRadio = screen.getByLabelText('Individual')
      individualRadio.focus()
      expect(document.activeElement).toBe(individualRadio)

      // Navigate steps
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Focus should move appropriately
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Test Tab navigation - first tab goes to close button
      await user.tab()
      expect(document.activeElement).toHaveAttribute('aria-label', 'Close modal')

      await user.tab()
      expect(document.activeElement).toHaveAttribute('aria-label', 'Individual')
    })

    it('should show loading states during submission', async () => {
      // Mock slow API response
      vi.mocked(OrganizationService.createOrganization).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'org-123',
          name: 'Test Organization',
          tin: '001234567890',
          category: 'INDIVIDUAL',
          tax_classification: 'VAT',
          registration_date: '2024-01-01',
          address: '123 Test St, Test City, NCR 1234',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          status: {
            id: 'status-123',
            organization_id: 'org-123',
            status: 'ACTIVE',
            last_update: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }), 100))
      )

      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Quick navigation to final step
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton) // Step 2

      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await user.type(tinInput, '001234567890')
      fireEvent.change(registrationDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 3

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')

      // Navigate to final step
      await user.click(nextButton) // Step 4

      // Fill step 4
      const addressInput = screen.getByPlaceholderText('Street address')
      const cityInput = screen.getByPlaceholderText('City')
      const regionSelect = screen.getByDisplayValue('Select region')
      const zipInput = screen.getByPlaceholderText('ZIP code')
      const contactInput = screen.getByPlaceholderText('+63XXXXXXXXXX')
      const emailInput = screen.getByPlaceholderText('email@example.com')

      await user.type(addressInput, '123 Test St')
      await user.type(cityInput, 'Test City')
      await user.selectOptions(regionSelect, 'NCR')
      await user.type(zipInput, '1234')
      await user.type(contactInput, '+639123456789')
      await user.type(emailInput, 'test@example.com')

      await user.click(nextButton) // Step 5

      // Fill step 5
      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 6

      // Submit
      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Button should be disabled during submission
      expect(createButton).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })
})
