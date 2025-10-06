import React, { useState, useEffect } from 'react'

// Enum values from the requirements
const ACCOUNTING_METHOD_OPTIONS = [
  { value: 'ACCRUAL', label: 'Accrual' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHERS', label: 'Others' }
] as const

export interface UpdateOperationFormData {
  fy_start: string
  fy_end: string
  vat_reg_effectivity: string
  registration_effectivity: string
  payroll_cut_off: string[]
  payment_cut_off: string[]
  quarter_closing: string[]
  has_foreign: boolean
  has_employees: boolean
  is_ewt: boolean
  is_fwt: boolean
  is_bir_withholding_agent: boolean
  accounting_method: string
}

export interface UpdateOrganizationOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateOperationFormData) => void
  currentOperation: any
  loading: boolean
}

export const UpdateOrganizationOperationsModal: React.FC<UpdateOrganizationOperationsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentOperation,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateOperationFormData>({
    fy_start: '',
    fy_end: '',
    vat_reg_effectivity: '',
    registration_effectivity: '',
    payroll_cut_off: [],
    payment_cut_off: [],
    quarter_closing: [],
    has_foreign: false,
    has_employees: false,
    is_ewt: false,
    is_fwt: false,
    is_bir_withholding_agent: false,
    accounting_method: ''
  })

  // Initialize form with current operation values when modal opens or currentOperation changes
  useEffect(() => {
    if (isOpen && currentOperation) {
      setFormData({
        fy_start: currentOperation.fy_start || '',
        fy_end: currentOperation.fy_end || '',
        vat_reg_effectivity: currentOperation.vat_reg_effectivity || '',
        registration_effectivity: currentOperation.registration_effectivity || '',
        payroll_cut_off: Array.isArray(currentOperation.payroll_cut_off) ? currentOperation.payroll_cut_off : [],
        payment_cut_off: Array.isArray(currentOperation.payment_cut_off) ? currentOperation.payment_cut_off : [],
        quarter_closing: Array.isArray(currentOperation.quarter_closing) ? currentOperation.quarter_closing : [],
        has_foreign: Boolean(currentOperation.has_foreign),
        has_employees: Boolean(currentOperation.has_employees),
        is_ewt: Boolean(currentOperation.is_ewt),
        is_fwt: Boolean(currentOperation.is_fwt),
        is_bir_withholding_agent: Boolean(currentOperation.is_bir_withholding_agent),
        accounting_method: currentOperation.accounting_method || ''
      })
    }
  }, [isOpen, currentOperation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Helper function to convert array to comma-separated string for input display
  const arrayToString = (arr: string[]) => arr.join(',')

  // Helper function to convert comma-separated string back to array
  const stringToArray = (str: string) => str.split(',').map(s => s.trim()).filter(s => s.length > 0)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-slate-500/30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              Update Operation Details
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fiscal Year Start */}
              <div>
                <label htmlFor="fy_start" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiscal Year Start
                </label>
                <input
                  type="date"
                  id="fy_start"
                  value={formData.fy_start}
                  onChange={(e) => setFormData({ ...formData, fy_start: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Fiscal Year End */}
              <div>
                <label htmlFor="fy_end" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiscal Year End
                </label>
                <input
                  type="date"
                  id="fy_end"
                  value={formData.fy_end}
                  onChange={(e) => setFormData({ ...formData, fy_end: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* VAT Registration Effectivity */}
              <div>
                <label htmlFor="vat_reg_effectivity" className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Registration Effectivity
                </label>
                <input
                  type="date"
                  id="vat_reg_effectivity"
                  value={formData.vat_reg_effectivity}
                  onChange={(e) => setFormData({ ...formData, vat_reg_effectivity: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Registration Effectivity */}
              <div>
                <label htmlFor="registration_effectivity" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Effectivity
                </label>
                <input
                  type="date"
                  id="registration_effectivity"
                  value={formData.registration_effectivity}
                  onChange={(e) => setFormData({ ...formData, registration_effectivity: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Payroll Cut-off */}
              <div>
                <label htmlFor="payroll_cut_off" className="block text-sm font-medium text-gray-700 mb-1">
                  Payroll Cut-off (comma-separated)
                </label>
                <input
                  type="text"
                  id="payroll_cut_off"
                  value={arrayToString(formData.payroll_cut_off)}
                  onChange={(e) => setFormData({ ...formData, payroll_cut_off: stringToArray(e.target.value) })}
                  disabled={loading}
                  placeholder="e.g. 15,30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Payment Cut-off */}
              <div>
                <label htmlFor="payment_cut_off" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Cut-off (comma-separated)
                </label>
                <input
                  type="text"
                  id="payment_cut_off"
                  value={arrayToString(formData.payment_cut_off)}
                  onChange={(e) => setFormData({ ...formData, payment_cut_off: stringToArray(e.target.value) })}
                  disabled={loading}
                  placeholder="e.g. 10,25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Quarter Closing */}
              <div>
                <label htmlFor="quarter_closing" className="block text-sm font-medium text-gray-700 mb-1">
                  Quarter Closing (comma-separated)
                </label>
                <input
                  type="text"
                  id="quarter_closing"
                  value={arrayToString(formData.quarter_closing)}
                  onChange={(e) => setFormData({ ...formData, quarter_closing: stringToArray(e.target.value) })}
                  disabled={loading}
                  placeholder="e.g. 03-31,06-30,09-30,12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Accounting Method */}
              <div>
                <label htmlFor="accounting_method" className="block text-sm font-medium text-gray-700 mb-1">
                  Accounting Method
                </label>
                <select
                  id="accounting_method"
                  value={formData.accounting_method}
                  onChange={(e) => setFormData({ ...formData, accounting_method: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select method</option>
                  {ACCOUNTING_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boolean Fields */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_foreign"
                    checked={formData.has_foreign}
                    onChange={(e) => setFormData({ ...formData, has_foreign: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="has_foreign" className="ml-2 block text-sm text-gray-900">
                    Has Foreign Transactions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_employees"
                    checked={formData.has_employees}
                    onChange={(e) => setFormData({ ...formData, has_employees: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="has_employees" className="ml-2 block text-sm text-gray-900">
                    Has Employees
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_ewt"
                    checked={formData.is_ewt}
                    onChange={(e) => setFormData({ ...formData, is_ewt: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="is_ewt" className="ml-2 block text-sm text-gray-900">
                    Expanded Withholding Tax (EWT)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_fwt"
                    checked={formData.is_fwt}
                    onChange={(e) => setFormData({ ...formData, is_fwt: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="is_fwt" className="ml-2 block text-sm text-gray-900">
                    Final Withholding Tax (FWT)
                  </label>
                </div>

                <div className="flex items-center md:col-span-2">
                  <input
                    type="checkbox"
                    id="is_bir_withholding_agent"
                    checked={formData.is_bir_withholding_agent}
                    onChange={(e) => setFormData({ ...formData, is_bir_withholding_agent: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="is_bir_withholding_agent" className="ml-2 block text-sm text-gray-900">
                    BIR Withholding Agent
                  </label>
                </div>
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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