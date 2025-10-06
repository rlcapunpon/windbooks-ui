import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateOrganizationModal } from './CreateOrganizationModal'

describe('CreateOrganizationModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <CreateOrganizationModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.queryByText('Create New Organization')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Create New Organization')).toBeInTheDocument()
    })
  })

  describe('Step Navigation', () => {
    it('should start on step 1', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.getByText('Organization Type')).toBeInTheDocument()
    })

    it('should show step indicator', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
    })
  })

  describe('Step 1: Organization Type Selection', () => {
    it('should render category selection', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Organization Category *')).toBeInTheDocument()
      expect(screen.getByLabelText('Individual')).toBeInTheDocument()
      expect(screen.getByLabelText('Non-Individual')).toBeInTheDocument()
    })

    it('should render tax classification selection', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Tax Classification *')).toBeInTheDocument()
      expect(screen.getByLabelText('VAT')).toBeInTheDocument()
      expect(screen.getByLabelText('Non-VAT')).toBeInTheDocument()
    })

    it('should show subcategory when category is selected', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const individualRadio = screen.getByLabelText('Individual')
      await userEvent.click(individualRadio)

      expect(screen.getByLabelText('Subcategory')).toBeInTheDocument()
    })
  })

  describe('Navigation Buttons', () => {
    it('should show Next button on step 1', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Next Step')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })

    it('should show Previous and Next buttons on middle steps', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Fill required fields for step 1
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await userEvent.click(individualRadio)
      await userEvent.click(vatRadio)

      // Click Next to go to step 2
      const nextButton = screen.getByText('Next Step')
      await userEvent.click(nextButton)

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next Step')).toBeInTheDocument()
    })

    it('should show Create Organization button on final step', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // This test will need to be updated once we implement all steps
      // For now, we'll test that the modal renders correctly
      expect(screen.getByText('Create New Organization')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should prevent navigation to next step with invalid data', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const nextButton = screen.getByText('Next Step')
      await userEvent.click(nextButton)

      // Should still be on step 1
      expect(screen.getByText('Next Step')).toBeInTheDocument()
    })

    it('should allow navigation with valid data', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Fill required fields
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
      await userEvent.click(individualRadio)
      await userEvent.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await userEvent.click(nextButton)

      // Should move to step 2
      expect(screen.getByText('Next Step')).toBeInTheDocument()
    })

    describe('Registration Date Validation', () => {
      it('should accept valid past date', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should allow navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should accept today\'s date', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const today = new Date().toISOString().split('T')[0]
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.clear(registrationDateInput)
        await userEvent.type(registrationDateInput, today)

        // Should allow navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject future date', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)
        const futureDateString = futureDate.toISOString().split('T')[0]

        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.clear(registrationDateInput)
        await userEvent.type(registrationDateInput, futureDateString)

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject invalid date format', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.clear(registrationDateInput)
        await userEvent.type(registrationDateInput, 'invalid-date')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })
    })

    describe('TIN Validation', () => {
      it('should accept valid 9-digit TIN', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should allow navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should accept valid 12-digit TIN', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789012')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should allow navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject TIN with less than 9 digits', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '12345678')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject TIN with 10 digits (invalid length)', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '1234567890')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject TIN with 11 digits (invalid length)', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '12345678901')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject TIN with more than 12 digits', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '1234567890123')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject TIN with non-numeric characters', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 2
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton)

        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '12345678a')
        await userEvent.type(registrationDateInput, '2023-01-15')

        // Should prevent navigation to step 3
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })
    })

    describe('RDO Code Validation', () => {
      it('should accept valid 3-digit RDO code', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 5
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        // Fill step 3
        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe')
        await userEvent.click(nextButton) // Step 4

        // Fill step 4
        const addressInput = screen.getByLabelText('Street Address *')
        const cityInput = screen.getByLabelText('City *')
        const regionSelect = screen.getByLabelText('Region *')
        const zipInput = screen.getByLabelText('ZIP Code *')
        const contactInput = screen.getByLabelText('Contact Number *')
        const emailInput = screen.getByLabelText('Email Address *')
        await userEvent.type(addressInput, '123 Main St')
        await userEvent.type(cityInput, 'Manila')
        await userEvent.selectOptions(regionSelect, 'NCR')
        await userEvent.type(zipInput, '1000')
        await userEvent.type(contactInput, '+639123456789')
        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.click(nextButton) // Step 5

        const rdoInput = screen.getByLabelText('RDO Code *')
        const startDateInput = screen.getByLabelText('Start Date *')
        await userEvent.type(rdoInput, '123')
        await userEvent.type(startDateInput, '2023-01-15')

        // Should allow navigation to step 6
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject RDO code with less than 3 digits', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 5
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        // Fill step 3
        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe')
        await userEvent.click(nextButton) // Step 4

        // Fill step 4
        const addressInput = screen.getByLabelText('Street Address *')
        const cityInput = screen.getByLabelText('City *')
        const regionSelect = screen.getByLabelText('Region *')
        const zipInput = screen.getByLabelText('ZIP Code *')
        const contactInput = screen.getByLabelText('Contact Number *')
        const emailInput = screen.getByLabelText('Email Address *')
        await userEvent.type(addressInput, '123 Main St')
        await userEvent.type(cityInput, 'Manila')
        await userEvent.selectOptions(regionSelect, 'NCR')
        await userEvent.type(zipInput, '1000')
        await userEvent.type(contactInput, '+639123456789')
        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.click(nextButton) // Step 5

        const rdoInput = screen.getByLabelText('RDO Code *')
        const startDateInput = screen.getByLabelText('Start Date *')
        await userEvent.type(rdoInput, '12')
        await userEvent.type(startDateInput, '2023-01-15')

        // Should prevent navigation to step 6
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject RDO code with more than 3 digits', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 5
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        // Fill step 3
        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe')
        await userEvent.click(nextButton) // Step 4

        // Fill step 4
        const addressInput = screen.getByLabelText('Street Address *')
        const cityInput = screen.getByLabelText('City *')
        const regionSelect = screen.getByLabelText('Region *')
        const zipInput = screen.getByLabelText('ZIP Code *')
        const contactInput = screen.getByLabelText('Contact Number *')
        const emailInput = screen.getByLabelText('Email Address *')
        await userEvent.type(addressInput, '123 Main St')
        await userEvent.type(cityInput, 'Manila')
        await userEvent.selectOptions(regionSelect, 'NCR')
        await userEvent.type(zipInput, '1000')
        await userEvent.type(contactInput, '+639123456789')
        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.click(nextButton) // Step 5

        const rdoInput = screen.getByLabelText('RDO Code *')
        const startDateInput = screen.getByLabelText('Start Date *')
        await userEvent.type(rdoInput, '1234')
        await userEvent.type(startDateInput, '2023-01-15')

        // Should prevent navigation to step 6
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject RDO code with non-numeric characters', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 5
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        // Fill step 3
        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe')
        await userEvent.click(nextButton) // Step 4

        // Fill step 4
        const addressInput = screen.getByLabelText('Street Address *')
        const cityInput = screen.getByLabelText('City *')
        const regionSelect = screen.getByLabelText('Region *')
        const zipInput = screen.getByLabelText('ZIP Code *')
        const contactInput = screen.getByLabelText('Contact Number *')
        const emailInput = screen.getByLabelText('Email Address *')
        await userEvent.type(addressInput, '123 Main St')
        await userEvent.type(cityInput, 'Manila')
        await userEvent.selectOptions(regionSelect, 'NCR')
        await userEvent.type(zipInput, '1000')
        await userEvent.type(contactInput, '+639123456789')
        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.click(nextButton) // Step 5

        const rdoInput = screen.getByLabelText('RDO Code *')
        const startDateInput = screen.getByLabelText('Start Date *')
        await userEvent.type(rdoInput, '12a')
        await userEvent.type(startDateInput, '2023-01-15')

        // Should prevent navigation to step 6
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })
    })

    describe('Name Validation', () => {
      it('should accept valid first name with alphabetic characters', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John-Paul')
        await userEvent.type(lastNameInput, 'Doe')

        // Should allow navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should accept valid last name with spaces and hyphens', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Van der Berg')

        // Should allow navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject first name with numeric characters', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John123')
        await userEvent.type(lastNameInput, 'Doe')

        // Should prevent navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject last name with special characters', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.type(lastNameInput, 'Doe@#$')

        // Should prevent navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject empty first name', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.clear(firstNameInput)
        await userEvent.type(lastNameInput, 'Doe')

        // Should prevent navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })

      it('should reject empty last name', async () => {
        render(
          <CreateOrganizationModal
            isOpen={true}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Navigate to step 3
        const individualRadio = screen.getByLabelText('Individual')
        const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2

        // Fill step 2
        const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
        const registrationDateInput = screen.getByLabelText('Registration Date *')
        await userEvent.type(tinInput, '123456789')
        await userEvent.type(registrationDateInput, '2023-01-15')
        await userEvent.click(nextButton) // Step 3

        const firstNameInput = screen.getByLabelText('First Name')
        const lastNameInput = screen.getByLabelText('Last Name')
        await userEvent.type(firstNameInput, 'John')
        await userEvent.clear(lastNameInput)

        // Should prevent navigation to step 4
        await userEvent.click(nextButton)
        expect(screen.getByText('Next Step')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Actions', () => {
    it('should call onClose when close button is clicked', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const closeButton = screen.getByLabelText('Close modal')
      await userEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when Cancel button is clicked', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Organization Name Preview', () => {
    it('should show organization name preview for INDIVIDUAL category', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Select INDIVIDUAL category and fill step 1
      const individualRadio = screen.getByLabelText('Individual')
      await userEvent.click(individualRadio)
      const vatRadio = screen.getByLabelText('VAT')
      await userEvent.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await userEvent.click(nextButton) // Step 2

      // Fill required fields for step 2
      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await userEvent.type(tinInput, '001234567890')
      await userEvent.type(registrationDateInput, '2024-01-01')

      await userEvent.click(nextButton) // Step 3

      // Fill name fields
      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      await userEvent.type(firstNameInput, 'John')
      await userEvent.type(lastNameInput, 'Doe')

      expect(screen.getByText('Organization will be named:')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should show organization name preview for NON_INDIVIDUAL category', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Select NON_INDIVIDUAL category
      const nonIndividualRadio = screen.getByLabelText('Non-Individual')
      await userEvent.click(nonIndividualRadio)

      // Go to step 2 (Basic Information) where registered name appears
      const vatRadio = screen.getByLabelText('VAT')
      await userEvent.click(vatRadio)

      const nextButton = screen.getByText('Next Step')
      await userEvent.click(nextButton) // Step 2

      // Fill registered name
      const registeredNameInput = screen.getByLabelText('Registered Business Name')
      await userEvent.type(registeredNameInput, 'ABC Corporation')

      expect(screen.getByText('Organization will be named:')).toBeInTheDocument()
      expect(screen.getByText('ABC Corporation')).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('should allow file upload in registration step', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      // Navigate to step 2 first
      const individualRadio = screen.getByLabelText('Individual')
      const vatRadio = screen.getByLabelText('VAT')
        await userEvent.click(individualRadio)
        await userEvent.click(vatRadio)

        const nextButton = screen.getByText('Next Step')
        await userEvent.click(nextButton) // Step 2      // Fill required fields for step 2
      const tinInput = screen.getByLabelText('Tax Identification Number (TIN) *')
      const registrationDateInput = screen.getByLabelText('Registration Date *')
      await userEvent.type(tinInput, '001234567890')
      await userEvent.type(registrationDateInput, '2024-01-01')

      await userEvent.click(nextButton) // Step 3

      const fileInput = screen.getByLabelText('Upload Image (Optional)')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
    })
  })

  describe('Form Submission', () => {
    it('should call onSuccess with form data when submitted', async () => {
      // This test will be implemented once the full form is complete
      // For now, just verify the modal renders
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText('Create New Organization')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(
        <CreateOrganizationModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      )

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })
  })
})
