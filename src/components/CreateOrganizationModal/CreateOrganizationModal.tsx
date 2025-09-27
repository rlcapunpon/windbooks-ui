import React, { useState } from 'react'
import { OrganizationService } from '../../services/organizationService'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: any) => Promise<void> | void
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Organization Type
    category: '',
    subcategory: '',
    tax_classification: '',

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

  if (!isOpen) return null

  const totalSteps = 6

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 h-0.5 ${
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Type</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Category *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="INDIVIDUAL"
                        checked={formData.category === 'INDIVIDUAL'}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className="mr-2"
                        aria-label="Individual"
                      />
                      <span className="text-sm">Individual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="NON_INDIVIDUAL"
                        checked={formData.category === 'NON_INDIVIDUAL'}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className="mr-2"
                        aria-label="Non-Individual"
                      />
                      <span className="text-sm">Non-Individual</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Classification *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tax_classification"
                        value="VAT"
                        checked={formData.tax_classification === 'VAT'}
                        onChange={(e) => updateFormData('tax_classification', e.target.value)}
                        className="mr-2"
                        aria-label="VAT"
                      />
                      <span className="text-sm">VAT</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tax_classification"
                        value="NON_VAT"
                        checked={formData.tax_classification === 'NON_VAT'}
                        onChange={(e) => updateFormData('tax_classification', e.target.value)}
                        className="mr-2"
                        aria-label="Non-VAT"
                      />
                      <span className="text-sm">Non-VAT</span>
                    </label>
                  </div>
                </div>

                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => updateFormData('subcategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Subcategory"
                    >
                      <option value="">Select subcategory</option>
                      {formData.category === 'INDIVIDUAL' ? (
                        <>
                          <option value="SELF_EMPLOYED">Self Employed</option>
                          <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                          <option value="FREELANCER">Freelancer</option>
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
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Organization Information</h3>
              <div className="space-y-4">
                {formData.category === 'NON_INDIVIDUAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registered Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.registered_name}
                      onChange={(e) => updateFormData('registered_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter registered business name"
                      aria-label="Registered Business Name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Identification Number (TIN) *
                  </label>
                  <input
                    type="text"
                    value={formData.tin}
                    onChange={(e) => updateFormData('tin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="XXX-XXX-XXX-XXX"
                    maxLength={15}
                    aria-label="Tax Identification Number (TIN) *"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date *
                  </label>
                  <input
                    type="date"
                    value={formData.registration_date}
                    onChange={(e) => updateFormData('registration_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Registration Date *"
                  />
                </div>

                {getOrganizationNamePreview() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Organization will be named:</strong> {getOrganizationNamePreview()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Registrant Information</h3>
              <div className="space-y-4">
                {formData.category === 'INDIVIDUAL' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => updateFormData('first_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter first name"
                          aria-label="First Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          value={formData.middle_name}
                          onChange={(e) => updateFormData('middle_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter middle name"
                          aria-label="Middle Name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => updateFormData('last_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter last name"
                        aria-label="Last Name"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registered Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.registered_name}
                        onChange={(e) => updateFormData('registered_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter registered business name"
                        aria-label="Registered Business Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trade Name
                      </label>
                      <input
                        type="text"
                        value={formData.trade_name}
                        onChange={(e) => updateFormData('trade_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter trade name (optional)"
                      />
                    </div>
                  </>
                )}

                {getOrganizationNamePreview() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Organization will be named:</strong> {getOrganizationNamePreview()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Upload Image (Optional)"
                  />
                  {uploadedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address & Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line *
                  </label>
                  <input
                    type="text"
                    value={formData.address_line}
                    onChange={(e) => updateFormData('address_line', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => updateFormData('region', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select region</option>
                      <option value="NCR">National Capital Region</option>
                      <option value="Region I">Ilocos Region</option>
                      <option value="Region II">Cagayan Valley</option>
                      <option value="Region III">Central Luzon</option>
                      <option value="Region IV-A">CALABARZON</option>
                      <option value="Region IV-B">MIMAROPA</option>
                      <option value="Region V">Bicol Region</option>
                      <option value="Region VI">Western Visayas</option>
                      <option value="Region VII">Central Visayas</option>
                      <option value="Region VIII">Eastern Visayas</option>
                      <option value="Region IX">Zamboanga Peninsula</option>
                      <option value="Region X">Northern Mindanao</option>
                      <option value="Region XI">Davao Region</option>
                      <option value="Region XII">SOCCSKSARGEN</option>
                      <option value="Region XIII">Caraga</option>
                      <option value="BARMM">Bangsamoro Autonomous Region</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => updateFormData('zip_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ZIP code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_number}
                      onChange={(e) => updateFormData('contact_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+63XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email_address}
                      onChange={(e) => updateFormData('email_address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Registration Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="line-of-business" className="block text-sm font-medium text-gray-700 mb-1">
                    Line of Business (PSIC Code) *
                  </label>
                  <input
                    id="line-of-business"
                    type="text"
                    value={formData.line_of_business}
                    onChange={(e) => updateFormData('line_of_business', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PSIC code"
                  />
                </div>

                <div>
                  <label htmlFor="rdo-code" className="block text-sm font-medium text-gray-700 mb-1">
                    RDO Code *
                  </label>
                  <input
                    id="rdo-code"
                    type="text"
                    value={formData.rdo_code}
                    onChange={(e) => updateFormData('rdo_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="RDO code"
                    maxLength={3}
                  />
                </div>

                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateFormData('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                These settings are optional. You can skip this step if you're unsure.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fy-start" className="block text-sm font-medium text-gray-700 mb-1">
                      Fiscal Year Start
                    </label>
                    <input
                      id="fy-start"
                      type="date"
                      value={formData.fy_start}
                      onChange={(e) => updateFormData('fy_start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="fy-end" className="block text-sm font-medium text-gray-700 mb-1">
                      Fiscal Year End
                    </label>
                    <input
                      id="fy-end"
                      type="date"
                      value={formData.fy_end}
                      onChange={(e) => updateFormData('fy_end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.has_foreign}
                      onChange={(e) => updateFormData('has_foreign', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Has foreign transactions</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.has_employees}
                      onChange={(e) => updateFormData('has_employees', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Has employees</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_ewt}
                      onChange={(e) => updateFormData('is_ewt', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Expanded withholding tax</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_fwt}
                      onChange={(e) => updateFormData('is_fwt', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Final withholding tax</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_bir_withholding_agent}
                      onChange={(e) => updateFormData('is_bir_withholding_agent', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">BIR withholding agent</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="accounting-method" className="block text-sm font-medium text-gray-700 mb-1">
                    Accounting Method
                  </label>
                  <select
                    id="accounting-method"
                    value={formData.accounting_method}
                    onChange={(e) => updateFormData('accounting_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select accounting method</option>
                    <option value="ACCRUAL">Accrual</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.tax_classification
      case 2:
        return formData.tin && formData.registration_date &&
               (formData.category === 'INDIVIDUAL' || formData.registered_name)
      case 3:
        if (formData.category === 'INDIVIDUAL') {
          return formData.first_name && formData.last_name
        } else {
          return formData.registered_name
        }
      case 4:
        return formData.address_line && formData.city && formData.region &&
               formData.zip_code && formData.contact_number && formData.email_address
      case 5:
        return formData.line_of_business && formData.rdo_code && formData.start_date
      case 6:
        return true // Optional step
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Build full address from components
      const addressParts = [formData.address_line, formData.city, formData.region].filter(Boolean)
      const fullAddress = addressParts.length > 0 
        ? `${addressParts.join(', ')} ${formData.zip_code}`.trim()
        : formData.zip_code

      // Transform form data to match API requirements
      const submitData: any = {
        name: getOrganizationNamePreview(),
        category: formData.category as 'INDIVIDUAL' | 'NON_INDIVIDUAL',
        tax_classification: formData.tax_classification as 'VAT' | 'NON_VAT',
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        middle_name: formData.middle_name || '',
        line_of_business: formData.line_of_business,
        address: fullAddress,
        address_line: formData.address_line,
        region: formData.region,
        city: formData.city,
        zip_code: formData.zip_code,
        tin: formData.tin,
        tin_registration: formData.tin,
        rdo_code: formData.rdo_code,
        contact_number: formData.contact_number,
        email_address: formData.email_address,
        tax_type: formData.tax_classification,
        start_date: formData.start_date,
        reg_date: formData.registration_date,
        registration_date: formData.registration_date,
        subcategory: formData.subcategory || '',
        trade_name: formData.trade_name || '',
        // Advanced settings
        fy_start: formData.fy_start || '',
        fy_end: formData.fy_end || '',
        accounting_method: formData.accounting_method || '',
        has_foreign: formData.has_foreign || false,
        has_employees: formData.has_employees || false,
        is_ewt: formData.is_ewt || false,
        is_fwt: formData.is_fwt || false,
        is_bir_withholding_agent: formData.is_bir_withholding_agent || false
      }

      const result = await OrganizationService.createOrganization(submitData)
      onSuccess(result)
    } catch (error) {
      // Error is handled by the component - modal remains open for user to retry
      console.error('Failed to create organization:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">Create New Organization</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>

            {renderStepIndicator()}

            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {currentStep === totalSteps ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? 'Creating...' : 'Create Organization'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
              >
                Next
              </button>
            )}

            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}