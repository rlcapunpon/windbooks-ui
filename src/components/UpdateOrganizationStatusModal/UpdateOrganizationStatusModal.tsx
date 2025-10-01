import React, { useState, useEffect } from 'react'
import type { OrganizationStatus } from '../../services/organizationService'

// Enum values from the requirements
const STATUS_OPTIONS = [
  { value: 'PENDING_REG', label: 'Pending Registration' },
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'CESSATION', label: 'Cessation' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
  { value: 'UNDER_AUDIT', label: 'Under Audit' },
  { value: 'SUSPENDED', label: 'Suspended' }
] as const

const REASON_OPTIONS = [
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REMOVED', label: 'Removed' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'OPTED_OUT', label: 'Opted Out' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { value: 'VIOLATIONS', label: 'Violations' }
] as const

export interface UpdateStatusFormData {
  status: string
  reason: string
  description: string
}

export interface UpdateOrganizationStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateStatusFormData) => void
  currentStatus: OrganizationStatus
  loading: boolean
}

export const UpdateOrganizationStatusModal: React.FC<UpdateOrganizationStatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateStatusFormData>({
    status: '',
    reason: '',
    description: ''
  })

  // Initialize form with current status values when modal opens or currentStatus changes
  useEffect(() => {
    if (isOpen && currentStatus) {
      setFormData({
        status: currentStatus.status || '',
        reason: currentStatus.reason || 'APPROVED',
        description: currentStatus.description || ''
      })
    }
  }, [isOpen, currentStatus])

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
              Update Business Status
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
            <div className="space-y-4">
              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Field */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <select
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  {REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Optional description for the status change"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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