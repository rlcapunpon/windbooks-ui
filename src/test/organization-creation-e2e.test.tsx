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
    it('should successfully create a NON_INDIVIDUAL organization through all steps', { timeout: 10000 }, async () => {
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
          category: 'NON_INDIVIDUAL',
          tax_classification: 'VAT',
          tin: '001234567890',
          registration_date: '2024-01-01',
          line_of_business: '6201',
          address_line: '123 Business Street',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'contact@abc.com',
          start_date: '2024-01-01',
          registered_name: 'ABC Corporation Inc.',
          trade_name: 'ABC Corp',
          subcategory: 'CORPORATION',
          fy_start: '2024-01-01',
          accounting_method: 'ACCRUAL',
          has_employees: true,
          is_ewt: true
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

    it('should display autosave checkbox in Step 1', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Check that autosave checkbox is present in Step 1
      const autosaveCheckbox = screen.getByRole('checkbox', { name: /enable autosave/i })
      expect(autosaveCheckbox).toBeInTheDocument()
      expect(autosaveCheckbox).not.toBeChecked()
    })

    it('should display updated region options in Step 4', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Navigate to Step 4
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

      await user.click(nextButton) // Step 4

      // Check that all required region options are present
      expect(screen.getByRole('option', { name: 'Region 1 – Ilocos Region' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 2 – Cagayan Valley' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 3 – Central Luzon' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 4 – CALABARZON (Cavite, Laguna, Batangas, Rizal, Quezon)' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 5 – Bicol Region' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 6 – Western Visayas' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 7 – Central Visayas' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 8 – Eastern Visayas' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 9 – Zamboanga Peninsula' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 10 – Northern Mindanao' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 11 – Davao Region' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 12 – SOCCSKSARGEN (South Cotabato, Cotabato, Sultan Kudarat, Sarangani, GenSan)' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Region 13 – Caraga' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'CAR – Cordillera Administrative Region' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'NCR – National Capital Region (subdivided further into NCR East, West, North, South for RDOs)' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'ARMM / BARMM – Bangsamoro Autonomous Region in Muslim Mindanao' })).toBeInTheDocument()
    })

    it('should display EXCEMPT tax classification option in Step 1', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Check that EXCEMPT tax classification option is present
      const excemptRadio = screen.getByLabelText('Tax Excempted')
      expect(excemptRadio).toBeInTheDocument()
      expect(excemptRadio).toHaveAttribute('value', 'EXCEMPT')
    })

    it('should have updated TIN placeholder without dashes', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Navigate to Step 2 where TIN input is located
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await user.click(individualRadio)
      await user.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton) // Step 2

      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      
      // Check that placeholder does not contain dashes
      expect(tinInput).not.toHaveAttribute('placeholder', 'XXX-XXX-XXX-XXX')
      // Should have a placeholder that indicates numeric input without special characters
      expect(tinInput).toHaveAttribute('placeholder')
      const placeholder = tinInput.getAttribute('placeholder')
      expect(placeholder).not.toContain('-')
    })

    it('should send correct POST request DTO without invalid properties', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Fill form and submit
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

      await user.click(nextButton) // Step 4

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

      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 6

      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Verify the API call contains the correct DTO structure
      await waitFor(() => {
        const callArgs = vi.mocked(OrganizationService.createOrganization).mock.calls[0][0]
        
        // Check that required properties are present
        expect(callArgs).toHaveProperty('category')
        expect(callArgs).toHaveProperty('tax_classification')
        expect(callArgs).toHaveProperty('tin')
        expect(callArgs).toHaveProperty('registration_date')
        expect(callArgs).toHaveProperty('line_of_business')
        expect(callArgs).toHaveProperty('address_line')
        expect(callArgs).toHaveProperty('region')
        expect(callArgs).toHaveProperty('city')
        expect(callArgs).toHaveProperty('zip_code')
        expect(callArgs).toHaveProperty('rdo_code')
        expect(callArgs).toHaveProperty('contact_number')
        expect(callArgs).toHaveProperty('email_address')
        expect(callArgs).toHaveProperty('start_date')
        
        // Check that invalid properties are NOT present
        expect(callArgs).not.toHaveProperty('property name')
        expect(callArgs).not.toHaveProperty('property address')
        expect(callArgs).not.toHaveProperty('property tin_registration')
        expect(callArgs).not.toHaveProperty('property tax_type')
        expect(callArgs).not.toHaveProperty('property reg_date')
        
        // Check that the name field is NOT present (Step 7 requirement)
        expect(callArgs).not.toHaveProperty('name')
      })
    })

    it('should NOT include name field in organization creation API request', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const user = userEvent.setup()

      // Fill form and submit
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

      await user.click(nextButton) // Step 4

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

      const lineOfBusinessInput = screen.getByLabelText('Line of Business (PSIC Code) *')
      const rdoCodeInput = screen.getByLabelText('RDO Code *')
      const startDateInput = screen.getByLabelText('Start Date *')

      await user.type(lineOfBusinessInput, '6201')
      await user.type(rdoCodeInput, '001')
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

      await user.click(nextButton) // Step 6

      const createButton = screen.getByText('Create Organization')
      await user.click(createButton)

      // Verify the API call does NOT contain the name field
      await waitFor(() => {
        const callArgs = vi.mocked(OrganizationService.createOrganization).mock.calls[0][0]
        
        // Check that the name field is NOT present in the API request
        expect(callArgs).not.toHaveProperty('name')
        
        // Verify other required fields are still present
        expect(callArgs).toHaveProperty('category')
        expect(callArgs).toHaveProperty('tax_classification')
        expect(callArgs).toHaveProperty('first_name')
        expect(callArgs).toHaveProperty('last_name')
      })
    })

    describe('Radio Button Visual State', () => {
      it('should update organization category radio button visual state when selected', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        const user = userEvent.setup()

        // Step 1: Organization Type Selection
        expect(screen.getByText('Organization Type')).toBeInTheDocument()

        // Get the organization category radio buttons
        const individualRadio = screen.getByLabelText('Individual')
        const nonIndividualRadio = screen.getByLabelText('Non-Individual')

        // Initially, no category should be selected
        expect(individualRadio).not.toBeChecked()
        expect(nonIndividualRadio).not.toBeChecked()

        // Check visual state - Individual option should not have selected styling
        const individualLabel = individualRadio.closest('label')
        const individualContainer = individualLabel?.querySelector('.p-4')
        expect(individualContainer).toHaveClass('border-gray-200')
        expect(individualContainer).not.toHaveClass('border-blue-500', 'bg-blue-50')

        // Select Individual category
        await user.click(individualRadio)

        // Now Individual should be checked
        expect(individualRadio).toBeChecked()
        expect(nonIndividualRadio).not.toBeChecked()

        // Check visual state - Individual option should have selected styling
        expect(individualContainer).toHaveClass('border-primary', 'bg-primary/5')
        expect(individualContainer).not.toHaveClass('border-gray-200')

        // Check that the inner radio button dot is visible
        const individualInnerDot = individualContainer?.querySelector('.w-2.h-2')
        expect(individualInnerDot).toHaveClass('bg-primary')

        // Select Non-Individual category
        await user.click(nonIndividualRadio)

        // Now Non-Individual should be checked, Individual should be unchecked
        expect(individualRadio).not.toBeChecked()
        expect(nonIndividualRadio).toBeChecked()

        // Check visual state - Individual should lose selected styling, Non-Individual should gain it
        expect(individualContainer).toHaveClass('border-gray-200')
        expect(individualContainer).not.toHaveClass('border-primary', 'bg-primary/5')

        const nonIndividualLabel = nonIndividualRadio.closest('label')
        const nonIndividualContainer = nonIndividualLabel?.querySelector('.p-4')
        expect(nonIndividualContainer).toHaveClass('border-primary', 'bg-primary/5')
        expect(nonIndividualContainer).not.toHaveClass('border-gray-200')

        // Check that Non-Individual inner radio button dot is visible
        const nonIndividualInnerDot = nonIndividualContainer?.querySelector('.w-2.h-2')
        expect(nonIndividualInnerDot).toHaveClass('bg-primary')

        // Verify Individual inner dot is no longer visible (has no bg-primary)
        expect(individualInnerDot).not.toHaveClass('bg-primary')
      })

      it('should update tax classification radio button visual state when selected', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        const user = userEvent.setup()

        // Step 1: Organization Type Selection
        expect(screen.getByText('Organization Type')).toBeInTheDocument()

        // Select INDIVIDUAL category first
        const individualRadio = screen.getByLabelText('Individual')
        await user.click(individualRadio)

        // Get the tax classification radio buttons
        const vatRadio = screen.getByLabelText('VAT')
        const nonVatRadio = screen.getByLabelText('Non-VAT')
        const excemptRadio = screen.getByLabelText('Tax Excempted')

        // Initially, no tax classification should be selected
        expect(vatRadio).not.toBeChecked()
        expect(nonVatRadio).not.toBeChecked()
        expect(excemptRadio).not.toBeChecked()

        // Check visual state - VAT option should not have selected styling
        const vatLabel = vatRadio.closest('label')
        const vatContainer = vatLabel?.querySelector('.p-4')
        expect(vatContainer).toHaveClass('border-gray-200')
        expect(vatContainer).not.toHaveClass('border-blue-500', 'bg-blue-50')

        // Select VAT classification
        await user.click(vatRadio)

        // Now VAT should be checked
        expect(vatRadio).toBeChecked()
        expect(nonVatRadio).not.toBeChecked()
        expect(excemptRadio).not.toBeChecked()

        // Check visual state - VAT option should have selected styling
        expect(vatContainer).toHaveClass('border-primary', 'bg-primary/5')
        expect(vatContainer).not.toHaveClass('border-gray-200')

        // Check that the inner radio button dot is visible
        const vatInnerDot = vatContainer?.querySelector('.w-2.h-2')
        expect(vatInnerDot).toHaveClass('bg-primary')

        // Select NON_VAT classification
        await user.click(nonVatRadio)

        // Now NON_VAT should be checked, VAT should be unchecked
        expect(vatRadio).not.toBeChecked()
        expect(nonVatRadio).toBeChecked()
        expect(excemptRadio).not.toBeChecked()

        // Check visual state - VAT should lose selected styling, NON_VAT should gain it
        expect(vatContainer).toHaveClass('border-gray-200')
        expect(vatContainer).not.toHaveClass('border-primary', 'bg-primary/5')

        const nonVatLabel = nonVatRadio.closest('label')
        const nonVatContainer = nonVatLabel?.querySelector('.p-4')
        expect(nonVatContainer).toHaveClass('border-primary', 'bg-primary/5')
        expect(nonVatContainer).not.toHaveClass('border-gray-200')

        // Check that NON_VAT inner radio button dot is visible
        const nonVatInnerDot = nonVatContainer?.querySelector('.w-2.h-2')
        expect(nonVatInnerDot).toHaveClass('bg-primary')

        // Select EXCEMPT classification
        await user.click(excemptRadio)

        // Now EXCEMPT should be checked, others should be unchecked
        expect(vatRadio).not.toBeChecked()
        expect(nonVatRadio).not.toBeChecked()
        expect(excemptRadio).toBeChecked()

        // Check visual state - EXCEMPT should have selected styling
        const excemptLabel = excemptRadio.closest('label')
        const excemptContainer = excemptLabel?.querySelector('.p-4')
        expect(excemptContainer).toHaveClass('border-primary', 'bg-primary/5')
        expect(excemptContainer).not.toHaveClass('border-gray-200')

        // Check that EXCEMPT inner radio button dot is visible
        const excemptInnerDot = excemptContainer?.querySelector('.w-2.h-2')
        expect(excemptInnerDot).toHaveClass('bg-primary')
      })

      it('should handle complete Step 1 interaction flow with both radio button groups', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        const user = userEvent.setup()

        // Get all radio buttons
        const individualRadio = screen.getByLabelText('Individual')
        const nonIndividualRadio = screen.getByLabelText('Non-Individual')
        const vatRadio = screen.getByLabelText('VAT')
        const nonVatRadio = screen.getByLabelText('Non-VAT')
        const excemptRadio = screen.getByLabelText('Tax Excempted')

        // Initially nothing should be selected
        expect(individualRadio).not.toBeChecked()
        expect(nonIndividualRadio).not.toBeChecked()
        expect(vatRadio).not.toBeChecked()
        expect(nonVatRadio).not.toBeChecked()
        expect(excemptRadio).not.toBeChecked()

        // Next Step button should be disabled without both selections
        const nextButton = screen.getByText('Next Step')
        expect(nextButton).toBeDisabled()

        // Select organization category
        await user.click(individualRadio)
        expect(individualRadio).toBeChecked()
        // Still disabled without tax classification
        expect(nextButton).toBeDisabled()

        // Select tax classification
        await user.click(vatRadio)
        expect(vatRadio).toBeChecked()
        // Now should be enabled
        expect(nextButton).not.toBeDisabled()

        // Change selections and verify visual state updates
        await user.click(nonIndividualRadio)
        expect(nonIndividualRadio).toBeChecked()
        expect(individualRadio).not.toBeChecked()

        await user.click(excemptRadio)
        expect(excemptRadio).toBeChecked()
        expect(vatRadio).not.toBeChecked()

        // Verify visual styling is correct for final selections
        const nonIndividualLabel = nonIndividualRadio.closest('label')
        const nonIndividualContainer = nonIndividualLabel?.querySelector('.p-4')
        expect(nonIndividualContainer).toHaveClass('border-primary', 'bg-primary/5')

        const excemptLabel = excemptRadio.closest('label')
        const excemptContainer = excemptLabel?.querySelector('.p-4')
        expect(excemptContainer).toHaveClass('border-primary', 'bg-primary/5')

        // Button should still be enabled
        expect(nextButton).not.toBeDisabled()
      })
    })
  })
})
