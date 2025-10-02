import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrganizationService } from '../../services/organizationService'
import { UserService } from '../../services/userService'
import type { Organization, OrganizationStatus, OrganizationRegistration } from '../../services/organizationService'
import { UpdateOrganizationStatusModal, type UpdateStatusFormData } from '../../components/UpdateOrganizationStatusModal'
import { UpdateOrganizationOperationsModal, type UpdateOperationFormData } from '../../components/UpdateOrganizationOperationsModal/UpdateOrganizationOperationsModal'
import { UpdateOrganizationRegistrationModal, type UpdateRegistrationFormData } from '../../components/UpdateOrganizationRegistrationModal/UpdateOrganizationRegistrationModal'
import { canEditOrganizationStatus, canEditOrganizationRegistration } from '../../utils/organizationPermissions'

type MenuItem = 'details' | 'contacts' | 'obligations' | 'books' | 'employees' | 'history' | 'settings'

// Helper functions
const formatDateMMMYYYY = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatCutOff = (cutOffs: string[]) => {
  return cutOffs.map(cutOff => {
    if (cutOff.includes('/')) {
      return cutOff.split('/').map(day => `${day}th`).join(' and ')
    } else {
      return `${cutOff}th`
    }
  }).join(' and ')
}

const formatTaxType = (taxType: string) => {
  switch (taxType) {
    case 'VAT':
      return 'VAT'
    case 'NON_VAT':
      return 'Percentage Tax'
    case 'EXCEMPT':
      return 'Tax Excempted'
    default:
      return taxType
  }
}

const formatOrganizationHeader = (organization: Organization) => {
  const name = organization.name
  const category = organization.category
  const subcategory = organization.subcategory
  const taxClassification = organization.tax_classification

  return (
    <span className="flex items-center gap-2 flex-wrap">
      <span>{name}</span>
      {category && (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
          {category}
        </span>
      )}
      {subcategory && (
        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 border border-blue-200 rounded-md">
          {subcategory}
        </span>
      )}
      {taxClassification && (
        <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white border border-blue-700 rounded-md">
          {taxClassification}
        </span>
      )}
    </span>
  )
}

const OrganizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [organizationStatus, setOrganizationStatus] = useState<OrganizationStatus | null>(null)
  const [organizationOperation, setOrganizationOperation] = useState<any | null>(null)
  const [organizationRegistration, setOrganizationRegistration] = useState<OrganizationRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<MenuItem>('details')

  useEffect(() => {
    if (id) {
      loadOrganization(id)
    }
  }, [id])

  const loadOrganization = async (orgId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Call all 4 endpoints in parallel
      const [orgResult, statusResult, operationResult, registrationResult] = await Promise.allSettled([
        OrganizationService.getOrganizationById(orgId),
        OrganizationService.getOrganizationStatus(orgId),
        OrganizationService.getOrganizationOperation(orgId),
        OrganizationService.getOrganizationRegistration(orgId)
      ])

      // Handle organization data
      if (orgResult.status === 'fulfilled') {
        setOrganization(orgResult.value)
      } else {
        console.error('Failed to load organization:', orgResult.reason)
        setError('Failed to load organization details')
        return
      }

      // Handle status data (optional - don't fail if this fails)
      if (statusResult.status === 'fulfilled') {
        setOrganizationStatus(statusResult.value)
      } else {
        console.warn('Failed to load organization status:', statusResult.reason)
      }

      // Handle operation data (optional - don't fail if this fails)
      if (operationResult.status === 'fulfilled') {
        setOrganizationOperation(operationResult.value)
      } else {
        console.warn('Failed to load organization operation:', operationResult.reason)
      }

      // Handle registration data (optional - don't fail if this fails)
      if (registrationResult.status === 'fulfilled') {
        setOrganizationRegistration(registrationResult.value)
      } else {
        console.warn('Failed to load organization registration:', registrationResult.reason)
      }

    } catch (err) {
      console.error('Failed to load organization:', err)
      setError('Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'details' as MenuItem, label: 'Organization Details', icon: '📋' },
    { id: 'contacts' as MenuItem, label: 'Contacts', icon: '👥' },
    { id: 'obligations' as MenuItem, label: 'Tax Obligations', icon: '📊' },
    { id: 'books' as MenuItem, label: 'Books', icon: '📚' },
    { id: 'employees' as MenuItem, label: 'Employees', icon: '👷' },
    { id: 'history' as MenuItem, label: 'History', icon: '📅' },
    { id: 'settings' as MenuItem, label: 'Settings', icon: '⚙️' }
  ]

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading organization...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organization</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/organizations/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Organizations
          </button>
        </div>
      )
    }

    if (!organization) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Organization not found</p>
        </div>
      )
    }

    switch (activeMenu) {
      case 'details':
        return (
          <OrganizationDetails
            organization={organization}
            organizationStatus={organizationStatus}
            organizationOperation={organizationOperation}
            organizationRegistration={organizationRegistration}
            onStatusUpdate={setOrganizationStatus}
            onOperationUpdate={setOrganizationOperation}
            onRegistrationUpdate={setOrganizationRegistration}
          />
        )
      case 'contacts':
        return <Contacts organization={organization} />
      case 'obligations':
        return <TaxObligations organization={organization} />
      case 'books':
        return <Books organization={organization} />
      case 'employees':
        return <Employees organization={organization} />
      case 'history':
        return <History organization={organization} />
      case 'settings':
        return <Settings organization={organization} />
      default:
        return (
          <OrganizationDetails
            organization={organization}
            organizationStatus={organizationStatus}
            organizationOperation={organizationOperation}
            organizationRegistration={organizationRegistration}
            onStatusUpdate={setOrganizationStatus}
            onOperationUpdate={setOrganizationOperation}
            onRegistrationUpdate={setOrganizationRegistration}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/organizations/dashboard')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Organizations
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-md"
              aria-label="Refresh page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {organization ? formatOrganizationHeader(organization) : 'Organization'}
          </h1>
          {organization?.tin && (
            <p className="text-lg text-gray-600 mt-2">
              TIN: {organization.tin}
            </p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Menu */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {menuItems
                .filter(item => item.id !== 'employees' || organizationOperation?.has_employees === true)
                .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeMenu === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for each menu section
const OrganizationDetails: React.FC<{
  organization: Organization
  organizationStatus: OrganizationStatus | null
  organizationOperation: any | null
  organizationRegistration: OrganizationRegistration | null
  onStatusUpdate: (status: OrganizationStatus) => void
  onOperationUpdate: (operation: any) => void
  onRegistrationUpdate: (registration: OrganizationRegistration) => void
}> = ({ organization, organizationStatus, organizationOperation, organizationRegistration, onStatusUpdate, onOperationUpdate, onRegistrationUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'operation' | 'bir'>('general')
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [canEditStatus, setCanEditStatus] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [isOperationsModalOpen, setIsOperationsModalOpen] = useState(false)
  const [canEditOperations, setCanEditOperations] = useState(false)
  const [operationsUpdateLoading, setOperationsUpdateLoading] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [canEditRegistration, setCanEditRegistration] = useState(false)
  const [registrationUpdateLoading, setRegistrationUpdateLoading] = useState(false)

  // Check edit permissions on component mount and when organization changes
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Ensure user data is loaded
        if (!UserService.hasUserData()) {
          await UserService.fetchAndStoreUserData()
        }

        const statusPermission = await canEditOrganizationStatus(organization.id)
        const registrationPermission = await canEditOrganizationRegistration(organization.id)
        setCanEditStatus(statusPermission)
        setCanEditOperations(statusPermission) // Operations uses same permission as status
        setCanEditRegistration(registrationPermission)
      } catch (error) {
        console.error('Failed to check edit permissions:', error)
        setCanEditStatus(false)
        setCanEditOperations(false)
        setCanEditRegistration(false)
      }
    }

    checkPermissions()
  }, [organization.id])

  const handleEditStatusClick = () => {
    if (canEditStatus) {
      setIsStatusModalOpen(true)
    }
  }

  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false)
  }

  const handleStatusSave = async (formData: UpdateStatusFormData) => {
    try {
      setStatusUpdateLoading(true)
      // Convert form data to the correct API type
      const requestData = {
        status: formData.status as any, // Type assertion needed due to string vs enum
        reason: formData.reason as any,
        description: formData.description || undefined
      }
      const updatedStatus = await OrganizationService.updateOrganizationStatus(organization.id, requestData)
      onStatusUpdate(updatedStatus)
      setIsStatusModalOpen(false)
    } catch (error) {
      console.error('Failed to update organization status:', error)
      // TODO: Show error message to user
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleEditOperationsClick = () => {
    if (canEditOperations) {
      setIsOperationsModalOpen(true)
    }
  }

  const handleOperationsModalClose = () => {
    setIsOperationsModalOpen(false)
  }

  const handleOperationsSave = async (formData: UpdateOperationFormData) => {
    try {
      setOperationsUpdateLoading(true)
      // Convert form data to the correct API type
      const requestData = {
        fy_start: formData.fy_start || undefined,
        fy_end: formData.fy_end || undefined,
        vat_reg_effectivity: formData.vat_reg_effectivity || undefined,
        registration_effectivity: formData.registration_effectivity || undefined,
        payroll_cut_off: formData.payroll_cut_off,
        payment_cut_off: formData.payment_cut_off,
        quarter_closing: formData.quarter_closing,
        has_foreign: formData.has_foreign,
        has_employees: formData.has_employees,
        is_ewt: formData.is_ewt,
        is_fwt: formData.is_fwt,
        is_bir_withholding_agent: formData.is_bir_withholding_agent,
        accounting_method: formData.accounting_method as 'ACCRUAL' | 'CASH' | 'OTHERS' | undefined
      }
      const updatedOperation = await OrganizationService.updateOrganizationOperation(organization.id, requestData)
      onOperationUpdate(updatedOperation)
      setIsOperationsModalOpen(false)
    } catch (error) {
      console.error('Failed to update organization operation:', error)
      // TODO: Show error message to user
    } finally {
      setOperationsUpdateLoading(false)
    }
  }

  const handleEditRegistrationClick = () => {
    if (canEditRegistration) {
      setIsRegistrationModalOpen(true)
    }
  }

  const handleRegistrationModalClose = () => {
    setIsRegistrationModalOpen(false)
  }

  const handleRegistrationSave = async (formData: UpdateRegistrationFormData) => {
    try {
      setRegistrationUpdateLoading(true)
      // Convert form data to the correct API type
      const requestData = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name,
        trade_name: formData.trade_name || undefined,
        line_of_business: formData.line_of_business,
        address_line: formData.address_line,
        region: formData.region,
        city: formData.city,
        zip_code: formData.zip_code,
        tin: formData.tin,
        rdo_code: formData.rdo_code,
        contact_number: formData.contact_number,
        email_address: formData.email_address,
        tax_type: formData.tax_type as 'VAT' | 'NON_VAT' | 'EXCEMPT',
        start_date: formData.start_date,
        reg_date: formData.reg_date
      }
      const updatedRegistration = await OrganizationService.updateOrganizationRegistration(organization.id, requestData)
      onRegistrationUpdate(updatedRegistration)
      setIsRegistrationModalOpen(false)
      // Reload the page after successful update
      window.location.reload()
    } catch (error) {
      console.error('Failed to update organization registration:', error)
      // TODO: Show error message to user
    } finally {
      setRegistrationUpdateLoading(false)
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '📋' },
    { id: 'operation' as const, label: 'Operations', icon: '⚙️' },
    { id: 'bir' as const, label: 'BIR Registration', icon: '📄' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Business Status - First */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Business Status</h3>
                {canEditStatus && (
                  <button 
                    onClick={handleEditStatusClick}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    aria-label="Edit Business Status"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {/* Status Badge */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    organizationStatus?.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200' :
                    organizationStatus?.status === 'PENDING_REG' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    organizationStatus?.status === 'REGISTERED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    organizationStatus?.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                    organizationStatus?.status === 'CESSATION' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    organizationStatus?.status === 'CLOSED' ? 'bg-red-100 text-red-800 border border-red-200' :
                    organizationStatus?.status === 'NON_COMPLIANT' ? 'bg-red-100 text-red-800 border border-red-200' :
                    organizationStatus?.status === 'UNDER_AUDIT' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    organizationStatus?.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {organizationStatus?.status || 'Not available'}
                  </span>
                </div>

                {/* Approval Button or Pending Message for PENDING_REG */}
                {organizationStatus?.status === 'PENDING_REG' && (
                  <div>
                    {(UserService.hasRole('APPROVER') || UserService.isSuperAdmin()) ? (
                      <button
                        onClick={async () => {
                          try {
                            const updatedStatus = await OrganizationService.updateOrganizationStatus(organization.id, {
                              status: 'REGISTERED',
                              reason: 'APPROVED',
                              description: 'Registration to Windbooks approved.'
                            })
                            // Update the local state via the callback
                            onStatusUpdate(updatedStatus)
                          } catch (error) {
                            console.error('Failed to approve organization:', error)
                            // TODO: Show error message to user
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Approve Registration
                      </button>
                    ) : (
                      <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        Ask ADMIN or APPROVER to approve application to Windbooks.
                      </p>
                    )}
                  </div>
                )}

                {/* Additional Status Details */}
                {organizationStatus?.reason && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reason</dt>
                    <dd className="text-sm text-gray-900 mt-1">{organizationStatus.reason}</dd>
                  </div>
                )}
                {organizationStatus?.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900 mt-1">{organizationStatus.description}</dd>
                  </div>
                )}
                {organizationStatus?.last_update && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Update</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {new Date(organizationStatus.last_update).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information - Second */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <button 
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  aria-label="Edit Basic Information"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <table className="w-full border border-gray-100">
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Name</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organization.name}</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Category</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organization.category}</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Sub-category</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organization.subcategory || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Tax Classification</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organization.tax_classification}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'operation':
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Operation Details</h3>
              {canEditOperations && (
                <button 
                  onClick={handleEditOperationsClick}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  aria-label="Edit Operation Details"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            <table className="w-full border border-gray-100">
              <tbody>
                {organizationOperation?.fy_start && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Fiscal Year Start</td>
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {formatDateMMMYYYY(organizationOperation.fy_start)}
                    </td>
                  </tr>
                )}
                {organizationOperation?.fy_end && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Fiscal Year End</td>
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {formatDateMMMYYYY(organizationOperation.fy_end)}
                    </td>
                  </tr>
                )}
                {organizationOperation?.accounting_method && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Accounting Method</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.accounting_method}</td>
                  </tr>
                )}
                {organizationOperation?.payroll_cut_off && organizationOperation.payroll_cut_off.length > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Payroll Cut-off</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{formatCutOff(organizationOperation.payroll_cut_off)}</td>
                  </tr>
                )}
                {organizationOperation?.payment_cut_off && organizationOperation.payment_cut_off.length > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Payment Cut-off</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{formatCutOff(organizationOperation.payment_cut_off)}</td>
                  </tr>
                )}
                {organizationOperation?.quarter_closing && organizationOperation.quarter_closing.length > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Quarter Closing</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.quarter_closing.join(', ')}</td>
                  </tr>
                )}
                {organizationOperation?.has_employees !== undefined && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Has Employees</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.has_employees ? 'Yes' : 'No'}</td>
                  </tr>
                )}
                {organizationOperation?.is_ewt !== undefined && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Expanded Withholding Tax (EWT)</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.is_ewt ? 'Yes' : 'No'}</td>
                  </tr>
                )}
                {organizationOperation?.is_fwt !== undefined && (
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Final Withholding Tax (FWT)</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.is_fwt ? 'Yes' : 'No'}</td>
                  </tr>
                )}
                {organizationOperation?.is_bir_withholding_agent !== undefined && (
                  <tr>
                    <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Withholding Agent</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{organizationOperation.is_bir_withholding_agent ? 'Yes' : 'No'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      case 'bir':
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Registration Information</h3>
              {canEditRegistration && (
                <button 
                  onClick={handleEditRegistrationClick}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  aria-label="Edit Registration Information"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
              )}
            </div>
            <table className="w-full border border-gray-100">
              <tbody>
                {organizationRegistration && (
                  <>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Tax Classification</td>
                      <td className="py-2 px-3 text-sm text-gray-900">{formatTaxType(organizationRegistration.tax_type)}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Name</td>
                      <td className="py-2 px-3 text-sm text-gray-900">
                        {organizationRegistration.first_name} {organizationRegistration.middle_name} {organizationRegistration.last_name}
                      </td>
                    </tr>
                    {organizationRegistration.trade_name && (
                      <tr className="border-b border-gray-50">
                        <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Trade Name</td>
                        <td className="py-2 px-3 text-sm text-gray-900">{organizationRegistration.trade_name}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-50">
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Line of Business</td>
                      <td className="py-2 px-3 text-sm text-gray-900">{organizationRegistration.line_of_business}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Address</td>
                      <td className="py-2 px-3 text-sm text-gray-900">
                        {organizationRegistration.address_line}, {organizationRegistration.city}, {organizationRegistration.region} {organizationRegistration.zip_code}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Contact</td>
                      <td className="py-2 px-3 text-sm text-gray-900">{organizationRegistration.contact_number}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sm font-medium text-gray-500 bg-gray-25 border-r border-gray-100">Email</td>
                      <td className="py-2 px-3 text-sm text-gray-900">{organizationRegistration.email_address}</td>
                    </tr>
                  </>
                )}
                {!organizationRegistration && (
                  <tr>
                    <td className="py-2 px-3 text-sm text-gray-500" colSpan={2}>Registration details not available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Status Update Modal */}
      <UpdateOrganizationStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        onSave={handleStatusSave}
        currentStatus={organizationStatus || {
          id: '',
          organization_id: organization.id,
          status: 'PENDING_REG',
          last_update: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }}
        loading={statusUpdateLoading}
      />

      {/* Operations Update Modal */}
      <UpdateOrganizationOperationsModal
        isOpen={isOperationsModalOpen}
        onClose={handleOperationsModalClose}
        onSave={handleOperationsSave}
        currentOperation={organizationOperation}
        loading={operationsUpdateLoading}
      />

      {/* Registration Update Modal */}
      <UpdateOrganizationRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={handleRegistrationModalClose}
        onSave={handleRegistrationSave}
        currentRegistration={organizationRegistration}
        loading={registrationUpdateLoading}
      />
    </div>
  )
}

const Contacts: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Contacts</h2>
    <p className="text-gray-600">Contact management functionality coming soon.</p>
  </div>
)

const TaxObligations: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Tax Obligations</h2>
    <p className="text-gray-600">Tax obligations functionality coming soon.</p>
  </div>
)

const Books: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Books</h2>
    <p className="text-gray-600">Books management functionality coming soon.</p>
  </div>
)

const Employees: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Employees</h2>
    <p className="text-gray-600">Employee management functionality coming soon.</p>
  </div>
)

const History: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">History</h2>
    <p className="text-gray-600">Organization history functionality coming soon.</p>
  </div>
)

const Settings: React.FC<{ organization: Organization }> = ({ organization: _organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Settings</h2>
    <p className="text-gray-600">Organization settings functionality coming soon.</p>
  </div>
)

export default OrganizationPage