import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrganizationService, type Organization, type CreateOrganizationRequestDto, type UpdateOrganizationOperationRequestDto } from '../../services/organizationService'
import { RadioOptionSelector } from '../RadioOptionSelector'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: Organization) => Promise<void> | void
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Organization Type
    category: '',
    subcategory: '',
    tax_classification: '',
    enable_autosave: false,

    // Step 2: Basic Information
    registered_name: '',
    tin: '',
    registration_date: '',

    // Step 3: Registrant Information
    first_name: '',
    middle_name: '',
    last_name: '',
    trade_name: '',

    // Step 4: Business Address & Contact
    address_line: '',
    city: '',
    region: '',
    zip_code: '',
    contact_number: '',
    email_address: '',

    // Step 5: Business Registration Details
    line_of_business: '',
    rdo_code: '',
    start_date: '',

    // Step 6: Advanced Settings (Optional)
    fy_start: '',
    fy_end: '',
    vat_reg_effectivity: '',
    registration_effectivity: '',
    payroll_cut_off: [] as string[],
    payment_cut_off: [] as string[],
    quarter_closing: [] as string[],
    has_foreign: false,
    has_employees: false,
    is_ewt: false,
    is_fwt: false,
    is_bir_withholding_agent: false,
    accounting_method: ''
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Autosave functionality
  useEffect(() => {
    if (formData.enable_autosave) {
      const autosaveData = {
        ...formData,
        uploadedFile: uploadedFile ? {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type
        } : null
      }
      localStorage.setItem('organizationCreationDraft', JSON.stringify(autosaveData))
    }
  }, [formData, uploadedFile])

  // Load autosave data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('organizationCreationDraft')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Only load if autosave was enabled
        if (parsedData.enable_autosave) {
          setFormData(prev => ({ ...prev, ...parsedData }))
          // Note: File upload cannot be restored from localStorage
        }
      } catch (error) {
        console.warn('Failed to load autosave data:', error)
      }
    }
  }, [])

  if (!isOpen) return null

  const totalSteps = 6

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    let safeValue = value
    if (value === undefined || value === null) {
      if (['has_foreign', 'has_employees', 'is_ewt', 'is_fwt', 'is_bir_withholding_agent', 'enable_autosave'].includes(field)) {
        safeValue = false
      } else if (['payroll_cut_off', 'payment_cut_off', 'quarter_closing'].includes(field)) {
        safeValue = []
      } else {
        safeValue = ''
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: safeValue,
      ...(field === 'category' && { subcategory: '' })
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const getOrganizationNamePreview = () => {
    if (formData.category === 'INDIVIDUAL') {
      const { first_name, middle_name, last_name } = formData
      return [first_name, middle_name, last_name].filter(Boolean).join(' ')
    } else if (formData.category === 'NON_INDIVIDUAL') {
      return formData.registered_name
    }
    return ''
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : step < currentStep
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <div className="text-xs mt-2 font-medium text-gray-600">
                {step === 1 && 'Type'}
                {step === 2 && 'ID'}
                {step === 3 && 'Registrant'}
                {step === 4 && 'Address'}
                {step === 5 && 'Business'}
                {step === 6 && 'Advanced'}
              </div>
            </div>
            {step < totalSteps && (
              <div
                className={`w-16 h-0.5 mx-2 transition-all duration-500 ${
                  step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                Organization Type
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Organization Category *
                  </label>
                  <RadioOptionSelector
                    name="category"
                    selectedValue={formData.category}
                    onChange={(value) => updateFormData('category', value)}
                    options={[
                      {
                        value: 'INDIVIDUAL',
                        label: 'Individual',
                        description: 'For sole proprietors and freelancers',
                        ariaLabel: 'Individual'
                      },
                      {
                        value: 'NON_INDIVIDUAL',
                        label: 'Non-Individual',
                        description: 'For corporations and organizations',
                        ariaLabel: 'Non-Individual'
                      }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Tax Classification *
                  </label>
                  <RadioOptionSelector
                    name="tax_classification"
                    selectedValue={formData.tax_classification}
                    onChange={(value) => updateFormData('tax_classification', value)}
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

                {formData.category && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => updateFormData('subcategory', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      aria-label="Subcategory"
                    >
                      <option value="">Select subcategory (optional)</option>
                      {formData.category === 'INDIVIDUAL' ? (
                        <>
                          <option value="SELF_EMPLOYED">Self Employed</option>
                          <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                          <option value="FREELANCER">Freelancer</option>
                          <option value="PROFESSIONAL">Professional</option>
                          <option value="BMBE">Barangay Micro Business Enterprise</option>
                          <option value="MIXED_INCOME">Mixed Income</option>
                          <option value="ESTATE">Estate</option>
                          <option value="DONOR">Donor</option>
                        </>
                      ) : (
                        <>
                          <option value="CORPORATION">Corporation</option>
                          <option value="FOREIGN_CORP">Foreign Corporation</option>
                          <option value="PARTNERSHIP">Partnership</option>
                          <option value="COOPERATIVE">Cooperative</option>
                          <option value="NGO">NGO</option>
                          <option value="GOVERNMENT">Government</option>
                          <option value="GOCC">GOCC</option>
                          <option value="REAL_ESTATE_DEV">Real Estate Developer</option>
                          <option value="IMPORTER">Importer</option>
                          <option value="EXPORTER">Exporter</option>
                          <option value="OTHERS">Others</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="enable-autosave" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                    <input
                      id="enable-autosave"
                      type="checkbox"
                      checked={formData.enable_autosave}
                      onChange={(e) => updateFormData('enable_autosave', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Enable Autosave</span>
                      <p className="text-xs text-gray-500">Automatically save your progress as you fill out the form</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Basic Organization Information
              </h3>
              <div className="space-y-6">
                <div className={formData.category === 'NON_INDIVIDUAL' ? '' : 'hidden'}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.registered_name}
                    onChange={(e) => updateFormData('registered_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    placeholder="Enter registered business name"
                    aria-label="Registered Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Identification Number (TIN) *
                  </label>
                  <input
                    type="text"
                    value={formData.tin}
                    onChange={(e) => updateFormData('tin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white font-mono"
                    placeholder="123456789 or 123456789012"
                    maxLength={15}
                    aria-label="Tax Identification Number (TIN) *"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 9 or 12 digits (e.g., 123456789 or 123456789012)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registration Date *
                  </label>
                  <input
                    type="date"
                    value={formData.registration_date}
                    onChange={(e) => updateFormData('registration_date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    aria-label="Registration Date *"
                  />
                  <p className="text-xs text-gray-500 mt-1">Date when the business was registered</p>
                </div>

                {getOrganizationNamePreview() && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-primary-dark">
                          Organization will be named:
                        </p>
                        <p className="text-lg font-semibold text-primary mt-1">
                          {getOrganizationNamePreview()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Registrant Information
              </h3>
              <div className="space-y-6">
                <div className={formData.category === 'INDIVIDUAL' ? '' : 'hidden'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => updateFormData('first_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                        placeholder="Enter first name"
                        aria-label="First Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="middle-name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        id="middle-name"
                        type="text"
                        value={formData.middle_name}
                        onChange={(e) => updateFormData('middle_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                        placeholder="Enter middle name (optional)"
                        aria-label="Middle Name"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="last-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => updateFormData('last_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="Enter last name"
                      aria-label="Last Name"
                    />
                  </div>
                </div>

                <div className={formData.category === 'NON_INDIVIDUAL' ? '' : 'hidden'}>
                  <div>
                    <label htmlFor="registered-business-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Registered Business Name *
                    </label>
                    <input
                      id="registered-business-name"
                      type="text"
                      value={formData.registered_name}
                      onChange={(e) => updateFormData('registered_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="Enter registered business name"
                      aria-label="Registered Business Name"
                    />
                  </div>
                  <div>
                    <br></br>
                    <label htmlFor="trade-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Trade Name
                    </label>
                    <input
                      id="trade-name"
                      type="text"
                      value={formData.trade_name}
                      onChange={(e) => updateFormData('trade_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="Enter trade name (optional)"
                      aria-label="Trade Name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Different from registered name</p>
                  </div>
                </div>

                {getOrganizationNamePreview() && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-primary-dark">
                          Organization will be named:
                        </p>
                        <p className="text-lg font-semibold text-primary mt-1">
                          {getOrganizationNamePreview()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Image (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        aria-label="Upload Image (Optional)"
                      />
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-800 font-medium">
                          Selected: {uploadedFile.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                Business Address & Contact
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="street-address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    id="street-address"
                    type="text"
                    value={formData.address_line}
                    onChange={(e) => updateFormData('address_line', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    placeholder="Street address"
                    aria-label="Street Address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="City"
                      aria-label="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">
                      Region *
                    </label>
                    <select
                      id="region"
                      value={formData.region}
                      onChange={(e) => updateFormData('region', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      aria-label="Region"
                    >
                      <option value="">Select region</option>
                      <option value="Region I">Region 1 – Ilocos Region</option>
                      <option value="Region II">Region 2 – Cagayan Valley</option>
                      <option value="Region III">Region 3 – Central Luzon</option>
                      <option value="Region IV-A">Region 4 – CALABARZON (Cavite, Laguna, Batangas, Rizal, Quezon)</option>
                      <option value="Region V">Region 5 – Bicol Region</option>
                      <option value="Region VI">Region 6 – Western Visayas</option>
                      <option value="Region VII">Region 7 – Central Visayas</option>
                      <option value="Region VIII">Region 8 – Eastern Visayas</option>
                      <option value="Region IX">Region 9 – Zamboanga Peninsula</option>
                      <option value="Region X">Region 10 – Northern Mindanao</option>
                      <option value="Region XI">Region 11 – Davao Region</option>
                      <option value="Region XII">Region 12 – SOCCSKSARGEN (South Cotabato, Cotabato, Sultan Kudarat, Sarangani, GenSan)</option>
                      <option value="Region XIII">Region 13 – Caraga</option>
                      <option value="CAR">CAR – Cordillera Administrative Region</option>
                      <option value="NCR">NCR – National Capital Region (subdivided further into NCR East, West, North, South for RDOs)</option>
                      <option value="BARMM">ARMM / BARMM – Bangsamoro Autonomous Region in Muslim Mindanao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="zip-code" className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    id="zip-code"
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => updateFormData('zip_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    placeholder="ZIP code"
                    aria-label="ZIP Code"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-number" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      id="contact-number"
                      type="tel"
                      value={formData.contact_number}
                      onChange={(e) => updateFormData('contact_number', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="+63XXXXXXXXXX"
                      aria-label="Contact Number"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      value={formData.email_address}
                      onChange={(e) => updateFormData('email_address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      placeholder="email@example.com"
                      aria-label="Email Address"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Business Registration Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="line-of-business" className="block text-sm font-semibold text-gray-700 mb-2">
                    Line of Business (PSIC Code) *
                  </label>
                  <input
                    id="line-of-business"
                    type="text"
                    value={formData.line_of_business}
                    onChange={(e) => updateFormData('line_of_business', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    placeholder="PSIC code"
                    aria-label="Line of Business"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the Philippine Standard Industrial Classification code</p>
                </div>

                <div>
                  <label htmlFor="rdo-code" className="block text-sm font-semibold text-gray-700 mb-2">
                    RDO Code *
                  </label>
                  <input
                    id="rdo-code"
                    type="text"
                    value={formData.rdo_code}
                    onChange={(e) => updateFormData('rdo_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    placeholder="RDO code"
                    maxLength={3}
                    aria-label="RDO Code"
                  />
                  <p className="text-xs text-gray-500 mt-1">Revenue District Office code (3 digits)</p>
                </div>

                <div>
                  <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateFormData('start_date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    aria-label="Start Date"
                  />
                  <p className="text-xs text-gray-500 mt-1">Taxation start date on Windbooks</p>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-primary-dark">
                        Registration Summary
                      </p>
                      <div className="text-sm text-primary mt-2 space-y-1">
                        <p><strong>PSIC Code:</strong> {formData.line_of_business || 'Not specified'}</p>
                        <p><strong>RDO Code:</strong> {formData.rdo_code || 'Not specified'}</p>
                        <p><strong>Start Date:</strong> {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.947c-1.37-.559-2.914.371-2.355 1.742A1.532 1.532 0 016 8.05v4.118c0 .621.504 1.125 1.125 1.125h.81c.621 0 1.125-.504 1.125-1.125V8.05a1.532 1.532 0 011.494-1.49c.947 0 1.621-.814 1.494-1.743a1.532 1.532 0 012.286-.947c1.37.559 2.914-.371 2.355-1.742zM10 13a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
                  </svg>
                </div>
                Advanced Settings
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                These settings are optional. You can skip this step if you're unsure.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fy-start" className="block text-sm font-semibold text-gray-700 mb-2">
                      Fiscal Year Start
                    </label>
                    <input
                      id="fy-start"
                      type="date"
                      value={formData.fy_start}
                      onChange={(e) => updateFormData('fy_start', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      aria-label="Fiscal Year Start"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Leave blank for default</p>
                  </div>
                  <div>
                    <label htmlFor="fy-end" className="block text-sm font-semibold text-gray-700 mb-2">
                      Fiscal Year End
                    </label>
                    <input
                      id="fy-end"
                      type="date"
                      value={formData.fy_end}
                      onChange={(e) => updateFormData('fy_end', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                      aria-label="Fiscal Year End"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Leave blank for default</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="accounting-method" className="block text-sm font-semibold text-gray-700 mb-3">
                    Accounting Method
                  </label>
                  <select
                    id="accounting-method"
                    value={formData.accounting_method}
                    onChange={(e) => updateFormData('accounting_method', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white"
                    aria-label="Accounting Method"
                  >
                    <option value="">Select accounting method</option>
                    <option value="ACCRUAL">Accrual</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHERS">Others</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Optional: Choose your preferred accounting method</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Business Characteristics</h4>
                  <div className="space-y-3">
                    <label htmlFor="has-foreign" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        id="has-foreign"
                        type="checkbox"
                        checked={formData.has_foreign}
                        onChange={(e) => updateFormData('has_foreign', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Has foreign transactions</span>
                        <p className="text-xs text-gray-500">Business deals with international trade</p>
                      </div>
                    </label>

                    <label htmlFor="has-employees" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        id="has-employees"
                        type="checkbox"
                        checked={formData.has_employees}
                        onChange={(e) => updateFormData('has_employees', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Has employees</span>
                        <p className="text-xs text-gray-500">Business has paid employees</p>
                      </div>
                    </label>

                    <label htmlFor="is-ewt" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        id="is-ewt"
                        type="checkbox"
                        checked={formData.is_ewt}
                        onChange={(e) => updateFormData('is_ewt', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Expanded withholding tax</span>
                        <p className="text-xs text-gray-500">Subject to expanded withholding tax requirements</p>
                      </div>
                    </label>

                    <label htmlFor="is-fwt" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        id="is-fwt"
                        type="checkbox"
                        checked={formData.is_fwt}
                        onChange={(e) => updateFormData('is_fwt', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Final withholding tax</span>
                        <p className="text-xs text-gray-500">Subject to final withholding tax requirements</p>
                      </div>
                    </label>

                    <label htmlFor="is-bir-withholding-agent" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        id="is-bir-withholding-agent"
                        type="checkbox"
                        checked={formData.is_bir_withholding_agent}
                        onChange={(e) => updateFormData('is_bir_withholding_agent', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">BIR withholding agent</span>
                        <p className="text-xs text-gray-500">Registered as a BIR withholding agent</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const validateRegistrationDate = (date: string): boolean => {
    if (!date) return false
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate <= today && !isNaN(selectedDate.getTime())
  }

  const validateTIN = (tin: string): boolean => {
    if (!tin) return false
    const tinRegex = /^\d{9}(\d{3})?$/
    return tinRegex.test(tin)
  }

  const validateRDOCode = (rdoCode: string): boolean => {
    if (!rdoCode) return false
    const rdoRegex = /^\d{3}$/
    return rdoRegex.test(rdoCode)
  }

  const validateName = (name: string): boolean => {
    if (!name || name.trim() === '') return false
    const nameRegex = /^[a-zA-Z\s\-.&,]+$/
    return nameRegex.test(name.trim())
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.tax_classification
      case 2:
        return formData.tin && formData.registration_date &&
               validateTIN(formData.tin) && validateRegistrationDate(formData.registration_date)
      case 3:
        if (formData.category === 'INDIVIDUAL') {
          return formData.first_name && formData.last_name &&
                 validateName(formData.first_name) && validateName(formData.last_name)
        } else {
          return formData.registered_name && validateName(formData.registered_name)
        }
      case 4:
        return formData.address_line && formData.city && formData.region &&
               formData.zip_code && formData.contact_number && formData.email_address
      case 5:
        return formData.line_of_business && formData.rdo_code && formData.start_date &&
               validateRDOCode(formData.rdo_code)
      case 6:
        return true // Optional step
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Prepare basic organization creation data
      const createData: CreateOrganizationRequestDto = {
        category: formData.category as 'INDIVIDUAL' | 'NON_INDIVIDUAL',
        tax_classification: formData.tax_classification as 'VAT' | 'NON_VAT' | 'EXCEMPT',
        tin: formData.tin,
        registration_date: formData.registration_date,
        line_of_business: formData.line_of_business,
        address_line: formData.address_line,
        region: formData.region,
        city: formData.city,
        zip_code: formData.zip_code,
        rdo_code: formData.rdo_code,
        contact_number: formData.contact_number,
        email_address: formData.email_address,
        start_date: formData.start_date
      }

      // Add conditional fields based on category
      if (formData.category === 'INDIVIDUAL') {
        createData.first_name = formData.first_name
        createData.last_name = formData.last_name
        if (formData.middle_name) createData.middle_name = formData.middle_name
      } else {
        createData.registered_name = formData.registered_name
        if (formData.trade_name) createData.trade_name = formData.trade_name
      }

      // Add optional subcategory
      if (formData.subcategory) createData.subcategory = formData.subcategory as 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'

      // Create the organization first
      const result = await OrganizationService.createOrganization(createData)

      // If advanced settings are provided, update organization operation
      const hasAdvancedSettings = formData.fy_start || formData.fy_end || formData.accounting_method ||
                                  formData.has_foreign !== undefined || formData.has_employees !== undefined ||
                                  formData.is_ewt !== undefined || formData.is_fwt !== undefined ||
                                  formData.is_bir_withholding_agent !== undefined

      if (hasAdvancedSettings) {
        const operationData: UpdateOrganizationOperationRequestDto = {}
        if (formData.fy_start) operationData.fy_start = formData.fy_start
        if (formData.fy_end) operationData.fy_end = formData.fy_end
        if (formData.accounting_method) operationData.accounting_method = formData.accounting_method as 'ACCRUAL' | 'CASH' | 'OTHERS'
        if (formData.has_foreign !== undefined) operationData.has_foreign = formData.has_foreign
        if (formData.has_employees !== undefined) operationData.has_employees = formData.has_employees
        if (formData.is_ewt !== undefined) operationData.is_ewt = formData.is_ewt
        if (formData.is_fwt !== undefined) operationData.is_fwt = formData.is_fwt
        if (formData.is_bir_withholding_agent !== undefined) operationData.is_bir_withholding_agent = formData.is_bir_withholding_agent

        await OrganizationService.updateOrganizationOperation(result.id, operationData)
      }
      
      // Clear autosave data after successful submission
      localStorage.removeItem('organizationCreationDraft')
      
      onSuccess(result)
    } catch (error) {
      // Check if it's a 401 error (session expired)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusCode = (error as any)?.response?.status
      if (statusCode === 401) {
        // Redirect to login page with session expired parameter
        navigate('/auth/login?e=login-expired')
        return
      }
      
      // For other errors, keep modal open for user to retry
      console.error('Failed to create organization:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm">
      {/* Backdrop */}
      <div className="fixed inset-0" aria-hidden="true"></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-10 border border-gray-200" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-gradient-to-br from-white to-gray-50 px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-2">Create New Organization</h2>
                <p className="text-sm text-gray-600">Fill out the information below to create your organization</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</p>
                <div className="text-xs text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {renderStepIndicator()}

            <div className="min-h-[450px] bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
              {renderStepContent()}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200">
            {currentStep === totalSteps ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary w-full inline-flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="btn-primary w-full inline-flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 sm:ml-3 sm:w-auto"
              >
                Next Step
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="mt-3 w-full inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 sm:mt-0 sm:ml-3 sm:w-auto"
              >
                <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 sm:mt-0 sm:ml-3 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
