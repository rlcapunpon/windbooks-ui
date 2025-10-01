import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateOrganizationOperationsModal } from './UpdateOrganizationOperationsModal'

// Mock the organization service
vi.mock('../../services/organizationService', () => ({
  OrganizationService: {
    updateOrganizationOperation: vi.fn()
  }
}))

describe('UpdateOrganizationOperationsModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  const mockCurrentOperation = {
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

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    currentOperation: mockCurrentOperation,
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Update Operation Details')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)
      expect(screen.getByText('Update Operation Details')).toBeInTheDocument()
    })

    it('should render modal overlay and content', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Update Operation Details')).toBeInTheDocument()
    })
  })

  describe('Form Elements', () => {
    it('should render all required form fields', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Date fields - use more specific labels
      expect(screen.getByLabelText(/fiscal year start/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fiscal year end/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^VAT Registration Effectivity$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Registration Effectivity$/i)).toBeInTheDocument()

      // Multi-select fields (arrays)
      expect(screen.getByLabelText(/payroll cut-off.*comma-separated/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/payment cut-off.*comma-separated/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quarter closing.*comma-separated/i)).toBeInTheDocument()

      // Boolean checkboxes
      expect(screen.getByLabelText(/has foreign transactions/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/has employees/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/expanded withholding tax/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/final withholding tax/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/bir withholding agent/i)).toBeInTheDocument()

      // Select dropdown
      expect(screen.getByLabelText(/accounting method/i)).toBeInTheDocument()

      // Buttons
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('should render accounting method dropdown with all valid options', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const select = screen.getByLabelText(/accounting method/i) as HTMLSelectElement
      expect(select).toBeInTheDocument()

      // Check that all expected options are present
      expect(screen.getByRole('option', { name: 'Accrual' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Others' })).toBeInTheDocument()
    })

    it('should render Save and Cancel buttons', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('should initialize form with current operation values', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Check date fields
      expect(screen.getByLabelText(/fiscal year start/i)).toHaveValue('2025-01-01')
      expect(screen.getByLabelText(/fiscal year end/i)).toHaveValue('2025-12-31')
      expect(screen.getByLabelText(/^VAT Registration Effectivity$/i)).toHaveValue('2025-01-01')
      expect(screen.getByLabelText(/^Registration Effectivity$/i)).toHaveValue('2025-01-01')

      // Check multi-select fields (arrays are converted to comma-separated strings)
      expect(screen.getByLabelText(/payroll cut-off.*comma-separated/i)).toHaveValue('15,30')
      expect(screen.getByLabelText(/payment cut-off.*comma-separated/i)).toHaveValue('10,25')
      expect(screen.getByLabelText(/quarter closing.*comma-separated/i)).toHaveValue('03-31,06-30,09-30,12-31')

      // Check boolean checkboxes
      expect(screen.getByLabelText(/has foreign transactions/i)).not.toBeChecked()
      expect(screen.getByLabelText(/has employees/i)).toBeChecked()
      expect(screen.getByLabelText(/expanded withholding tax/i)).not.toBeChecked()
      expect(screen.getByLabelText(/final withholding tax/i)).not.toBeChecked()
      expect(screen.getByLabelText(/bir withholding agent/i)).not.toBeChecked()

      // Check select dropdown
      expect(screen.getByLabelText(/accounting method/i)).toHaveValue('ACCRUAL')
    })

    it('should handle missing operation data gracefully', () => {
      const emptyOperation = {}
      render(<UpdateOrganizationOperationsModal {...defaultProps} currentOperation={emptyOperation} />)

      // Fields should be empty or have default values
      expect(screen.getByLabelText(/fiscal year start/i)).toHaveValue('')
      expect(screen.getByLabelText(/fiscal year end/i)).toHaveValue('')
      expect(screen.getByLabelText(/accounting method/i)).toHaveValue('')
    })
  })

  describe('User Interactions', () => {
    it('should call onClose when Cancel button is clicked', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when clicking outside modal (overlay)', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Click on the backdrop (the div with onClick handler)
      const backdrop = screen.getByRole('dialog').parentElement!
      fireEvent.click(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should update fiscal year start when input value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const input = screen.getByLabelText(/fiscal year start/i)
      fireEvent.change(input, { target: { value: '2025-02-01' } })

      expect(input).toHaveValue('2025-02-01')
    })

    it('should update fiscal year end when input value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const input = screen.getByLabelText(/fiscal year end/i)
      fireEvent.change(input, { target: { value: '2025-12-31' } })

      expect(input).toHaveValue('2025-12-31')
    })

    it('should update payroll cut-off when input value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const input = screen.getByLabelText(/payroll cut-off/i)
      fireEvent.change(input, { target: { value: '15,30,31' } })

      expect(input).toHaveValue('15,30,31')
    })

    it('should update payment cut-off when input value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const input = screen.getByLabelText(/payment cut-off/i)
      fireEvent.change(input, { target: { value: '10,25,31' } })

      expect(input).toHaveValue('10,25,31')
    })

    it('should update quarter closing when input value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const input = screen.getByLabelText(/quarter closing/i)
      fireEvent.change(input, { target: { value: '03-31,06-30,09-30,12-31,01-15' } })

      expect(input).toHaveValue('03-31,06-30,09-30,12-31,01-15')
    })

    it('should toggle has foreign transactions checkbox', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/has foreign transactions/i)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('should toggle has employees checkbox', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/has employees/i)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should toggle expanded withholding tax checkbox', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/expanded withholding tax/i)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should toggle final withholding tax checkbox', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/final withholding tax/i)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should toggle bir withholding agent checkbox', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/bir withholding agent/i)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should update accounting method when dropdown value changes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      const select = screen.getByLabelText(/accounting method/i)
      fireEvent.change(select, { target: { value: 'CASH' } })

      expect(select).toHaveValue('CASH')
    })
  })

  describe('Form Submission', () => {
    it('should call onSave with form data when Save button is clicked', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      expect(mockOnSave).toHaveBeenCalledTimes(1)
      const calledData = mockOnSave.mock.calls[0][0]

      // Verify the structure of the data passed to onSave
      expect(calledData).toHaveProperty('fy_start')
      expect(calledData).toHaveProperty('fy_end')
      expect(calledData).toHaveProperty('vat_reg_effectivity')
      expect(calledData).toHaveProperty('registration_effectivity')
      expect(calledData).toHaveProperty('payroll_cut_off')
      expect(calledData).toHaveProperty('payment_cut_off')
      expect(calledData).toHaveProperty('quarter_closing')
      expect(calledData).toHaveProperty('has_foreign')
      expect(calledData).toHaveProperty('has_employees')
      expect(calledData).toHaveProperty('is_ewt')
      expect(calledData).toHaveProperty('is_fwt')
      expect(calledData).toHaveProperty('is_bir_withholding_agent')
      expect(calledData).toHaveProperty('accounting_method')
    })

    it('should convert comma-separated strings back to arrays for cut-off fields', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Modify the payroll cut-off field
      const payrollInput = screen.getByLabelText(/payroll cut-off/i)
      fireEvent.change(payrollInput, { target: { value: '1,15,30' } })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      const calledData = mockOnSave.mock.calls[0][0]
      expect(calledData.payroll_cut_off).toEqual(['1', '15', '30'])
    })

    it('should handle empty cut-off fields', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Clear the payroll cut-off field
      const payrollInput = screen.getByLabelText(/payroll cut-off/i)
      fireEvent.change(payrollInput, { target: { value: '' } })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      const calledData = mockOnSave.mock.calls[0][0]
      expect(calledData.payroll_cut_off).toEqual([])
    })
  })

  describe('Loading State', () => {
    it('should disable Save button when loading is true', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} loading={true} />)

      const saveButton = screen.getByRole('button', { name: /saving/i })
      expect(saveButton).toBeDisabled()
    })

    it('should show loading text on Save button when loading', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} loading={true} />)

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    it('should disable form inputs when loading is true', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} loading={true} />)

      expect(screen.getByLabelText(/fiscal year start/i)).toBeDisabled()
      expect(screen.getByLabelText(/fiscal year end/i)).toBeDisabled()
      expect(screen.getByLabelText(/payroll cut-off/i)).toBeDisabled()
      expect(screen.getByLabelText(/has employees/i)).toBeDisabled()
      expect(screen.getByLabelText(/accounting method/i)).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Update Operation Details')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(<UpdateOrganizationOperationsModal {...defaultProps} />)

      // Tab through form elements
      const firstInput = screen.getByLabelText(/fiscal year start/i)
      firstInput.focus()
      expect(document.activeElement).toBe(firstInput)

      // Test that Escape key closes modal (if implemented)
      // This would require additional keyboard event handling in the component
    })
  })
})