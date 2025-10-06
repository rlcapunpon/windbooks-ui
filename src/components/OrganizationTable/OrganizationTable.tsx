import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserService } from '../../services/userService'
import { OrganizationService } from '../../services/organizationService'
import type { Organization } from '../../services/organizationService'

interface OrganizationTableProps {
  organizations: Organization[]
  loading: boolean
  onRefresh: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  loading,
  onRefresh,
  searchQuery = '',
  onSearchChange
}) => {
  const navigate = useNavigate()
  const [userRoles, setUserRoles] = useState<{ [resourceId: string]: string }>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch user roles for organizations
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (organizations.length === 0 || UserService.isSuperAdmin()) {
        // Don't fetch roles for SUPERADMIN users or when no organizations
        setUserRoles({})
        return
      }

      try {
        const resourceIds = organizations.map(org => org.id)
        const roles = await UserService.getUserRolesForResources(resourceIds)
        
        // Create a map of resourceId to roleName
        const roleMap: { [resourceId: string]: string } = {}
        roles.forEach(role => {
          roleMap[role.resourceId] = role.roleName
        })
        
        setUserRoles(roleMap)
      } catch (error) {
        console.error('Failed to fetch user roles:', error)
        // Set empty roles on error
        setUserRoles({})
      }
    }

    fetchUserRoles()
  }, [organizations])

  const handleDeleteClick = (organization: Organization) => {
    setOrganizationToDelete(organization)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!organizationToDelete) return

    setIsDeleting(true)
    try {
      // Delete organization and resource
      await Promise.all([
        OrganizationService.deleteOrganization(organizationToDelete.id),
        UserService.deleteResource(organizationToDelete.id)
      ])

      // Refresh the table
      onRefresh()
      setShowDeleteDialog(false)
      setOrganizationToDelete(null)
    } catch (error) {
      console.error('Failed to delete organization:', error)
      // TODO: Show error message to user
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setOrganizationToDelete(null)
  }
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-red-100 text-red-800'
      case 'PENDING_REG':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter((org) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      org.name.toLowerCase().includes(query) ||
      (org.tin && org.tin.toLowerCase().includes(query)) ||
      org.category.toLowerCase().includes(query) ||
      org.tax_classification.toLowerCase() === query ||
      (org.address && org.address.toLowerCase().includes(query)) ||
      (userRoles[org.id] && userRoles[org.id].toLowerCase().includes(query))
    )
  })

  if (loading && organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" data-testid="loading-spinner"></div>
        <p className="text-gray-600">Loading organizations...</p>
      </div>
    )
  }

  if (!loading && organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
        <p className="text-gray-600">Get started by creating your first organization.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Organizations ({filteredOrganizations.length}{searchQuery ? ` of ${organizations.length}` : ''})
          </h3>
          <div className="flex items-center space-x-4">
            {onSearchChange && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  data-testid="search-input"
                />
              </div>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" data-testid="organizations-table">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax Classification
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrganizations.map((organization) => (
              <tr key={organization.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {organization.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    TIN: {organization.tin}
                  </div>
                  <div className="text-sm text-gray-500">
                    {organization.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {UserService.isSuperAdmin() ? 'SUPERADMIN' : (userRoles[organization.id] || 'N/A')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {organization.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {organization.tax_classification}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {organization.status ? (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(organization.status.status)}`}>
                      {organization.status.status}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="text-primary hover:text-primary-dark"
                      onClick={() => navigate(`/organizations/${organization.id}`)}
                    >
                      View
                    </button>
                    {UserService.isSuperAdmin() && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(organization)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && organizations.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" data-testid="loading-spinner"></div>
            <span className="text-sm text-gray-600">Refreshing...</span>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        organization={organizationToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog: React.FC<{
  isOpen: boolean
  organization: Organization | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ isOpen, organization, isDeleting, onConfirm, onCancel }) => {
  if (!isOpen || !organization) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Confirm Delete</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-medium text-gray-900">"{organization.name}"</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. This will permanently delete the organization and all associated data.
            </p>
          </div>
          <div className="flex items-center px-4 py-3 space-x-4">
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}