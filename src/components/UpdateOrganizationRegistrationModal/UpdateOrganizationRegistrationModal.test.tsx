import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateOrganizationRegistrationModal } from './UpdateOrganizationRegistrationModal'

// Mock the organization service
vi.mock('../../services/organizationService', () => ({
  OrganizationService: {
    updateOrganizationRegistration: vi.fn()
  }
}))

describe('UpdateOrganizationRegistrationModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  const mockCurrentRegistration = {
    first_name: 'John',
    middle_name: 'Michael',
    last_name: 'Doe',
    registered_name: 'ABC Corporation',
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
    tax_type: 'VAT' as const,
    start_date: '2024-01-01',
    reg_date: '2024-01-01'
  }

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    currentRegistration: mockCurrentRegistration,
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Update Registration Information')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      expect(screen.getByText('Update Registration Information')).toBeInTheDocument()
    })

    it('should display all form fields with current values', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Michael')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ABC Trading')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6201')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123 Main Street')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Makati')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1223')).toBeInTheDocument()
      expect(screen.getByDisplayValue('001234567890')).toBeInTheDocument()
      expect(screen.getByDisplayValue('001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+639123456789')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
      
      // Check that select elements are present
      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(2) // Region and Tax Classification selects
    })
  })

  describe('Form Interaction', () => {
    it('should allow updating form fields', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const firstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } })
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onSave with updated data when Save button is clicked', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const firstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } })
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockCurrentRegistration,
        first_name: 'Jane'
      })
    })
  })

  describe('Loading State', () => {
    it('should disable Save button when loading', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} loading={true} />)
      
      const saveButton = screen.getByText('Saving...')
      expect(saveButton).toBeDisabled()
    })

    it('should show loading text when loading', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} loading={true} />)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const firstNameInput = screen.getByDisplayValue('John')
      fireEvent.change(firstNameInput, { target: { value: '' } })
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })

    it('should validate TIN format', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const tinInput = screen.getByDisplayValue('001234567890')
      fireEvent.change(tinInput, { target: { value: '123' } })
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      expect(screen.getByText('TIN must be 9 or 12 digits')).toBeInTheDocument()
    })

    it('should validate email format', () => {
      render(<UpdateOrganizationRegistrationModal {...defaultProps} />)
      
      const emailInput = screen.getByDisplayValue('john.doe@example.com')
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      // Check if form doesn't submit with invalid email (doesn't call onSave)
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })
})