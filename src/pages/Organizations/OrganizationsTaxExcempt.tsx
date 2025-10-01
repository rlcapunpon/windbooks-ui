import React, { useState, useEffect, useCallback } from 'react'
import { OrganizationService, type Organization } from '../../services/organizationService'
import { UserService } from '../../services/userService'
import { OrganizationTable } from '../../components/OrganizationTable/OrganizationTable'
import { CreateOrganizationButton } from '../../components/CreateOrganizationButton/CreateOrganizationButton'
import { CreateOrganizationModal } from '../../components/CreateOrganizationModal/CreateOrganizationModal'

const OrganizationsTaxExcempt: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await OrganizationService.getAllOrganizations({ tax_classification: 'EXCEMPT' })
      setOrganizations(data)
    } catch (err: any) {
      console.error('Failed to load Tax Excempt organizations:', err)
      setError('Failed to load Tax Excempt organizations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  const handleRefresh = () => {
    loadOrganizations()
  }

  const handleCreateOrganization = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
  }

  const handleCreateSuccess = async (_newOrganization: any) => {
    setIsCreateModalOpen(false)
    // Refresh the organizations list to show the newly created organization
    await loadOrganizations()
  }

  // Check if user has permission to create organizations
  const canCreateOrganization = UserService.hasPermission('resource:create') || UserService.isSuperAdmin()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Excempt Organizations</h1>
          <p className="text-gray-600 mt-1">Manage and monitor tax excempt organizations</p>
        </div>
        <CreateOrganizationButton hasCreatePermission={canCreateOrganization} onCreate={handleCreateOrganization} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Organizations Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <OrganizationTable
          organizations={organizations}
          loading={loading}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}

export default OrganizationsTaxExcempt