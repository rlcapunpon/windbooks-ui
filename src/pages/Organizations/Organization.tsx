import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrganizationService } from '../../services/organizationService'
import type { Organization } from '../../services/organizationService'

type MenuItem = 'details' | 'contacts' | 'obligations' | 'history' | 'settings'

const OrganizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<Organization | null>(null)
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
      const orgData = await OrganizationService.getOrganizationById(orgId)
      setOrganization(orgData)
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
        return <OrganizationDetails organization={organization} />
      case 'contacts':
        return <Contacts organization={organization} />
      case 'obligations':
        return <TaxObligations organization={organization} />
      case 'history':
        return <History organization={organization} />
      case 'settings':
        return <Settings organization={organization} />
      default:
        return <OrganizationDetails organization={organization} />
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
const OrganizationDetails: React.FC<{ organization: Organization }> = ({ organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div>
        <h3 className="text-lg font-medium mb-2">Registration Information</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
            <dd className="text-sm text-gray-900">
              {organization.registration_date
                ? new Date(organization.registration_date).toLocaleDateString()
                : 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="text-sm text-gray-900">{organization.address || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900">
              {organization.status ? organization.status.status : 'Unknown'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
)

const Contacts: React.FC<{ organization: Organization }> = ({ organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Contacts</h2>
    <p className="text-gray-600">Contact management functionality coming soon.</p>
  </div>
)

const TaxObligations: React.FC<{ organization: Organization }> = ({ organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Tax Obligations</h2>
    <p className="text-gray-600">Tax obligations functionality coming soon.</p>
  </div>
)

const History: React.FC<{ organization: Organization }> = ({ organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">History</h2>
    <p className="text-gray-600">Organization history functionality coming soon.</p>
  </div>
)

const Settings: React.FC<{ organization: Organization }> = ({ organization }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Settings</h2>
    <p className="text-gray-600">Organization settings functionality coming soon.</p>
  </div>
)

export default OrganizationPage