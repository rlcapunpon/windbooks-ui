import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrganizationService } from '../../services/organizationService'
import { UserService } from '../../services/userService'
import type { Organization, OrganizationStatus, OrganizationRegistration } from '../../services/organizationService'

type MenuItem = 'details' | 'contacts' | 'obligations' | 'history' | 'settings'

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
          />
        )
      case 'contacts':
        return <Contacts organization={organization} />
      case 'obligations':
        return <TaxObligations organization={organization} />
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
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/organizations/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Organizations
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {organization ? organization.name : 'Organization'}
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Menu */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {menuItems.map((item) => (
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
}> = ({ organization, organizationStatus, organizationOperation, organizationRegistration, onStatusUpdate }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-2">Basic Information</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="text-sm text-gray-900">{organization.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">TIN</dt>
            <dd className="text-sm text-gray-900">{organization.tin || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="text-sm text-gray-900">{organization.category}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tax Classification</dt>
            <dd className="text-sm text-gray-900">{organization.tax_classification}</dd>
          </div>
        </dl>
      </div>

      {/* Business Status */}
      <div>
        <h3 className="text-lg font-medium mb-2">Business Status</h3>
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

      {/* Operation Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">Operation Details</h3>
        <dl className="space-y-2">
          {organizationOperation?.fy_end && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Fiscal Year End</dt>
              <dd className="text-sm text-gray-900">
                {formatDateMMMYYYY(organizationOperation.fy_end)}
              </dd>
            </div>
          )}
          {organizationOperation?.accounting_method && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Accounting Method</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.accounting_method}</dd>
            </div>
          )}
          {organizationOperation?.payroll_cut_off && organizationOperation.payroll_cut_off.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Payroll Cut-off</dt>
              <dd className="text-sm text-gray-900">{formatCutOff(organizationOperation.payroll_cut_off)}</dd>
            </div>
          )}
          {organizationOperation?.payment_cut_off && organizationOperation.payment_cut_off.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Cut-off</dt>
              <dd className="text-sm text-gray-900">{formatCutOff(organizationOperation.payment_cut_off)}</dd>
            </div>
          )}
          {organizationOperation?.quarter_closing && organizationOperation.quarter_closing.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Quarter Closing</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.quarter_closing.join(', ')}</dd>
            </div>
          )}
          {organizationOperation?.has_employees !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Has Employees</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.has_employees ? 'Yes' : 'No'}</dd>
            </div>
          )}
          {organizationOperation?.is_ewt !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">EWT</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.is_ewt ? 'Yes' : 'No'}</dd>
            </div>
          )}
          {organizationOperation?.is_fwt !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">FWT</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.is_fwt ? 'Yes' : 'No'}</dd>
            </div>
          )}
          {organizationOperation?.is_bir_withholding_agent !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Withholding Agent</dt>
              <dd className="text-sm text-gray-900">{organizationOperation.is_bir_withholding_agent ? 'Yes' : 'No'}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Registration Information */}
      <div>
        <h3 className="text-lg font-medium mb-2">Registration Information</h3>
        <dl className="space-y-2">
          {organizationRegistration && (
            <>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax Classification</dt>
                <dd className="text-sm text-gray-900">{formatTaxType(organizationRegistration.tax_type)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">
                  {organizationRegistration.first_name} {organizationRegistration.middle_name} {organizationRegistration.last_name}
                </dd>
              </div>
              {organizationRegistration.trade_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Trade Name</dt>
                  <dd className="text-sm text-gray-900">{organizationRegistration.trade_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Line of Business</dt>
                <dd className="text-sm text-gray-900">{organizationRegistration.line_of_business}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">
                  {organizationRegistration.address_line}, {organizationRegistration.city}, {organizationRegistration.region} {organizationRegistration.zip_code}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="text-sm text-gray-900">{organizationRegistration.contact_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{organizationRegistration.email_address}</dd>
              </div>
            </>
          )}
          {!organizationRegistration && (
            <div>
              <dd className="text-sm text-gray-500">Registration details not available</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  </div>
)

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