import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrganizationTaxClassUpdateModal, type UpdateTaxClassFormData } from './OrganizationTaxClassUpdateModal'

// Mock RadioOptionSelector
vi.mock('../RadioOptionSelector', () => ({
  RadioOptionSelector: ({ name, selectedValue, onChange, options }: any) => (
    <div data-testid={`radio-selector-${name}`}>
      {options.map((option: any) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}))

describe('OrganizationTaxClassUpdateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    currentTaxClassification: 'VAT' as const,
    currentVatRegEffectivity: '2024-01-01',
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when isOpen is true', () => {
    render(<OrganizationTaxClassUpdateModal {...defaultProps} />)
    
    expect(screen.getByText('Update Organization Type')).toBeInTheDocument()
    expect(screen.getByText('Tax Classification *')).toBeInTheDocument()
    expect(screen.getByText('VAT Registration Effectivity')).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(<OrganizationTaxClassUpdateModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Update Organization Type')).not.toBeInTheDocument()
  })

  it('pre-populates form with current values', () => {
    render(<OrganizationTaxClassUpdateModal {...defaultProps} />)
    
    const vatRadio = screen.getByDisplayValue('VAT')
    expect(vatRadio).toBeChecked()
    
    const dateInput = screen.getByDisplayValue('2024-01-01')
    expect(dateInput).toBeInTheDocument()
  })

  it('calls onSave with correct data when form is submitted', async () => {
    const mockOnSave = vi.fn()
    render(<OrganizationTaxClassUpdateModal {...defaultProps} onSave={mockOnSave} />)
    
    // Change tax classification to NON_VAT
    const nonVatRadio = screen.getByDisplayValue('NON_VAT')
    fireEvent.click(nonVatRadio)
    
    // Change date
    const dateInput = screen.getByDisplayValue('2024-01-01')
    fireEvent.change(dateInput, { target: { value: '2024-02-01' } })
    
    // Submit form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        tax_classification: 'NON_VAT',
        vat_reg_effectivity: '2024-02-01'
      })
    })
  })

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn()
    render(<OrganizationTaxClassUpdateModal {...defaultProps} onClose={mockOnClose} />)
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay is clicked', () => {
    const mockOnClose = vi.fn()
    render(<OrganizationTaxClassUpdateModal {...defaultProps} onClose={mockOnClose} />)
    
    const overlay = screen.getByRole('dialog').parentElement
    fireEvent.click(overlay!)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state when loading prop is true', () => {
    render(<OrganizationTaxClassUpdateModal {...defaultProps} loading={true} />)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('disables form inputs when loading', () => {
    render(<OrganizationTaxClassUpdateModal {...defaultProps} loading={true} />)
    
    const dateInput = screen.getByDisplayValue('2024-01-01')
    expect(dateInput).toBeDisabled()
  })

  it('handles empty vat_reg_effectivity correctly', async () => {
    const mockOnSave = vi.fn()
    render(<OrganizationTaxClassUpdateModal {...defaultProps} onSave={mockOnSave} currentVatRegEffectivity="" />)
    
    // Clear the date input
    const dateInput = screen.getByDisplayValue('')
    fireEvent.change(dateInput, { target: { value: '' } })
    
    // Submit form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        tax_classification: 'VAT',
        vat_reg_effectivity: ''
      })
    })
  })

  it('validates required tax_classification field', async () => {
    const mockOnSave = vi.fn()
    render(<OrganizationTaxClassUpdateModal {...defaultProps} onSave={mockOnSave} />)
    
    // Submit form without changing anything (should still work since VAT is pre-selected)
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        tax_classification: 'VAT',
        vat_reg_effectivity: '2024-01-01'
      })
    })
  })
})