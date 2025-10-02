import React, { useState, useEffect } from 'react'

// Tax type options from the requirements
const TAX_TYPE_OPTIONS = [
  { value: 'VAT', label: 'VAT' },
  { value: 'NON_VAT', label: 'Percentage Tax' },
  { value: 'EXCEMPT', label: 'Tax Excempted' }
] as const

// Region options from the requirements
const REGION_OPTIONS = [
  { value: 'Region 1', label: 'Region 1 – Ilocos Region' },
  { value: 'Region 2', label: 'Region 2 – Cagayan Valley' },
  { value: 'Region 3', label: 'Region 3 – Central Luzon' },
  { value: 'Region 4', label: 'Region 4 – CALABARZON (Cavite, Laguna, Batangas, Rizal, Quezon)' },
  { value: 'Region 5', label: 'Region 5 – Bicol Region' },
  { value: 'Region 6', label: 'Region 6 – Western Visayas' },
  { value: 'Region 7', label: 'Region 7 – Central Visayas' },
  { value: 'Region 8', label: 'Region 8 – Eastern Visayas' },
  { value: 'Region 9', label: 'Region 9 – Zamboanga Peninsula' },
  { value: 'Region 10', label: 'Region 10 – Northern Mindanao' },
  { value: 'Region 11', label: 'Region 11 – Davao Region' },
  { value: 'Region 12', label: 'Region 12 – SOCCSKSARGEN (South Cotabato, Cotabato, Sultan Kudarat, Sarangani, GenSan)' },
  { value: 'Region 13', label: 'Region 13 – Caraga' },
  { value: 'CAR', label: 'CAR – Cordillera Administrative Region' },
  { value: 'NCR', label: 'NCR – National Capital Region' },
  { value: 'ARMM', label: 'ARMM / BARMM – Bangsamoro Autonomous Region in Muslim Mindanao' }
] as const

export interface UpdateRegistrationFormData {
  first_name: string
  middle_name: string
  last_name: string
  registered_name?: string
  trade_name: string
  line_of_business: string
  address_line: string
  region: string
  city: string
  zip_code: string
  tin: string
  rdo_code: string
  contact_number: string
  email_address: string
  tax_type: string
  start_date: string
  reg_date: string
}

export interface UpdateOrganizationRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateRegistrationFormData) => void
  currentRegistration: any
  loading: boolean
}

export const UpdateOrganizationRegistrationModal: React.FC<UpdateOrganizationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentRegistration,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateRegistrationFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    registered_name: '',
    trade_name: '',
    line_of_business: '',
    address_line: '',
    region: '',
    city: '',
    zip_code: '',
    tin: '',
    rdo_code: '',
    contact_number: '',
    email_address: '',
    tax_type: '',
    start_date: '',
    reg_date: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialize form with current registration values when modal opens or currentRegistration changes
  useEffect(() => {
    if (isOpen && currentRegistration) {
      setFormData({
        first_name: currentRegistration.first_name || '',
        middle_name: currentRegistration.middle_name || '',
        last_name: currentRegistration.last_name || '',
        registered_name: currentRegistration.registered_name || '',
        trade_name: currentRegistration.trade_name || '',
        line_of_business: currentRegistration.line_of_business || '',
        address_line: currentRegistration.address_line || '',
        region: currentRegistration.region || '',
        city: currentRegistration.city || '',
        zip_code: currentRegistration.zip_code || '',
        tin: currentRegistration.tin || '',
        rdo_code: currentRegistration.rdo_code || '',
        contact_number: currentRegistration.contact_number || '',
        email_address: currentRegistration.email_address || '',
        tax_type: currentRegistration.tax_type || '',
        start_date: currentRegistration.start_date ? currentRegistration.start_date.split('T')[0] : '',
        reg_date: currentRegistration.reg_date ? currentRegistration.reg_date.split('T')[0] : ''
      })
      setValidationErrors({})
    }
  }, [isOpen, currentRegistration])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.first_name)) {
      errors.first_name = 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.last_name)) {
      errors.last_name = 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // TIN validation - must be 9 or 12 digits
    if (!formData.tin.trim()) {
      errors.tin = 'TIN is required'
    } else if (!/^\d{9}(\d{3})?$/.test(formData.tin)) {
      errors.tin = 'TIN must be 9 or 12 digits'
    }

    // Email validation
    if (!formData.email_address.trim()) {
      errors.email_address = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      errors.email_address = 'Please enter a valid email address'
    }

    // RDO Code validation - must be 3 digits
    if (!formData.rdo_code.trim()) {
      errors.rdo_code = 'RDO code is required'
    } else if (!/^\d{3}$/.test(formData.rdo_code)) {
      errors.rdo_code = 'RDO code must be 3 digits'
    }

    // Other required fields
    if (!formData.line_of_business.trim()) errors.line_of_business = 'Line of business is required'
    if (!formData.address_line.trim()) errors.address_line = 'Address is required'
    if (!formData.region.trim()) errors.region = 'Region is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.zip_code.trim()) errors.zip_code = 'ZIP code is required'
    if (!formData.contact_number.trim()) errors.contact_number = 'Contact number is required'
    if (!formData.tax_type.trim()) errors.tax_type = 'Tax type is required'
    if (!formData.start_date.trim()) errors.start_date = 'Start date is required'
    if (!formData.reg_date.trim()) errors.reg_date = 'Registration date is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleInputChange = (field: keyof UpdateRegistrationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 backdrop-blur-md bg-slate-500/30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Update Registration Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.first_name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter first name"
              />
              {validationErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter middle name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.last_name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter last name"
              />
              {validationErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Business Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trade Name
              </label>
              <input
                type="text"
                value={formData.trade_name}
                onChange={(e) => handleInputChange('trade_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter trade name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Line of Business <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.line_of_business}
                onChange={(e) => handleInputChange('line_of_business', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.line_of_business ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter PSIC code"
              />
              {validationErrors.line_of_business && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.line_of_business}</p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address_line}
                onChange={(e) => handleInputChange('address_line', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.address_line ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter address"
              />
              {validationErrors.address_line && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address_line}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.region ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select Region</option>
                {REGION_OPTIONS.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              {validationErrors.region && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.region}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.city ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter city"
              />
              {validationErrors.city && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.zip_code ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter ZIP code"
              />
              {validationErrors.zip_code && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.zip_code}</p>
              )}
            </div>
          </div>

          {/* Tax Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                TIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tin}
                onChange={(e) => handleInputChange('tin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.tin ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter TIN"
              />
              {validationErrors.tin && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.tin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RDO Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.rdo_code}
                onChange={(e) => handleInputChange('rdo_code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.rdo_code ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter RDO code"
              />
              {validationErrors.rdo_code && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.rdo_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tax Classification <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tax_type}
                onChange={(e) => handleInputChange('tax_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.tax_type ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select Tax Classification</option>
                {TAX_TYPE_OPTIONS.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.tax_type && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.tax_type}</p>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.contact_number ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter contact number"
              />
              {validationErrors.contact_number && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email_address}
                onChange={(e) => handleInputChange('email_address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.email_address ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter email address"
              />
              {validationErrors.email_address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email_address}</p>
              )}
            </div>
          </div>

          {/* Date Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.start_date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {validationErrors.start_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.reg_date}
                onChange={(e) => handleInputChange('reg_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.reg_date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {validationErrors.reg_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.reg_date}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}