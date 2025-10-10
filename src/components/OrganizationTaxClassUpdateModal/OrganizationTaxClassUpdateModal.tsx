import React, { useState, useEffect } from 'react'
import { RadioOptionSelector } from '../RadioOptionSelector'

export interface UpdateTaxClassFormData {
  new_classification: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  effective_date: string
}

export interface OrganizationTaxClassUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateTaxClassFormData) => void
  currentTaxClassification: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  currentVatRegEffectivity?: string
  loading: boolean
}

export const OrganizationTaxClassUpdateModal: React.FC<OrganizationTaxClassUpdateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTaxClassification,
  currentVatRegEffectivity,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateTaxClassFormData>({
    new_classification: 'VAT',
    effective_date: ''
  })

  // Initialize form with current values when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        new_classification: currentTaxClassification,
        effective_date: currentVatRegEffectivity || ''
      })
    }
  }, [isOpen, currentTaxClassification, currentVatRegEffectivity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-slate-500/30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              Update Organization Type
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Tax Classification Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Tax Classification *
                </label>
                <RadioOptionSelector
                  name="new_classification"
                  selectedValue={formData.new_classification}
                  onChange={(value) => setFormData({ ...formData, new_classification: value as 'VAT' | 'NON_VAT' | 'EXCEMPT' })}
                  options={[
                    {
                      value: 'VAT',
                      label: 'VAT Registered',
                      description: 'Subject to VAT',
                      ariaLabel: 'VAT'
                    },
                    {
                      value: 'NON_VAT',
                      label: 'Percentage Tax',
                      description: 'Not subject to VAT',
                      ariaLabel: 'Non-VAT'
                    },
                    {
                      value: 'EXCEMPT',
                      label: 'Tax Excempted',
                      description: 'Excempt from tax',
                      ariaLabel: 'Tax Excempted'
                    }
                  ]}
                />
              </div>

              {/* VAT Registration Effectivity Field */}
              <div>
                <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Classification Update Effectivity
                </label>
                <input
                  type="date"
                  id="effective_date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Date when tax classification update becomes effective</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}